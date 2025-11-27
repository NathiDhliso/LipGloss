# LipGloss Auto Spa - AWS Lambda + HubSpot CRM Integration

A modern, production-ready integration between your LipGloss Auto Spa website and HubSpot CRM using AWS Lambda and API Gateway, deployed with Terraform.

## 🏗️ Architecture

```
Website Form → API Gateway → Lambda Function → HubSpot CRM
                    ↓
              CloudWatch Logs
```

## 📋 Prerequisites

Before you begin, ensure you have:

- **AWS CLI** installed and configured (`aws configure`)
- **Terraform** >= 1.0 installed
- **Node.js** >= 20.x installed
- **HubSpot Developer API Key** (you have: `eu1-f994-fad9-499b-ba12-13a58ee93ebd`)
- **Bash** shell (Git Bash on Windows, or WSL)

## 🚀 Quick Start

### 1. Configure Terraform Variables

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` and update:
- `aws_region` - Your preferred AWS region
- `hubspot_api_key` - Your HubSpot API key (already filled in example)
- `cors_allowed_origins` - Your website domain (use `["*"]` for testing)

### 2. Deploy Infrastructure

Run the automated deployment script:

```bash
chmod +x deploy.sh
./deploy.sh
```

Or manually:

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### 3. Get Your API Endpoint

After deployment, Terraform will output your API Gateway endpoint:

```bash
terraform output api_endpoint
```

Example output:
```
https://abc123xyz.execute-api.us-east-1.amazonaws.com/create-contact
```

### 4. Update Website

Open `script.js` and replace the placeholder:

```javascript
const API_ENDPOINT = 'YOUR_API_GATEWAY_ENDPOINT_HERE';
```

With your actual endpoint:

```javascript
const API_ENDPOINT = 'https://abc123xyz.execute-api.us-east-1.amazonaws.com/create-contact';
```

### 5. Deploy Website

Upload your website files to your hosting provider:
- `index.html`
- `style.css`
- `script.js`
- `banner.jpg`

## 🧪 Testing

### Test Lambda Locally

```bash
cd lambda/create-contact

# Simulate a Lambda invocation
node -e "
const handler = require('./index').handler;
const event = {
  requestContext: { http: { method: 'POST' } },
  body: JSON.stringify({ name: 'Test User', phone: '1234567890' })
};
handler(event, {}, (err, result) => console.log(result));
"
```

### Test API Gateway Endpoint

Using curl:

```bash
curl -X POST https://YOUR_API_ENDPOINT_HERE \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","phone":"0821234567"}'
```

Using PowerShell:

```powershell
Invoke-RestMethod -Uri "https://YOUR_API_ENDPOINT_HERE" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"Test User","phone":"0821234567"}'
```

### Verify in HubSpot

1. Log into your HubSpot account
2. Navigate to **Contacts**
3. Look for the newly created contact
4. Verify the name and phone number are correct

## 📊 Monitoring

### View Lambda Logs

```bash
# Get log group name
terraform output cloudwatch_log_group

# View logs using AWS CLI
aws logs tail /aws/lambda/lipgloss-autospa-create-contact --follow
```

Or use the AWS Console:
1. Go to **CloudWatch > Log Groups**
2. Find `/aws/lambda/lipgloss-autospa-create-contact`
3. View recent log streams

### View API Gateway Logs

```bash
# Get API log group name
terraform output api_log_group

# View logs
aws logs tail /aws/apigateway/lipgloss-autospa --follow
```

## 🔧 Configuration

### Environment Variables (Lambda)

Set in `terraform/variables.tf`:
- `HUBSPOT_API_KEY` - Your HubSpot Developer API key (set via terraform.tfvars)

### CORS Configuration

Update `cors_allowed_origins` in `terraform.tfvars`:

```hcl
# For development (allow all origins)
cors_allowed_origins = ["*"]

# For production (specific domains only)
cors_allowed_origins = [
  "https://yourdomain.com",
  "https://www.yourdomain.com"
]
```

## 💰 Cost Estimate

AWS Free Tier includes:
- **Lambda**: 1M free requests/month + 400,000 GB-seconds compute
- **API Gateway**: 1M API calls/month (first 12 months)
- **CloudWatch Logs**: 5GB ingestion + 5GB storage

Expected monthly cost after free tier: **~$0-5** for typical small business usage.

## 🔒 Security Best Practices

1. **Never commit `terraform.tfvars`** - It contains your API key
2. **Restrict CORS** in production - Use specific domain(s)
3. **Use IAM roles** - Lambda has minimal permissions
4. **Enable CloudWatch** - Monitor for unusual activity
5. **Rotate API keys** - Periodically update HubSpot API key

## 🗑️ Cleanup

To destroy all AWS resources:

```bash
cd terraform
terraform destroy
```

**Warning**: This will permanently delete your Lambda function, API Gateway, and all logs.

## 📁 Project Structure

```
LipGloss/
├── index.html              # Website homepage
├── style.css               # Glossy design system
├── script.js               # Frontend with API integration
├── banner.jpg              # Hero image
├── deploy.sh               # Automated deployment script
├── lambda/
│   └── create-contact/
│       ├── index.js        # Lambda handler
│       └── package.json    # Lambda dependencies
└── terraform/
    ├── main.tf             # Infrastructure definition
    ├── variables.tf        # Input variables
    ├── outputs.tf          # Output values
    ├── terraform.tfvars.example  # Template
    └── terraform.tfvars    # Your config (gitignored)
```

## 🐛 Troubleshooting

### Issue: "Error: Unable to assume role"
**Solution**: Configure AWS CLI with `aws configure` and provide credentials.

### Issue: "API returns CORS error"
**Solution**: Update `cors_allowed_origins` in `terraform.tfvars` to include your domain.

### Issue: "Contact not created in HubSpot"
**Solution**: 
1. Check CloudWatch Logs for error messages
2. Verify HubSpot API key is correct
3. Ensure API key has "Contacts" write permissions

### Issue: "Lambda timeout"
**Solution**: Increase timeout in `terraform/main.tf` (currently 30 seconds).

## 📚 Additional Resources

- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [HubSpot CRM API Reference](https://developers.hubspot.com/docs/api/crm/contacts)
- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)
- [API Gateway HTTP API](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html)

## 🤝 Support

For issues with:
- **AWS/Terraform**: Check CloudWatch Logs and AWS documentation
- **HubSpot API**: Verify API key and permissions in HubSpot
- **Website**: Test locally and check browser console

---

Built with ❤️ for LipGloss Auto Spa
