# ============================================================================
# API Gateway HTTP API (v2) - REST API configuration
# ============================================================================

# HTTP API
resource "aws_apigatewayv2_api" "main" {
  name          = "${local.resource_prefix}-api"
  protocol_type = "HTTP"
  
  cors_configuration {
    allow_headers = ["Content-Type", "Authorization"]
    allow_methods = ["GET", "POST", "DELETE", "OPTIONS"]
    allow_origins = split(",", var.api_cors_origins)
    max_age       = 86400
  }

  tags = local.common_tags
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/aws/apigateway/${local.resource_prefix}"
  retention_in_days = var.cloudwatch_logs_retention_days

  tags = local.common_tags
}

# API Stage
resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = var.environment
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_logs.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ipAddress      = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
      integrationLatency = "$context.integration.latency"
      userAgent      = "$context.identity.userAgent"
    })
  }

  tags = local.common_tags
}

# ============================================================================
# Lambda Function URLs (Direct Invocation)
# ============================================================================
# Using Lambda Function URLs instead of API Gateway integrations
# Lambda URLs (defined in lambda.tf) provide direct public HTTP endpoints
# 
# Lambda Function URLs:
# - GET  /api/stocks/{symbol}              → aws_lambda_function_url.get_stock
# - GET  /api/stocks/market/overview       → aws_lambda_function_url.get_market_overview
# - GET  /api/stocks/{symbol}/history      → aws_lambda_function_url.get_price_history
# - POST /api/opinion/recommend            → aws_lambda_function_url.post_recommendation
# - GET  /api/watchlist                    → aws_lambda_function_url.get_watchlist
# - POST /api/watchlist                    → aws_lambda_function_url.post_watchlist
# - DELETE /api/watchlist/{symbol}         → aws_lambda_function_url.delete_watchlist
# - GET  /api/health                       → aws_lambda_function_url.health_check
#
# Clients can call these URLs directly without going through API Gateway
# ============================================================================

# ============================================================================
# Outputs - Lambda Function URLs (Primary API Endpoints)
# ============================================================================

output "lambda_function_urls" {
  value = {
    get_stock            = aws_lambda_function_url.get_stock.function_url
    get_market_overview  = aws_lambda_function_url.get_market_overview.function_url
    get_price_history    = aws_lambda_function_url.get_price_history.function_url
    post_recommendation  = aws_lambda_function_url.post_recommendation.function_url
    get_watchlist        = aws_lambda_function_url.get_watchlist.function_url
    post_watchlist       = aws_lambda_function_url.post_watchlist.function_url
    delete_watchlist     = aws_lambda_function_url.delete_watchlist.function_url
    health_check         = aws_lambda_function_url.health_check.function_url
  }
  description = "Lambda Function URLs - Direct API endpoints for frontend to call"
}

# API Gateway outputs (for reference/monitoring)
output "api_endpoint" {
  value       = "${aws_apigatewayv2_stage.main.invoke_url}"
  description = "API Gateway HTTP API endpoint URL (for monitoring/reference only)"
}

output "api_id" {
  value       = aws_apigatewayv2_api.main.id
  description = "API Gateway API ID"
}

output "api_stage_name" {
  value       = aws_apigatewayv2_stage.main.name
  description = "API Gateway stage name"
}
