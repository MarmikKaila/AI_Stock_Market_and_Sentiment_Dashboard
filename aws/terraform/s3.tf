# ============================================================================
# S3 Bucket for Frontend Static Files
# ============================================================================

# S3 bucket
resource "aws_s3_bucket" "frontend" {
  bucket = "${local.resource_prefix}-frontend-${data.aws_caller_identity.current.account_id}"

  tags = merge(
    local.common_tags,
    {
      Name = "${local.resource_prefix}-frontend"
    }
  )
}

# Remove default public access block restrictions (we'll use CloudFront OAI)
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Enable versioning
resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Static website hosting configuration
resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html" # SPA routing: route all 404s to index.html
  }
}

# CORS configuration
resource "aws_s3_bucket_cors_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = split(",", var.api_cors_origins)
    expose_headers  = ["ETag"]
    max_age_seconds = 86400
  }
}

# ============================================================================
# S3 Bucket Policy (for CloudFront OAI access)
# ============================================================================

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.frontend.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend.arn}/*"
      },
      {
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.frontend.iam_arn
        }
        Action   = "s3:ListBucket"
        Resource = aws_s3_bucket.frontend.arn
      }
    ]
  })
}

# ============================================================================
# CloudFront Origin Access Identity (OAI)
# ============================================================================

resource "aws_cloudfront_origin_access_identity" "frontend" {
  comment = "OAI for ${local.resource_prefix} S3 bucket"

  lifecycle {
    create_before_destroy = true
  }
}

# ============================================================================
# Outputs
# ============================================================================

output "s3_bucket_name" {
  value       = aws_s3_bucket.frontend.bucket
  description = "S3 bucket name for frontend files"
}

output "s3_bucket_arn" {
  value       = aws_s3_bucket.frontend.arn
  description = "S3 bucket ARN"
}

output "s3_website_endpoint" {
  value       = aws_s3_bucket_website_configuration.frontend.website_endpoint
  description = "S3 website endpoint (use CloudFront instead)"
}

output "cloudfront_oai_id" {
  value       = aws_cloudfront_origin_access_identity.frontend.id
  description = "CloudFront Origin Access Identity ID"
}
