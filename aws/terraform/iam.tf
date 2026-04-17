# ============================================================================
# IAM Roles and Policies for AWS Lambda, RDS Proxy, and related services
# ============================================================================

# Lambda Execution Role
resource "aws_iam_role" "lambda_role" {
  name               = "${local.resource_prefix}-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })

  tags = local.common_tags
}

# Lambda Basic Execution Policy (CloudWatch Logs)
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda VPC Execution Policy (for RDS access in VPC)
resource "aws_iam_role_policy_attachment" "lambda_vpc_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Lambda RDS Database Access Policy
resource "aws_iam_role_policy" "lambda_rds_policy" {
  name = "${local.resource_prefix}-lambda-rds"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "rds-db:connect"
        ]
        Resource = "arn:aws:rds:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:db/*"
      }
    ]
  })
}

# Lambda Secrets Manager Access Policy
resource "aws_iam_role_policy" "lambda_secrets_policy" {
  name = "${local.resource_prefix}-lambda-secrets"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "arn:aws:secretsmanager:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:secret:${local.resource_prefix}/*"
      }
    ]
  })
}

# Lambda CloudWatch Metrics Policy
resource "aws_iam_role_policy" "lambda_cloudwatch_metrics" {
  name = "${local.resource_prefix}-lambda-cloudwatch"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData"
        ]
        Resource = "*"
      }
    ]
  })
}

# API Gateway Logging Role
resource "aws_iam_role" "api_gateway_logging_role" {
  name               = "${local.resource_prefix}-api-gateway-logging"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "apigateway.amazonaws.com"
      }
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "api_gateway_logging" {
  role       = aws_iam_role.api_gateway_logging_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
}

# CloudFront S3 Access Role
resource "aws_iam_role" "cloudfront_s3_role" {
  name               = "${local.resource_prefix}-cloudfront-s3"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "cloudfront.amazonaws.com"
      }
    }]
  })

  tags = local.common_tags
}

# Outputs
output "lambda_role_arn" {
  value       = aws_iam_role.lambda_role.arn
  description = "ARN of Lambda execution role"
}

output "api_gateway_logging_role_arn" {
  value       = aws_iam_role.api_gateway_logging_role.arn
  description = "ARN of API Gateway logging role"
}
