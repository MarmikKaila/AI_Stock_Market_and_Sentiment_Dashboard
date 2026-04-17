# ============================================================================
# AWS Deployment Script (PowerShell)
# Deploys Lambda functions, frontend, and validates deployment
# ============================================================================

param(
    [string]$Action = "deploy-all",
    [string]$Environment = "dev",
    [string]$Region = "us-east-1"
)

$ErrorActionPreference = "Stop"

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Stock Dashboard AWS Deployment Script                        ║" -ForegroundColor Cyan
Write-Host "╠════════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║ Action:      $Action" -ForegroundColor White
Write-Host "║ Environment: $Environment" -ForegroundColor White
Write-Host "║ Region:      $Region" -ForegroundColor White
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# ============================================================================
# Helper Functions
# ============================================================================

function Write-Step {
    param([string]$Message)
    Write-Host "`n[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "`n❌ ERROR: $Message" -ForegroundColor Red
    exit 1
}

function Write-Success {
    param([string]$Message)
    Write-Host "`n✅ $Message" -ForegroundColor Green
}

function Invoke-AWS-CLI {
    param(
        [string]$Command,
        [string]$Description
    )
    
    Write-Step $Description
    try {
        Invoke-Expression $Command
    } catch {
        Write-Error-Custom "Failed: $Description`nError: $_"
    }
}

# ============================================================================
# Terraform Functions
# ============================================================================

function Terraform-Init {
    Write-Step "Initializing Terraform"
    
    Push-Location -Path ".\aws\terraform"
    try {
        terraform init
        Write-Success "Terraform initialized"
    } catch {
        Write-Error-Custom "Terraform init failed: $_"
    } finally {
        Pop-Location
    }
}

function Terraform-Validate {
    Write-Step "Validating Terraform configuration"
    
    Push-Location -Path ".\aws\terraform"
    try {
        terraform validate
        Write-Success "Terraform configuration is valid"
    } catch {
        Write-Error-Custom "Terraform validation failed: $_"
    } finally {
        Pop-Location
    }
}

function Terraform-Plan {
    Write-Step "Planning Terraform deployment"
    
    Push-Location -Path ".\aws\terraform"
    try {
        terraform plan -out=tfplan
        Write-Success "Terraform plan created (tfplan)"
    } catch {
        Write-Error-Custom "Terraform plan failed: $_"
    } finally {
        Pop-Location
    }
}

function Terraform-Apply {
    Write-Step "Applying Terraform configuration"
    
    Push-Location -Path ".\aws\terraform"
    try {
        $response = Read-Host "This will create AWS resources. Continue? (yes/no)"
        if ($response -ne "yes") {
            Write-Host "Deployment cancelled" -ForegroundColor Yellow
            exit 0
        }
        
        terraform apply tfplan
        Write-Success "Terraform deployment complete"
    } catch {
        Write-Error-Custom "Terraform apply failed: $_"
    } finally {
        Pop-Location
    }
}

function Terraform-Output {
    Write-Step "Retrieving Terraform outputs"
    
    Push-Location -Path ".\aws\terraform"
    try {
        terraform output
    } catch {
        Write-Error-Custom "Failed to retrieve outputs: $_"
    } finally {
        Pop-Location
    }
}

# ============================================================================
# Lambda Functions
# ============================================================================

function Build-Lambda-Functions {
    Write-Step "Building Lambda functions"
    
    $lambdaDir = ".\aws\lambda"
    
    if (-not (Test-Path $lambdaDir)) {
        Write-Error-Custom "Lambda directory not found: $lambdaDir"
    }
    
    Push-Location -Path $lambdaDir
    try {
        $handlers = @(
            "get-stock",
            "get-market-overview",
            "get-price-history",
            "post-recommendation",
            "get-watchlist",
            "post-watchlist",
            "delete-watchlist",
            "health-check"
        )
        
        foreach ($handler in $handlers) {
            $file = "$handler.js"
            $zip = "$handler.zip"
            
            if (-not (Test-Path $file)) {
                Write-Host "⚠️  Skipping $file (not found)"
                continue
            }
            
            Write-Host "  Zipping: $file → $zip"
            Compress-Archive -Path $file -DestinationPath $zip -Force
        }
        
        Write-Success "Lambda functions built"
    } catch {
        Write-Error-Custom "Failed to build Lambda functions: $_"
    } finally {
        Pop-Location
    }
}

function Build-Lambda-Layer {
    Write-Step "Building Lambda layer"
    
    $layerDir = ".\aws\lambda-layers\nodejs"
    
    if (-not (Test-Path $layerDir)) {
        Write-Error-Custom "Lambda layer directory not found: $layerDir"
    }
    
    Push-Location -Path $layerDir
    try {
        # Install dependencies
        if (Test-Path "package.json") {
            Write-Host "  Installing node_modules..."
            npm install
        }
        
        Pop-Location
        
        # Create layer zip
        $layerPath = ".\aws\lambda-layers"
        Push-Location -Path $layerPath
        
        Write-Host "  Creating layer zip..."
        Compress-Archive -Path "nodejs" -DestinationPath "lambda-layer.zip" -Force
        
        # Copy to terraform directory
        Copy-Item -Path "lambda-layer.zip" -Destination "..\terraform\lambda-layer.zip" -Force
        
        Write-Success "Lambda layer built"
    } catch {
        Write-Error-Custom "Failed to build Lambda layer: $_"
    } finally {
        Pop-Location
    }
}

# ============================================================================
# Frontend Functions
# ============================================================================

function Build-Frontend {
    Write-Step "Building React frontend"
    
    Push-Location -Path ".\client"
    try {
        Write-Host "  Installing dependencies..."
        npm install
        
        Write-Host "  Building for production..."
        npm run build
        
        Write-Success "Frontend built (output: client/dist)"
    } catch {
        Write-Error-Custom "Failed to build frontend: $_"
    } finally {
        Pop-Location
    }
}

function Deploy-Frontend-To-S3 {
    Write-Step "Deploying frontend to S3"
    
    Push-Location -Path ".\aws\terraform"
    try {
        # Get S3 bucket name
        $s3Bucket = & terraform output -raw frontend_s3_bucket 2>$null
        
        if (-not $s3Bucket) {
            Write-Error-Custom "Could not retrieve S3 bucket name from Terraform outputs"
        }
        
        Write-Host "  S3 Bucket: $s3Bucket"
        
        Pop-Location
        
        # Upload files
        Write-Host "  Syncing files to S3..."
        Push-Location -Path ".\client\dist"
        
        aws s3 sync . s3://$s3Bucket/ --delete
        
        Write-Success "Frontend deployed to S3: s3://$s3Bucket"
    } catch {
        Write-Error-Custom "Failed to deploy frontend: $_"
    } finally {
        if ($PWD -match "dist") {
            Pop-Location
        }
        if ($PWD -match "terraform") {
            Pop-Location
        }
    }
}

function Invalidate-CloudFront {
    Write-Step "Invalidating CloudFront cache"
    
    Push-Location -Path ".\aws\terraform"
    try {
        # Get distribution ID
        $distributionId = & terraform output -raw frontend_cloudfront_distribution_id 2>$null
        
        if (-not $distributionId) {
            Write-Error-Custom "Could not retrieve CloudFront distribution ID"
        }
        
        Write-Host "  Distribution ID: $distributionId"
        Write-Host "  Creating invalidation..."
        
        aws cloudfront create-invalidation `
            --distribution-id $distributionId `
            --paths "/*"
        
        Write-Success "CloudFront cache invalidated"
    } catch {
        Write-Error-Custom "Failed to invalidate CloudFront: $_"
    } finally {
        Pop-Location
    }
}

# ============================================================================
# Testing Functions
# ============================================================================

function Test-Deployment {
    Write-Step "Testing deployment"
    
    Push-Location -Path ".\aws\terraform"
    try {
        $apiUrl = & terraform output -raw backend_api_endpoint 2>$null
        $cloudfrontUrl = & terraform output -raw frontend_cloudfront_url 2>$null
        
        if (-not $apiUrl) {
            Write-Error-Custom "Could not retrieve API endpoint"
        }
        
        Write-Host "`n  Testing API health check..."
        $healthResponse = Invoke-WebRequest -Uri "$apiUrl/api/health" -ErrorAction SilentlyContinue
        
        if ($healthResponse.StatusCode -eq 200) {
            Write-Success "✓ API health check passed"
        } else {
            Write-Host "⚠️  API health check returned: $($healthResponse.StatusCode)" -ForegroundColor Yellow
        }
        
        Write-Host "`n  Testing API stock endpoint..."
        $stockResponse = Invoke-WebRequest -Uri "$apiUrl/api/stocks/AAPL" -ErrorAction SilentlyContinue
        
        if ($stockResponse.StatusCode -eq 200) {
            Write-Success "✓ Stock endpoint working"
        } else {
            Write-Host "⚠️  Stock endpoint returned: $($stockResponse.StatusCode)" -ForegroundColor Yellow
        }
        
        Write-Host "`n  Frontend URL: $cloudfrontUrl" -ForegroundColor Cyan
        Write-Host "  (Open in browser to verify frontend deployment)" -ForegroundColor Gray
        
    } catch {
        Write-Host "⚠️  Testing encountered an error (this may be normal if services are still initializing): $_" -ForegroundColor Yellow
    } finally {
        Pop-Location
    }
}

function Show-Logs {
    Write-Step "Streaming CloudWatch logs"
    
    Write-Host "  Streaming Lambda logs (Ctrl+C to stop)..." -ForegroundColor Cyan
    
    try {
        aws logs tail /aws/lambda/stock-sentiment-dashboard-$Environment --follow
    } catch {
        Write-Host "⚠️  Could not stream logs: $_" -ForegroundColor Yellow
    }
}

# ============================================================================
# Main Deployment Flow
# ============================================================================

function Deploy-All {
    Write-Host "`n═════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "FULL DEPLOYMENT" -ForegroundColor Cyan
    Write-Host "═════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
    
    Terraform-Init
    Terraform-Validate
    Terraform-Plan
    Terraform-Apply
    Terraform-Output
    
    Build-Lambda-Functions
    Build-Lambda-Layer
    Build-Frontend
    
    Deploy-Frontend-To-S3
    Invalidate-CloudFront
    
    Test-Deployment
    
    Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                   DEPLOYMENT COMPLETE                         ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
}

function Deploy-Frontend-Only {
    Build-Frontend
    Deploy-Frontend-To-S3
    Invalidate-CloudFront
    Test-Deployment
}

function Deploy-Lambda-Only {
    Build-Lambda-Functions
    Build-Lambda-Layer
}

# ============================================================================
# Route to appropriate action
# ============================================================================

switch ($Action) {
    "deploy-all" { Deploy-All }
    "deploy-frontend" { Deploy-Frontend-Only }
    "deploy-lambda" { Deploy-Lambda-Only }
    "build-lambda" { Build-Lambda-Functions; Build-Lambda-Layer }
    "build-frontend" { Build-Frontend }
    "test" { Test-Deployment }
    "logs" { Show-Logs }
    "terraform-init" { Terraform-Init }
    "terraform-plan" { Terraform-Plan }
    "terraform-apply" { Terraform-Apply }
    "terraform-output" { Terraform-Output }
    default {
        Write-Host @"
Usage: .\deploy.ps1 -Action <action>

Actions:
  deploy-all              Deploy everything (full deployment)
  deploy-frontend         Deploy frontend only
  deploy-lambda           Deploy Lambda functions only
  build-lambda            Build Lambda functions (no deploy)
  build-frontend          Build frontend (no deploy)
  test                    Test deployment
  logs                    Stream CloudWatch logs
  terraform-init          Initialize Terraform
  terraform-plan          Plan Terraform changes
  terraform-apply         Apply Terraform changes
  terraform-output        Show Terraform outputs

Examples:
  .\deploy.ps1 -Action deploy-all
  .\deploy.ps1 -Action deploy-frontend
  .\deploy.ps1 -Action test -Environment prod
"@ -ForegroundColor Gray
    }
}

Pop-Location -ErrorAction SilentlyContinue
