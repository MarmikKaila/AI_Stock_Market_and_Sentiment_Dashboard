# AWS Deployment Guide - Stock Market Sentiment Dashboard

## Overview

This guide walks through deploying the Stock Market Sentiment Dashboard to AWS using Terraform and deployment scripts.

**Timeline**: ~30 minutes (assuming AWS account exists)  
**Cost**: **~$0.80-1.50/month** (OPTIMIZED FOR FREE TIER! ✅)
  - ✅ Lambda: FREE (1M requests/month)
  - ✅ API Gateway: FREE (1M requests/month)
  - ✅ RDS db.t3.micro: FREE (750 hours/month)
  - ✅ S3: FREE (5GB storage)
  - ✅ CloudFront: FREE (50GB/month data transfer)
  - ✅ CloudWatch: Minimal ($0-0.50/month)
  - ⚠️ Secrets Manager: $0.80/month (2 secrets)  
**Regions**: `us-east-1` (default, change in `terraform.tfvars` if needed)

---

## Prerequisites

### 1. AWS Account Setup

```bash
# Create AWS account (if needed)
# Navigate to: https://aws.amazon.com/

# Configure AWS CLI
aws configure
# - AWS Access Key ID: [your key]
# - AWS Secret Access Key: [your secret]
# - Default region: us-east-1
# - Default output format: json

# Verify setup
aws sts get-caller-identity
```

### 2. Install Required Tools

```bash
# Terraform (Windows)
choco install terraform  # or download from terraform.io

# AWS CLI
choco install awscli     # or download from aws.amazon.com

# Node.js 18+ (for Lambda functions)
choco install nodejs     # or download from nodejs.org

# Verify installations
terraform -version
aws --version
node --version
```

### 3. Repository Structure

```
aws/
├── terraform/           # Terraform IaC files
│   ├── main.tf
│   ├── variables.tf
│   ├── iam.tf
│   ├── secrets.tf
│   ├── rds.tf
│   ├── lambda.tf
│   ├── apigateway.tf
│   ├── s3.tf
│   ├── cloudfront.tf
│   ├── cloudwatch.tf
│   ├── outputs.tf
│   ├── terraform.tfvars     # (CREATE THIS - see next section)
│   └── terraform.tfstate    # (AUTO-GENERATED)
├── lambda/              # Lambda function handlers
│   ├── get-stock.js
│   ├── get-market-overview.js
│   ├── ... (8 handlers total)
│   └── __tests__/
├── lambda-layers/       # Shared dependencies
│   └── nodejs/
│       ├── package.json
│       └── db-connection.js
└── DEPLOYMENT.md        # This file
```

---

## Step 1: Create Terraform Variables File

Create `aws/terraform/terraform.tfvars`:

```hcl
# AWS Configuration
aws_region  = "us-east-1"
app_name    = "stock-sentiment-dashboard"
environment = "dev"

# Lambda Configuration
lambda_timeout    = 30
lambda_memory_size = 512

# Database Configuration (Free Tier)
db_name                = "stockdb"
db_allocated_storage   = 20  # Free tier: 20GB included

# CloudWatch
cloudwatch_logs_retention_days = 30

# CORS (add your frontend domain in production)
api_cors_origins = "http://localhost:5173,http://localhost:3000"

# Tags (customize as needed)
tags = {
  Project     = "Stock Market Sentiment Dashboard"
  Environment = "dev"
  ManagedBy   = "Terraform"
  Owner       = "Your Name"
}
```

**IMPORTANT**: Add `terraform.tfvars` to `.gitignore` (contains sensitive data)

```bash
echo "terraform.tfvars" >> .gitignore
```

---

## Step 2: Initialize Terraform

```bash
cd aws/terraform

# Download provider plugins
terraform init

# Verify configuration
terraform validate

# Review changes (DRY RUN)
terraform plan -out=tfplan
```

**Expected Output**:
- Adding 50+ AWS resources (Lambda, API Gateway, RDS, S3, CloudFront, etc.)
- Plan file saved to `tfplan`

---

## Step 3: Deploy Infrastructure

```bash
# Apply Terraform plan
terraform apply tfplan

# Or apply without plan file (not recommended for production)
# terraform apply
```

**IMPORTANT**: Type "yes" when prompted.

**Output**: Terraform will display all endpoint URLs and resource info.

**Save the outputs**:
```bash
# Extract important values
terraform output -json > deployment-outputs.json

# View specific outputs
terraform output backend_api_endpoint
terraform output frontend_cloudfront_url
terraform output database_proxy_endpoint
```

---

## Step 4: Update Secrets (API Keys & Credentials)

### Option A: AWS Console

1. Navigate to AWS Secrets Manager
2. Find secret: `stock-sentiment-dashboard-dev/api-keys`
3. Edit secret and add your actual keys:
   - `gemini_api_key`
   - `alpha_vantage_api_key`
   - `newsapi_key`

### Option B: AWS CLI

```bash
# Update secrets
aws secretsmanager update-secret \
  --secret-id stock-sentiment-dashboard-dev/api-keys \
  --secret-string '{
    "gemini_api_key": "YOUR_ACTUAL_GEMINI_KEY",
    "alpha_vantage_api_key": "YOUR_ACTUAL_AV_KEY",
    "newsapi_key": "YOUR_ACTUAL_NEWSAPI_KEY",
    "mongodb_uri": "YOUR_MONGODB_URI"
  }'

# Verify
aws secretsmanager get-secret-value \
  --secret-id stock-sentiment-dashboard-dev/api-keys \
  --query SecretString --output text
```

---

## Step 5: Deploy Lambda Functions

### Build Lambda Functions

```bash
cd ../../aws/lambda

# Install dependencies (if needed locally)
npm install

# Zip each Lambda function
Compress-Archive -Path get-stock.js -DestinationPath get-stock.zip -Force
Compress-Archive -Path get-market-overview.js -DestinationPath get-market-overview.zip -Force
Compress-Archive -Path get-price-history.js -DestinationPath get-price-history.zip -Force
Compress-Archive -Path post-recommendation.js -DestinationPath post-recommendation.zip -Force
Compress-Archive -Path get-watchlist.js -DestinationPath get-watchlist.zip -Force
Compress-Archive -Path post-watchlist.js -DestinationPath post-watchlist.zip -Force
Compress-Archive -Path delete-watchlist.js -DestinationPath delete-watchlist.zip -Force
Compress-Archive -Path health-check.js -DestinationPath health-check.zip -Force

# Verify zips
ls *.zip
```

### Build Lambda Layer

```bash
cd ../lambda-layers/nodejs

# Install dependencies
npm install

# Create layer zip structure
mkdir -p nodejs/node_modules
# (copy node_modules contents into nodejs/node_modules)

# Zip layer
cd ..
Compress-Archive -Path nodejs -DestinationPath lambda-layer.zip -Force

# Move to terraform directory
Move-Item -Path lambda-layer.zip -Destination ../../terraform/lambda-layer.zip -Force
```

### Update Lambda Functions in Terraform

```bash
cd ../../terraform

# Update Lambda function code
terraform plan -out=tfplan-lambda -target=aws_lambda_function.get_stock
terraform apply tfplan-lambda

# Repeat for other Lambda functions or update all at once:
terraform plan -out=tfplan-update
terraform apply tfplan-update
```

---

## Step 6: Build & Deploy Frontend

### Build React App

```bash
cd ../../client

# Install dependencies
npm install

# Build for production
npm run build

# Output: client/dist/

# Verify build
ls -la dist/
```

### Upload to S3

```bash
# Get S3 bucket name from Terraform output
$S3_BUCKET = terraform output -raw frontend_s3_bucket

# Sync dist/ to S3
aws s3 sync dist/ s3://$S3_BUCKET/ --delete --acl public-read

# Verify upload
aws s3 ls s3://$S3_BUCKET/ --recursive
```

### Invalidate CloudFront Cache

```bash
# Get CloudFront distribution ID
$DISTRIBUTION_ID = terraform output -raw frontend_cloudfront_distribution_id

# Invalidate all files
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

# Check invalidation status
aws cloudfront list-invalidations --distribution-id $DISTRIBUTION_ID
```

---

## Step 7: Test Deployment

### Test API Endpoints

```bash
# Get API endpoint
$API_URL = terraform output -raw backend_api_endpoint

# 1. Health check
curl -X GET "$API_URL/api/health"

# 2. Get stock (should return mock data)
curl -X GET "$API_URL/api/stocks/AAPL"

# 3. Market overview
curl -X GET "$API_URL/api/stocks/market/overview"

# 4. Price history
curl -X GET "$API_URL/api/stocks/AAPL/history?range=30d"

# 5. Test with real request (verbose)
curl -v -X GET "$API_URL/api/stocks/MSFT" \
  -H "Content-Type: application/json"
```

**Expected Responses**: 200 OK with JSON data

### Test Frontend

```bash
# Get CloudFront URL
$CLOUDFRONT_URL = terraform output -raw frontend_cloudfront_url

# Open in browser
Start-Process "$CLOUDFRONT_URL"

# Or from command line
curl -I $CLOUDFRONT_URL

# Expected: 200 OK + CloudFront headers
```

### View CloudWatch Logs

```bash
# Stream Lambda logs
aws logs tail /aws/lambda/stock-sentiment-dashboard-dev --follow

# Stream API Gateway logs
aws logs tail /aws/apigateway/stock-sentiment-dashboard-dev --follow

# Search for errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/stock-sentiment-dashboard-dev \
  --filter-pattern "ERROR\|error\|Exception"
```

### Check CloudWatch Dashboard

1. Navigate to CloudWatch Console
2. Dashboards → `stock-sentiment-dashboard-dev-dashboard`
3. Verify metrics are displaying

---

## Step 8: Monitor Alarms

```bash
# List all alarms
aws cloudwatch describe-alarms \
  --query 'MetricAlarms[].{Name:AlarmName,State:StateValue}' \
  --output table

# Get alarm status
aws cloudwatch describe-alarms \
  --alarm-names stock-sentiment-dashboard-dev-lambda-errors

# Test an alarm (optional)
aws cloudwatch set-alarm-state \
  --alarm-name stock-sentiment-dashboard-dev-api-latency \
  --state-value ALARM \
  --state-reason "Testing alarm"
```

---

## Step 9: Cost Monitoring

```bash
# Estimate monthly costs
aws ce get-cost-and-usage \
  --time-period Start=2026-04-01,End=2026-04-30 \
  --granularity MONTHLY \
  --metrics BlendedCost --query 'ResultsByTime[0].Total.BlendedCost'

# Set up cost anomaly detection
aws ce create-anomaly-monitor \
  --anomaly-monitor '{
    "MonitorName": "StockDashboard",
    "MonitorType": "DIMENSIONAL",
    "MonitorSpecification": "{\"Tags\": {\"key\": \"Environment\", \"values\": [\"dev\"]}}"
  }'
```

---

## Cleanup & Teardown

### Destroy All Resources

```bash
cd aws/terraform

# WARNING: This cannot be undone for dev environment
# For production, skip --force-destroy for safety

# Plan destruction
terraform plan -destroy -out=tfplan-destroy

# Apply destruction
terraform apply tfplan-destroy

# Remove local state files (optional)
rm -Force terraform.tfstate*
rm -Force .terraform/
```

### Manual Cleanup (if Terraform fails)

```bash
# Empty S3 bucket before deletion (required)
aws s3 rm s3://bucket-name --recursive

# Delete RDS snapshot (optional)
aws rds delete-db-snapshot --db-snapshot-identifier my-snapshot

# Remove Secrets Manager secrets
aws secretsmanager delete-secret \
  --secret-id stock-sentiment-dashboard-dev/api-keys \
  --force-delete-without-recovery
```

---

## Troubleshooting

### Lambda Function Errors

```bash
# Check function logs
aws logs tail /aws/lambda/stock-sentiment-dashboard-dev-get-stock --follow

# Test function directly
aws lambda invoke \
  --function-name stock-sentiment-dashboard-dev-get-stock \
  --payload '{"pathParameters":{"symbol":"AAPL"}}' \
  response.json && cat response.json
```

### RDS Connection Issues

```bash
# Get RDS endpoint from Terraform
cd aws/terraform
RDS_ENDPOINT=$(terraform output -raw rds_address)
echo "RDS Endpoint: $RDS_ENDPOINT"

# Test direct RDS connection
psql -h $RDS_ENDPOINT -U postgres -d stockdb

# Or using AWS CLI to verify security group
aws rds describe-db-instances --query 'DBInstances[0].[Endpoint.Address,DBInstanceStatus]'
```

### CloudFront Cache Issues

```bash
# Check CloudFront distribution
aws cloudfront get-distribution \
  --id $(terraform output -raw frontend_cloudfront_distribution_id)

# List cache behaviors
aws cloudfront get-distribution-config \
  --id $(terraform output -raw frontend_cloudfront_distribution_id) \
  --query 'DistributionConfig.CacheBehaviors'

# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id $(terraform output -raw frontend_cloudfront_distribution_id) \
  --paths "/*"
```

### API Gateway 502 Bad Gateway

**Causes**:
- Lambda timeout (increase in Terraform: `lambda_timeout`)
- Lambda out of memory (increase `lambda_memory_size`)
- RDS connection issues or security group restrictions
- Secrets Manager access denied

**Fix**:
```bash
# Check Lambda logs
aws logs tail /aws/lambda/stock-sentiment-dashboard-dev --follow

# Increase resources
terraform apply -var="lambda_timeout=60" -var="lambda_memory_size=1024"

# Verify database connectivity
aws rds describe-db-instances --query 'DBInstances[0].[DBInstanceStatus,Endpoint.Address]'
```

---

## Production Deployment Checklist

- [ ] Use production domain name (not CloudFront URL)
- [ ] Enable SSL/TLS certificate (ACM)
- [ ] Enable RDS multi-AZ for high availability
- [ ] Configure RDS backups and retention
- [ ] Set up SNS topics for alarm notifications
- [ ] Enable VPC security groups (restrict CIDR blocks)
- [ ] Enable database encryption at rest
- [ ] Enable CloudTrail for audit logging
- [ ] Remove public access from RDS
- [ ] Use IAM database authentication
- [ ] Implement API key rotation policy
- [ ] Set up real-time log streaming to S3/CloudWatch Logs
- [ ] Configure DDoS protection (AWS Shield)
- [ ] Review and restrict IAM permissions

---

## Quick Reference Commands

```bash
# Terraform
cd aws/terraform
terraform init              # Initialize
terraform validate          # Check syntax
terraform plan             # Review changes
terraform apply            # Deploy
terraform destroy          # Clean up
terraform output           # Show deployment info

# AWS CLI
aws s3 sync dist/ s3://bucket-name/
aws cloudfront create-invalidation --distribution-id ID --paths "/*"
aws logs tail /aws/lambda/function-name --follow
aws lambda invoke --function-name name response.json

# Node.js / npm
npm install                # Install dependencies
npm run build              # Build frontend
npm test                   # Run tests
```

---

## Support

For issues or questions:
1. Check CloudWatch logs
2. Review Terraform outputs
3. Verify AWS credentials: `aws sts get-caller-identity`
4. Check AWS service limits and quotas
5. See error messages in AWS Console

---

**Created**: April 17, 2026  
**Last Updated**: April 17, 2026
