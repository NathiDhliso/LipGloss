#!/bin/bash
# Deploy website to AWS Amplify
    
APP_ID="dbteqz16oed1p"
BRANCH_NAME="main"
ZIP_FILE="./website.zip"
    
echo "Deploying to Amplify App: $APP_ID"
echo "Branch: $BRANCH_NAME"
    
# Create deployment
aws amplify create-deployment \
  --app-id $APP_ID \
  --branch-name $BRANCH_NAME \
  --region us-east-1 \
  --query 'zipUploadUrl' \
  --output text > /tmp/upload_url.txt
    
UPLOAD_URL=$(cat /tmp/upload_url.txt)
    
# Upload zip file
curl -X PUT -T "$ZIP_FILE" "$UPLOAD_URL"
    
echo ""
echo "Deployment initiated!"
echo "View your app at: https://$BRANCH_NAME.dbteqz16oed1p.amplifyapp.com"
