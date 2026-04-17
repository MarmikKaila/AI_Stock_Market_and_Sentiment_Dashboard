# ============================================================================
# CloudFront Content Delivery Network (CDN)
# ============================================================================

# COMMENTED OUT - Will configure later for account verification
# resource "aws_cloudfront_distribution" "main" {
  enabled = true
  is_ipv6_enabled = true
  http_version = "http2and3"
  default_root_object = "index.html"

  # ========================================================================
  # S3 Origin (Frontend Static Files)
  # ========================================================================

  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3Frontend"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.frontend.cloudfront_access_identity_path
    }
  }

  # ========================================================================
  # API Gateway Origin (Backend)
  # ========================================================================

  origin {
    domain_name = replace(aws_apigatewayv2_stage.main.invoke_url, "https://", "")
    origin_id   = "APIBackend"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
      origin_read_timeout    = 30
      origin_keepalive_timeout = 5
    }

    # Custom headers for API requests
    custom_header {
      name  = "X-Origin"
      value = "CloudFront"
    }
  }

  # ========================================================================
  # Default Cache Behavior (S3 Frontend)
  # ========================================================================

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Frontend"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600    # 1 hour
    max_ttl                = 86400   # 1 day
    compress               = true
  }

  # Note: Additional cache behaviors can be added with cache_behavior blocks
  # For now, using default_cache_behavior for all paths

  # ============================================================================
  # Geo-Restriction

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # ========================================================================
  # SSL Certificate
  # ========================================================================

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  # Custom domain support (uncomment to use)
  # viewer_certificate {
  #   acm_certificate_arn            = aws_acm_certificate.main.arn
  #   ssl_support_method             = "sni-only"
  #   minimum_protocol_version       = "TLSv1.2_2021"
  #   cloudfront_default_certificate = false
  # }

  # ========================================================================
  # Logging
  # ========================================================================

  logging_config {
    include_cookies = false
    bucket          = aws_s3_bucket.cloudfront_logs.bucket_regional_domain_name
    prefix          = "cloudfront/"
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${local.resource_prefix}-distribution"
    }
  )

  depends_on = [
    aws_s3_bucket.frontend,
    aws_apigatewayv2_stage.main
  ]
# }

# ============================================================================
# S3 Bucket for CloudFront Logs
# ============================================================================

resource "aws_s3_bucket" "cloudfront_logs" {
  bucket = "${local.resource_prefix}-cloudfront-logs-${data.aws_caller_identity.current.account_id}"

  tags = merge(
    local.common_tags,
    {
      Name = "${local.resource_prefix}-cloudfront-logs"
    }
  )
}

# COMMENTED OUT - S3 ACLs not supported on modern buckets
# resource "aws_s3_bucket_acl" "cloudfront_logs" {
#   bucket = aws_s3_bucket.cloudfront_logs.id
#   acl    = "log-delivery-write"
# }

# Lifecycle: Delete old logs after 30 days
resource "aws_s3_bucket_lifecycle_configuration" "cloudfront_logs" {
  bucket = aws_s3_bucket.cloudfront_logs.id

  rule {
    id     = "delete-old-logs"
    status = "Enabled"

    filter {}

    expiration {
      days = 30
    }
  }
}

# ============================================================================
# Cache Invalidation (optional: run manually or via Lambda)
# ============================================================================

# Create invalidation when distribution changes (optional)
# Note: Manually trigger with:
# aws cloudfront create-invalidation --distribution-id <id> --paths "/*"
#
# Manual invalidation example:
# resource \"aws_cloudfront_distribution_invalidation\" \"main\" {
#   distribution_id = aws_cloudfront_distribution.main.id
#   paths           = [\"/index.html\"]
# }

# For manual invalidation, run:
# aws cloudfront create-invalidation --distribution-id d12345 --paths \"/*\"

# ============================================================================
# Outputs
# ============================================================================

# COMMENTED OUT - CloudFront is disabled
# output "cloudfront_domain_name" {
#   value       = aws_cloudfront_distribution.main.domain_name
#   description = "CloudFront domain name"
# }
# 
# output "cloudfront_distribution_id" {
#   value       = aws_cloudfront_distribution.main.id
#   description = "CloudFront distribution ID (for cache invalidation)"
# }
# 
# output "cloudfront_url" {
#   value       = "https://${aws_cloudfront_distribution.main.domain_name}"
#   description = "CloudFront URL for frontend access"
# }
# 
# output "cloudfront_distribution_arn" {
#   value       = aws_cloudfront_distribution.main.arn
#   description = "CloudFront distribution ARN"
# }
