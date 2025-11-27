# ===================================
# AWS Amplify Hosting
# ===================================

# Get current AWS account ID
data "aws_caller_identity" "current" {}

# AWS Amplify App (with GitHub integration)
resource "aws_amplify_app" "website" {
  name       = var.project_name
  repository = "https://github.com/NathiDhliso/LipGloss"

  # OAuth token for GitHub (will be passed via variable)
  access_token = var.github_token

  # Build specification for static site
  build_spec = <<-EOT
    version: 1
    frontend:
      phases:
        build:
          commands:
            - echo "Static site - no build needed"
      artifacts:
        baseDirectory: /
        files:
          - '**/*'
      cache:
        paths: []
  EOT

  # Custom rules for SPA routing
  custom_rule {
    source = "/<*>"
    status = "404"
    target = "/index.html"
  }

  custom_rule {
    source = "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|ttf|map|json)$)([^.]+$)/>"
    status = "200"
    target = "/index.html"
  }

  # Platform for web app
  platform = "WEB"

  # Enable auto-deployment from GitHub
  enable_auto_branch_creation = false
  enable_branch_auto_deletion = false

  tags = {
    Project = var.project_name
  }
}

# Amplify Branch (main) - Auto-deploy from GitHub
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.website.id
  branch_name = "main"

  framework = "React"  # Generic framework
  stage     = "PRODUCTION"

  # Enable auto-build on push to GitHub
  enable_auto_build = true

  tags = {
    Project = var.project_name
  }
}

# S3 Bucket for deployment artifacts
resource "aws_s3_bucket" "amplify_deployments" {
  bucket = "${var.project_name}-amplify-deploy-${data.aws_caller_identity.current.account_id}"

  tags = {
    Project = var.project_name
  }
}

# Upload website files as ZIP for manual deployment
data "archive_file" "website_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../"
  output_path = "${path.module}/website.zip"
  excludes    = ["terraform", ".terraform", "*.tf", "*.tfvars", "*.md", "lambda", "node_modules", ".git", "deploy.sh", "*.ts"]
}

# Upload zip to S3
resource "aws_s3_object" "website_zip" {
  bucket = aws_s3_bucket.amplify_deployments.id
  key    = "website-${data.archive_file.website_zip.output_md5}.zip"
  source = data.archive_file.website_zip.output_path
  etag   = data.archive_file.website_zip.output_md5
}

# Create deployment script
resource "local_file" "deploy_script" {
  filename = "${path.module}/../deploy-to-amplify.sh"
  
  content = <<-EOT
    #!/bin/bash
    # Deploy website to AWS Amplify
    
    APP_ID="${aws_amplify_app.website.id}"
    BRANCH_NAME="${aws_amplify_branch.main.branch_name}"
    ZIP_FILE="${data.archive_file.website_zip.output_path}"
    
    echo "Deploying to Amplify App: $APP_ID"
    echo "Branch: $BRANCH_NAME"
    
    # Create deployment
    aws amplify create-deployment \
      --app-id $APP_ID \
      --branch-name $BRANCH_NAME \
      --region ${var.aws_region} \
      --query 'zipUploadUrl' \
      --output text > /tmp/upload_url.txt
    
    UPLOAD_URL=$(cat /tmp/upload_url.txt)
    
    # Upload zip file
    curl -X PUT -T "$ZIP_FILE" "$UPLOAD_URL"
    
    echo ""
    echo "Deployment initiated!"
    echo "View your app at: https://$BRANCH_NAME.${aws_amplify_app.website.default_domain}"
  EOT
  
  file_permission = "0755"
}

# PowerShell deployment script for Windows
resource "local_file" "deploy_script_ps1" {
  filename = "${path.module}/../deploy-to-amplify.ps1"
  
  content = <<-EOT
    # Deploy website to AWS Amplify
    
    $APP_ID = "${aws_amplify_app.website.id}"
    $BRANCH_NAME = "${aws_amplify_branch.main.branch_name}"
    $ZIP_FILE = "${replace(data.archive_file.website_zip.output_path, "/", "\\")}"
    
    Write-Host "Deploying to Amplify App: $APP_ID"
    Write-Host "Branch: $BRANCH_NAME"
    
    # Create deployment
    $uploadUrl = aws amplify create-deployment `
      --app-id $APP_ID `
      --branch-name $BRANCH_NAME `
      --region ${var.aws_region} `
      --query 'zipUploadUrl' `
      --output text
    
    # Upload zip file
    Invoke-RestMethod -Uri $uploadUrl -Method Put -InFile $ZIP_FILE
    
    Write-Host ""
    Write-Host "Deployment initiated!"
    Write-Host "View your app at: https://$BRANCH_NAME.${aws_amplify_app.website.default_domain}"
  EOT
  
  file_permission = "0755"
}
