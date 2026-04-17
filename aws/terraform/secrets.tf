# ============================================================================
# AWS Secrets Manager for storing sensitive API keys and database credentials
# ============================================================================

# Database credentials secret
resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "${local.resource_prefix}/db-credentials"
  description             = "PostgreSQL database credentials for RDS"
  recovery_window_in_days = 7

  tags = local.common_tags
}

resource "random_password" "db_password" {
  length      = 32
  special     = true
  min_lower   = 1
  min_upper   = 1
  min_numeric = 1
  min_special = 1
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = "postgres"
    password = random_password.db_password.result
    engine   = "postgres"
    dbname   = var.db_name
    port     = 5432
  })
}

# API Keys secret
resource "aws_secretsmanager_secret" "api_keys" {
  name                    = "${local.resource_prefix}/api-keys"
  description             = "External API keys (Gemini, Alpha Vantage, NewsAPI, MongoDB URI)"
  recovery_window_in_days = 7

  tags = local.common_tags
}

# NOTE: Update this with actual API keys before running terraform apply
# You can update via: aws secretsmanager update-secret --secret-id stock-sentiment-dashboard-dev/api-keys --secret-string '{"gemini_api_key":"...","alpha_vantage_api_key":"...","newsapi_key":"...","mongodb_uri":"..."}'
resource "aws_secretsmanager_secret_version" "api_keys" {
  secret_id = aws_secretsmanager_secret.api_keys.id
  secret_string = jsonencode({
    gemini_api_key        = var.environment == "dev" ? "PLACEHOLDER_GEMINI_KEY" : ""
    alpha_vantage_api_key = var.environment == "dev" ? "PLACEHOLDER_AV_KEY" : ""
    newsapi_key           = var.environment == "dev" ? "PLACEHOLDER_NEWSAPI_KEY" : ""
    mongodb_uri           = var.environment == "dev" ? "PLACEHOLDER_MONGODB_URI" : ""
  })
}

# Outputs
output "db_secret_arn" {
  value       = aws_secretsmanager_secret.db_credentials.arn
  description = "ARN of database credentials secret"
}

output "db_secret_name" {
  value       = aws_secretsmanager_secret.db_credentials.name
  description = "Name of database credentials secret"
}

output "api_keys_secret_arn" {
  value       = aws_secretsmanager_secret.api_keys.arn
  description = "ARN of API keys secret"
}

output "api_keys_secret_name" {
  value       = aws_secretsmanager_secret.api_keys.name
  description = "Name of API keys secret"
}

output "db_password_hint" {
  value       = "Database password auto-generated. Update RDS instance after applying Terraform."
  description = "Password management hint"
  sensitive   = true
}
