#!/bin/bash

# LipGloss Auto Spa - Deployment Script
# This script packages the Lambda function and deploys infrastructure via Terraform

set -e  # Exit on error

echo "========================================="
echo "LipGloss Auto Spa - AWS Deployment"
echo "========================================="

# Check prerequisites
echo ""
echo "Checking prerequisites..."

if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform is not installed. Please install Terraform first."
    exit 1
fi

if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install AWS CLI first."
    exit 1
fi

echo "✅ All prerequisites met"

# Navigate to project root
cd "$(dirname "$0")"

# Step 1: Package Lambda function
echo ""
echo "Step 1: Packaging Lambda function..."
cd lambda/create-contact

# No dependencies to install (using native Node.js https module)
echo "✅ Lambda function ready (no dependencies needed)"

cd ../..

# Step 2: Copy terraform.tfvars.example if terraform.tfvars doesn't exist
echo ""
echo "Step 2: Checking Terraform variables..."
cd terraform

if [ ! -f "terraform.tfvars" ]; then
    echo "⚠️  terraform.tfvars not found"
    if [ -f "terraform.tfvars.example" ]; then
        cp terraform.tfvars.example terraform.tfvars
        echo "✅ Created terraform.tfvars from example"
        echo "⚠️  Please update terraform.tfvars with your actual values before deploying"
        exit 0
    else
        echo "❌ terraform.tfvars.example not found"
        exit 1
    fi
else
    echo "✅ terraform.tfvars found"
fi

# Step 3: Initialize Terraform
echo ""
echo "Step 3: Initializing Terraform..."
terraform init

# Step 4: Validate Terraform configuration
echo ""
echo "Step 4: Validating Terraform configuration..."
terraform validate

# Step 5: Plan infrastructure
echo ""
echo "Step 5: Planning infrastructure changes..."
terraform plan -out=tfplan

# Step 6: Apply infrastructure (with confirmation)
echo ""
echo "Step 6: Applying infrastructure..."
read -p "Do you want to deploy these changes? (yes/no): " confirm

if [ "$confirm" == "yes" ]; then
    terraform apply tfplan
    rm tfplan
    
    echo ""
    echo "========================================="
    echo "✅ Deployment Complete!"
    echo "========================================="
    echo ""
    echo "Your API endpoint:"
    terraform output -raw api_endpoint
    echo ""
    echo ""
    echo "Next steps:"
    echo "1. Copy the API endpoint URL above"
    echo "2. Update script.js and replace 'YOUR_API_GATEWAY_ENDPOINT_HERE' with this URL"
    echo "3. Deploy your website to your hosting provider"
    echo ""
else
    echo "Deployment cancelled"
    rm tfplan
fi

cd ..
