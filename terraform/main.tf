terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Archive Lambda function code
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/create-contact"
  output_path = "${path.module}/lambda-function.zip"
  excludes    = ["node_modules"]
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"

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

  tags = {
    Project = var.project_name
  }
}

# Attach Basic Lambda Execution Policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_role.name
}

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.project_name}-create-contact"
  retention_in_days = 7

  tags = {
    Project = var.project_name
  }
}

# Lambda Function
resource "aws_lambda_function" "create_contact" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.project_name}-create-contact"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 30

  environment {
    variables = {
      HUBSPOT_API_KEY = var.hubspot_api_key
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda_logs,
    aws_iam_role_policy_attachment.lambda_basic
  ]

  tags = {
    Project = var.project_name
  }
}

# API Gateway HTTP API
resource "aws_apigatewayv2_api" "http_api" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = var.cors_allowed_origins
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["Content-Type"]
    max_age       = 300
  }

  tags = {
    Project = var.project_name
  }
}

# API Gateway Integration with Lambda
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.http_api.id
  integration_type = "AWS_PROXY"

  integration_method = "POST"
  integration_uri    = aws_lambda_function.create_contact.invoke_arn
  payload_format_version = "2.0"
}

# API Gateway Route
resource "aws_apigatewayv2_route" "create_contact_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /create-contact"

  target = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# API Gateway Stage
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_logs.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }

  tags = {
    Project = var.project_name
  }
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/aws/apigateway/${var.project_name}"
  retention_in_days = 7

  tags = {
    Project = var.project_name
  }
}

# Lambda Permission for API Gateway
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_contact.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}
