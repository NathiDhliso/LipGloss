variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "lipgloss-autospa"
}

variable "hubspot_api_key" {
  description = "HubSpot Developer API Key"
  type        = string
  sensitive   = true
}

variable "cors_allowed_origins" {
  description = "List of allowed origins for CORS"
  type        = list(string)
  default     = ["*"]  # Replace with your domain in production: ["https://yourdomain.com"]
}

variable "github_token" {
  description = "GitHub Personal Access Token for Amplify"
  type        = string
  sensitive   = true
}
