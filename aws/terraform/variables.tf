variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Application name (lowercase, alphanumeric only)"
  type        = string
  default     = "stock-sentiment-dashboard"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 30
}

variable "lambda_memory_size" {
  description = "Lambda function memory allocation in MB"
  type        = number
  default     = 512
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "stockdb"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB (free tier: 20GB included)"
  type        = number
  default     = 20
}

variable "cloudwatch_logs_retention_days" {
  description = "CloudWatch logs retention in days"
  type        = number
  default     = 30
}

variable "api_cors_origins" {
  description = "Comma-separated CORS origins"
  type        = string
  default     = "http://localhost:5173,http://localhost:3000"
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "Stock Market Sentiment Dashboard"
    Environment = "dev"
    ManagedBy   = "Terraform"
    CreatedAt   = "2026-04-17"
  }
}
