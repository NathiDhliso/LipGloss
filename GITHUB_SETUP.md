# GitHub to AWS Amplify CI/CD Setup

## Step 1: Create GitHub Personal Access Token

1. Go to GitHub Settings: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Name: `AWS Amplify Access`
4. Expiration: Choose your preference (90 days recommended)
5. Select scopes:
   - ✅ `repo` (Full control of private repositories)
6. Click **"Generate token"**
7. **COPY THE TOKEN** - You won't see it again!

## Step 2: Update Terraform Variables

Add this line to `terraform/terraform.tfvars`:

```hcl
github_token = "YOUR_GITHUB_TOKEN_HERE"
```

## Step 3: Push Code to GitHub

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit - LipGloss Auto Spa with AWS integration"

# Push to GitHub
git push -u origin main
```

## Step 4: Deploy Updated Amplify with GitHub Integration

```bash
cd terraform
terraform apply
```

This will:
- Connect your Amplify app to GitHub
- Enable automatic deployments on every push
- Build and deploy your website automatically

## Step 5: Test Auto-Deployment

After setup, any time you push to GitHub:

```bash
# Make a change
echo "Updated" >> index.html

# Commit and push
git add .
git commit -m "Update website"
git push

# Amplify will automatically deploy!
```

Watch the deployment in the [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
