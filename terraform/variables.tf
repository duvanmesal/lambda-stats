variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "url-shortener"
}

variable "environment" {
  description = "Environment (dev, prod)"
  type        = string
  default     = "dev"
}

variable "lambda_zip_path" {
  type = string
  description = "Path to the Lambda ZIP file"
}

variable "dynamodb_table_name" {
  type = string
  description = "Name of the DynamoDB table"
}

variable "dynamodb_table_arn" {
  type = string
  description = "ARN of the DynamoDB table"
}

variable "api_gateway_id" {
  type = string
  description = "API Gateway ID"
}

variable "api_gateway_execution_arn" {
  type = string
  description = "API Gateway execution ARN"
}
