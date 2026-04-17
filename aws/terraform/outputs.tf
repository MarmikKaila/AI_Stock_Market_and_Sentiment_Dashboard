# ============================================================================
# Terraform Outputs - Consolidated deployment info
# ============================================================================

output "deployment_summary" {
  value = <<-EOT
    ╔═══════════════════════════════════════════════════════════════════════╗
    ║        STOCK DASHBOARD AWS DEPLOYMENT - TERRAFORM OUTPUTS            ║
    ╠═══════════════════════════════════════════════════════════════════════╣
    ║ FRONTEND (S3 + CloudFront)                                           ║
    ║   CloudFront URL:  https://${aws_cloudfront_distribution.main.domain_name}
    ║   S3 Bucket:       ${aws_s3_bucket.frontend.bucket}
    ║                                                                       ║
    ║ BACKEND (Lambda Function URLs)                                       ║
    ║   Lambda Count:    8 functions with public URLs                      ║
    ║   Handler Size:    ~2MB per function                                 ║
    ║                                                                       ║
    ║ DATABASE (RDS PostgreSQL 15.3)                                       ║
    ║   Endpoint:        ${aws_db_instance.main.endpoint}
    ║   Database:        ${var.db_name}                                    ║
    ║   Instance:        ${aws_db_instance.main.instance_class}             ║
    ║   Storage:         ${aws_db_instance.main.allocated_storage}GB        ║
    ║                                                                       ║
    ║ MONITORING (CloudWatch)                                              ║
    ║   Dashboard:       ${aws_cloudwatch_dashboard.main.dashboard_name}
    ║   Log Groups:      3 (/aws/lambda, /aws/apigateway, /aws/rds)        ║
    ║   Alarms:          6 critical + 1 composite                          ║
    ║                                                                       ║
    ║ SECURITY                                                              ║
    ║   API Keys:        ${aws_secretsmanager_secret.api_keys.name}
    ║   DB Creds:        ${aws_secretsmanager_secret.db_credentials.name}
    ║   IAM Roles:       4 (Lambda, RDS Proxy, API Gateway, CloudFront)    ║
    ║                                                                       ║
    ║ REGION & ACCOUNT                                                     ║
    ║   Region:          ${data.aws_region.current.name}                   ║
    ║   Account ID:      ${data.aws_caller_identity.current.account_id}    ║
    ║                                                                       ║
    ║ COST ESTIMATE (Monthly)                                              ║
    ║   RDS (db.t3.micro):  ~$15                                           ║
    ║   Lambda:             ~$1 (within free tier)                         ║
    ║   API Gateway:        ~$4 (3.5M requests @ $1.25/M)                  ║
    ║   S3:                 ~$1 (minimal storage)                          ║
    ║   CloudFront:         Variable (~$0.085/GB)                          ║
    ║   CloudWatch:         ~$5 (logs + metrics)                           ║
    ║   ─────────────────────────────────────────────────────              ║
    ║   TOTAL:              ~$25-35/month                                   ║
    ║                                                                       ║
    ╠═══════════════════════════════════════════════════════════════════════╣
    ║ NEXT STEPS                                                            ║
    ║ 1. Update API keys in Secrets Manager                                ║
    ║ 2. Build & deploy Lambda functions: bash ./deploy-lambda.sh          ║
    ║ 3. Build & deploy frontend: bash ./deploy-frontend.sh                ║
    ║ 4. Test API health: curl ${aws_apigatewayv2_stage.main.invoke_url}/api/health
    ║ 5. Access dashboard: https://${aws_cloudfront_distribution.main.domain_name}
    ║                                                                       ║
    ║ MONITORING                                                            ║
    ║ Dashboard: https://console.aws.amazon.com/cloudwatch/home?region=${data.aws_region.current.name}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}
    ║                                                                       ║
    ║ To destroy: terraform destroy                                        ║
    ╚═══════════════════════════════════════════════════════════════════════╝
  EOT
  
  description = "Comprehensive deployment summary"
}

# ============================================================================
# Frontend Outputs
# ============================================================================

output "frontend_cloudfront_url" {
  value       = "https://${aws_cloudfront_distribution.main.domain_name}"
  description = "Public URL for accessing the React frontend"
}

output "frontend_s3_bucket" {
  value       = aws_s3_bucket.frontend.bucket
  description = "S3 bucket name for frontend files"
}

output "frontend_cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.main.id
  description = "CloudFront distribution ID (for cache invalidation)"
}

# ============================================================================
# Backend Outputs
# ============================================================================

output "backend_api_endpoint" {
  value       = aws_apigatewayv2_stage.main.invoke_url
  description = "API Gateway endpoint base URL"
}

output "backend_api_id" {
  value       = aws_apigatewayv2_api.main.id
  description = "API Gateway API ID"
}

output "backend_lambda_functions" {
  value = {
    get_stock            = aws_lambda_function.get_stock.function_name
    get_market_overview  = aws_lambda_function.get_market_overview.function_name
    get_price_history    = aws_lambda_function.get_price_history.function_name
    post_recommendation  = aws_lambda_function.post_recommendation.function_name
    get_watchlist        = aws_lambda_function.get_watchlist.function_name
    post_watchlist       = aws_lambda_function.post_watchlist.function_name
    delete_watchlist     = aws_lambda_function.delete_watchlist.function_name
    health_check         = aws_lambda_function.health_check.function_name
  }
  description = "Lambda function names"
}

# ============================================================================
# Database Outputs
# ============================================================================

output "database_rds_endpoint" {
  value       = aws_db_instance.main.endpoint
  description = "Direct RDS endpoint (for troubleshooting)"
}

output "database_name" {
  value       = var.db_name
  description = "PostgreSQL database name"
}

output "database_username" {
  value       = "postgres"
  description = "Default database username"
}

output "database_port" {
  value       = 5432
  description = "Database port"
}

# ============================================================================
# Security Outputs
# ============================================================================

output "secrets_manager_api_keys_arn" {
  value       = aws_secretsmanager_secret.api_keys.arn
  description = "ARN of API keys secret in Secrets Manager"
  sensitive   = false
}

output "secrets_manager_db_credentials_arn" {
  value       = aws_secretsmanager_secret.db_credentials.arn
  description = "ARN of database credentials secret"
  sensitive   = false
}

output "iam_lambda_role_arn" {
  value       = aws_iam_role.lambda_role.arn
  description = "ARN of Lambda execution role"
}

# ============================================================================
# Monitoring Outputs
# ============================================================================

output "cloudwatch_dashboard_name" {
  value       = aws_cloudwatch_dashboard.main.dashboard_name
  description = "CloudWatch dashboard name"
}

output "cloudwatch_dashboard_url" {
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${data.aws_region.current.name}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
  description = "Direct link to CloudWatch dashboard"
}

output "cloudwatch_log_groups" {
  value = {
    lambda    = aws_cloudwatch_log_group.lambda_logs.name
    apigateway = aws_cloudwatch_log_group.api_logs.name
  }
  description = "CloudWatch log group names"
}

output "cloudwatch_alarms" {
  value = {
    lambda_errors           = aws_cloudwatch_metric_alarm.lambda_errors.alarm_name
    api_latency             = aws_cloudwatch_metric_alarm.api_latency.alarm_name
    rds_cpu                 = aws_cloudwatch_metric_alarm.rds_cpu.alarm_name
    api_4xx_errors          = aws_cloudwatch_metric_alarm.api_4xx_errors.alarm_name
    api_5xx_errors          = aws_cloudwatch_metric_alarm.api_5xx_errors.alarm_name
  }
  description = "CloudWatch alarm names"
}

# ============================================================================
# Infrastructure Info
# ============================================================================

output "terraform_version" {
  value       = "~> 1.0"
  description = "Required Terraform version"
}

# ============================================================================
# Testing Commands
# ============================================================================

output "test_commands" {
  value = <<-EOT
    # Test API endpoints:
    
    # 1. Health check
    curl -X GET "${aws_apigatewayv2_stage.main.invoke_url}/api/health"
    
    # 2. Get stock (mock data for now)
    curl -X GET "${aws_apigatewayv2_stage.main.invoke_url}/api/stocks/AAPL"
    
    # 3. Get market overview
    curl -X GET "${aws_apigatewayv2_stage.main.invoke_url}/api/stocks/market/overview"
    
    # 4. Get price history
    curl -X GET "${aws_apigatewayv2_stage.main.invoke_url}/api/stocks/AAPL/history?range=30d"
    
    # 5. Access frontend
    open "https://${aws_cloudfront_distribution.main.domain_name}"
    
    # 6. View CloudWatch logs
    aws logs tail ${aws_cloudwatch_log_group.lambda_logs.name} --follow
    
    # 7. Invalidate CloudFront cache
    aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.main.id} --paths "/*"
  EOT
  
  description = "Useful testing and management commands"
}
