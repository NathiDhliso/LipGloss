output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = "${aws_apigatewayv2_api.http_api.api_endpoint}/create-contact"
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.create_contact.function_name
}

output "lambda_function_arn" {
  description = "Lambda function ARN"
  value       = aws_lambda_function.create_contact.arn
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group name for Lambda"
  value       = aws_cloudwatch_log_group.lambda_logs.name
}

output "api_log_group" {
  description = "CloudWatch log group name for API Gateway"
  value       = aws_cloudwatch_log_group.api_logs.name
}

output "amplify_app_url" {
  description = "Amplify App URL"
  value       = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.website.default_domain}"
}

output "amplify_app_id" {
  description = "Amplify App ID"
  value       = aws_amplify_app.website.id
}

output "amplify_deploy_command" {
  description = "Command to deploy website to Amplify"
  value       = "Run: .\\deploy-to-amplify.ps1 (PowerShell) or ./deploy-to-amplify.sh (Bash)"
}
