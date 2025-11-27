terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region  = var.aws_region
}

locals {
  dynamodb_table_name = "url-shortener-short-urls-dev"
  dynamodb_table_arn  = "arn:aws:dynamodb:us-east-1:251761522342:table/url-shortener-short-urls-dev"

  api_gateway_id            = "4sxlb64vig"
  api_gateway_execution_arn = "arn:aws:execute-api:us-east-1:251761522342:4sxlb64vig"
}

resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-stats-lambda-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Policy para leer info de la tabla (stats)
resource "aws_iam_role_policy" "lambda_dynamodb_policy" {
  name = "${var.project_name}-stats-dynamodb-policy-${var.environment}"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          local.dynamodb_table_arn
        ]
      }
    ]
  })
}

# Logs básicos
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_role.name
}

resource "aws_lambda_function" "stats_lambda" {
  function_name = "${var.project_name}-stats-${var.environment}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"

  filename         = "${path.module}/../build/stats-lambda.zip"
  source_code_hash = filebase64sha256("${path.module}/../build/stats-lambda.zip")

  timeout     = 30
  memory_size = 512

  environment {
    variables = {
      DYNAMODB_TABLE = local.dynamodb_table_name
      NODE_ENV       = var.environment
    }
  }

  tags = {
    Project     = var.project_name
    Module      = "3"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${aws_lambda_function.stats_lambda.function_name}"
  retention_in_days = 7
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id                 = local.api_gateway_id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.stats_lambda.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "stats_route" {
  api_id    = local.api_gateway_id
  route_key = "GET /stats/{code}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_lambda_permission" "api_gateway_invoke" {
  statement_id  = "AllowAPIGatewayInvokeStats"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.stats_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${local.api_gateway_execution_arn}/*/*"
}
