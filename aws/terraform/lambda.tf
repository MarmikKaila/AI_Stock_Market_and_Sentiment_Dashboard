# ============================================================================
# AWS Lambda Functions for Stock Dashboard API
# ============================================================================

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${local.resource_prefix}"
  retention_in_days = var.cloudwatch_logs_retention_days

  tags = local.common_tags
}

# ============================================================================
# Lambda Layer for Shared Dependencies
# ============================================================================

resource "aws_lambda_layer_version" "dependencies" {
  filename   = "lambda-layer.zip"
  layer_name = "${local.resource_prefix}-dependencies"
  
  compatible_runtimes = ["nodejs18.x", "nodejs20.x"]
}

# ============================================================================
# Lambda Function 1: Get Stock
# ============================================================================

resource "aws_lambda_function" "get_stock" {
  filename      = "get-stock.zip"
  function_name = "${local.resource_prefix}-get-stock"
  role          = aws_iam_role.lambda_role.arn
  handler       = "get-stock.handler"
  runtime       = "nodejs20.x"
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory_size

  layers = [aws_lambda_layer_version.dependencies.arn]

  environment {
    variables = {
      RDS_ENDPOINT = aws_db_instance.main.endpoint
      RDS_PORT     = aws_db_instance.main.port
      DB_NAME      = var.db_name
      SECRETS_ARN  = aws_secretsmanager_secret.api_keys.arn
      AWS_REGION   = data.aws_region.current.name
      ENVIRONMENT  = var.environment
    }
  }

  depends_on = [
    aws_iam_role_policy.lambda_secrets_policy,
  ]

  tags = local.common_tags
}

# ============================================================================
# Lambda Function 2: Get Market Overview
# ============================================================================

resource "aws_lambda_function" "get_market_overview" {
  filename      = "get-market-overview.zip"
  function_name = "${local.resource_prefix}-get-market-overview"
  role          = aws_iam_role.lambda_role.arn
  handler       = "get-market-overview.handler"
  runtime       = "nodejs20.x"
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory_size

  environment {
    variables = {
      ENVIRONMENT = var.environment
    }
  }

  tags = local.common_tags
}

# ============================================================================
# Lambda Function 3: Get Price History
# ============================================================================

resource "aws_lambda_function" "get_price_history" {
  filename      = "get-price-history.zip"
  function_name = "${local.resource_prefix}-get-price-history"
  role          = aws_iam_role.lambda_role.arn
  handler       = "get-price-history.handler"
  runtime       = "nodejs20.x"
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory_size

  environment {
    variables = {
      ENVIRONMENT = var.environment
    }
  }

  tags = local.common_tags
}

# ============================================================================
# Lambda Function 4: Post Recommendation
# ============================================================================

resource "aws_lambda_function" "post_recommendation" {
  filename      = "post-recommendation.zip"
  function_name = "${local.resource_prefix}-post-recommendation"
  role          = aws_iam_role.lambda_role.arn
  handler       = "post-recommendation.handler"
  runtime       = "nodejs20.x"
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory_size

  environment {
    variables = {
      SECRETS_ARN = aws_secretsmanager_secret.api_keys.arn
      AWS_REGION  = data.aws_region.current.name
      ENVIRONMENT = var.environment
    }
  }

  depends_on = [
    aws_iam_role_policy.lambda_secrets_policy,
  ]

  tags = local.common_tags
}

# ============================================================================
# Lambda Function 5: Get Watchlist
# ============================================================================

resource "aws_lambda_function" "get_watchlist" {
  filename      = "get-watchlist.zip"
  function_name = "${local.resource_prefix}-get-watchlist"
  role          = aws_iam_role.lambda_role.arn
  handler       = "get-watchlist.handler"
  runtime       = "nodejs20.x"
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory_size

  environment {
    variables = {
      ENVIRONMENT = var.environment
    }
  }

  tags = local.common_tags
}

# ============================================================================
# Lambda Function 6: Post Watchlist (Add)
# ============================================================================

resource "aws_lambda_function" "post_watchlist" {
  filename      = "post-watchlist.zip"
  function_name = "${local.resource_prefix}-post-watchlist"
  role          = aws_iam_role.lambda_role.arn
  handler       = "post-watchlist.handler"
  runtime       = "nodejs20.x"
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory_size

  environment {
    variables = {
      ENVIRONMENT = var.environment
    }
  }

  tags = local.common_tags
}

# ============================================================================
# Lambda Function 7: Delete Watchlist
# ============================================================================

resource "aws_lambda_function" "delete_watchlist" {
  filename      = "delete-watchlist.zip"
  function_name = "${local.resource_prefix}-delete-watchlist"
  role          = aws_iam_role.lambda_role.arn
  handler       = "delete-watchlist.handler"
  runtime       = "nodejs20.x"
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory_size

  environment {
    variables = {
      ENVIRONMENT = var.environment
    }
  }

  tags = local.common_tags
}

# ============================================================================
# Lambda Function 8: Health Check
# ============================================================================

resource "aws_lambda_function" "health_check" {
  filename      = "health-check.zip"
  function_name = "${local.resource_prefix}-health-check"
  role          = aws_iam_role.lambda_role.arn
  handler       = "health-check.handler"
  runtime       = "nodejs20.x"
  timeout       = 10
  memory_size   = 128

  environment {
    variables = {
      ENVIRONMENT = var.environment
    }
  }

  tags = local.common_tags
}

# ============================================================================
# Lambda Function URLs (for API Gateway v2 HTTP integration)
# ============================================================================

resource "aws_lambda_function_url" "get_stock" {
  function_name          = aws_lambda_function.get_stock.function_name
  authorization_type     = "NONE"
  cors {
    allow_origins = ["*"]
    allow_methods = ["*"]
    allow_headers = ["content-type"]
  }
}

resource "aws_lambda_function_url" "get_market_overview" {
  function_name          = aws_lambda_function.get_market_overview.function_name
  authorization_type     = "NONE"
  cors {
    allow_origins = ["*"]
    allow_methods = ["*"]
    allow_headers = ["content-type"]
  }
}

resource "aws_lambda_function_url" "get_price_history" {
  function_name          = aws_lambda_function.get_price_history.function_name
  authorization_type     = "NONE"
  cors {
    allow_origins = ["*"]
    allow_methods = ["*"]
    allow_headers = ["content-type"]
  }
}

resource "aws_lambda_function_url" "post_recommendation" {
  function_name          = aws_lambda_function.post_recommendation.function_name
  authorization_type     = "NONE"
  cors {
    allow_origins = ["*"]
    allow_methods = ["*"]
    allow_headers = ["content-type"]
  }
}

resource "aws_lambda_function_url" "get_watchlist" {
  function_name          = aws_lambda_function.get_watchlist.function_name
  authorization_type     = "NONE"
  cors {
    allow_origins = ["*"]
    allow_methods = ["*"]
    allow_headers = ["content-type"]
  }
}

resource "aws_lambda_function_url" "post_watchlist" {
  function_name          = aws_lambda_function.post_watchlist.function_name
  authorization_type     = "NONE"
  cors {
    allow_origins = ["*"]
    allow_methods = ["*"]
    allow_headers = ["content-type"]
  }
}

resource "aws_lambda_function_url" "delete_watchlist" {
  function_name          = aws_lambda_function.delete_watchlist.function_name
  authorization_type     = "NONE"
  cors {
    allow_origins = ["*"]
    allow_methods = ["*"]
    allow_headers = ["content-type"]
  }
}

resource "aws_lambda_function_url" "health_check" {
  function_name          = aws_lambda_function.health_check.function_name
  authorization_type     = "NONE"
  cors {
    allow_origins = ["*"]
    allow_methods = ["*"]
    allow_headers = ["content-type"]
  }
}

resource "aws_lambda_permission" "allow_api_get_stock" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_stock.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:*/*/*"
}

resource "aws_lambda_permission" "allow_api_get_market_overview" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_market_overview.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:*/*/*"
}

resource "aws_lambda_permission" "allow_api_get_price_history" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_price_history.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:*/*/*"
}

resource "aws_lambda_permission" "allow_api_post_recommendation" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_recommendation.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:*/*/*"
}

resource "aws_lambda_permission" "allow_api_get_watchlist" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_watchlist.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:*/*/*"
}

resource "aws_lambda_permission" "allow_api_post_watchlist" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_watchlist.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:*/*/*"
}

resource "aws_lambda_permission" "allow_api_delete_watchlist" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_watchlist.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:*/*/*"
}

resource "aws_lambda_permission" "allow_api_health_check" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.health_check.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:*/*/*"
}

# ============================================================================
# Outputs
# ============================================================================

output "lambda_functions" {
  value = {
    get_stock            = aws_lambda_function.get_stock.arn
    get_market_overview  = aws_lambda_function.get_market_overview.arn
    get_price_history    = aws_lambda_function.get_price_history.arn
    post_recommendation  = aws_lambda_function.post_recommendation.arn
    get_watchlist        = aws_lambda_function.get_watchlist.arn
    post_watchlist       = aws_lambda_function.post_watchlist.arn
    delete_watchlist     = aws_lambda_function.delete_watchlist.arn
    health_check         = aws_lambda_function.health_check.arn
  }
  description = "ARNs of all Lambda functions"
}

output "lambda_function_names" {
  value = {
    get_stock           = aws_lambda_function.get_stock.function_name
    get_market_overview = aws_lambda_function.get_market_overview.function_name
    get_price_history   = aws_lambda_function.get_price_history.function_name
    post_recommendation = aws_lambda_function.post_recommendation.function_name
    get_watchlist       = aws_lambda_function.get_watchlist.function_name
    post_watchlist      = aws_lambda_function.post_watchlist.function_name
    delete_watchlist    = aws_lambda_function.delete_watchlist.function_name
    health_check        = aws_lambda_function.health_check.function_name
  }
  description = "Names of all Lambda functions"
}
