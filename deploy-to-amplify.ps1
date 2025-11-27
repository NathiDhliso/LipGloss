# Deploy website to AWS Amplify
    
$APP_ID = "dbteqz16oed1p"
$BRANCH_NAME = "main"
$ZIP_FILE = ".\website.zip"
    
Write-Host "Deploying to Amplify App: $APP_ID"
Write-Host "Branch: $BRANCH_NAME"
    
# Create deployment
$uploadUrl = aws amplify create-deployment `
  --app-id $APP_ID `
  --branch-name $BRANCH_NAME `
  --region us-east-1 `
  --query 'zipUploadUrl' `
  --output text
    
# Upload zip file
Invoke-RestMethod -Uri $uploadUrl -Method Put -InFile $ZIP_FILE
    
Write-Host ""
Write-Host "Deployment initiated!"
Write-Host "View your app at: https://$BRANCH_NAME.dbteqz16oed1p.amplifyapp.com"
