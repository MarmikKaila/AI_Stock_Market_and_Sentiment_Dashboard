# ============================================================================
# CloudWatch Monitoring, Alarms, and Dashboard
# ============================================================================

# Alarm: Lambda Errors exceed threshold
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${local.resource_prefix}-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300 # 5 minutes
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Alert when Lambda errors exceed 5 in 5 minutes"
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = aws_lambda_function.get_stock.function_name
  }

  tags = local.common_tags
}

# Alarm: API Gateway latency exceeds threshold
resource "aws_cloudwatch_metric_alarm" "api_latency" {
  alarm_name          = "${local.resource_prefix}-api-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Latency"
  namespace           = "AWS/ApiGateway"
  period              = 60
  statistic           = "Average"
  threshold           = 3000 # 3 seconds
  alarm_description   = "Alert when API latency exceeds 3 seconds"
  treat_missing_data  = "notBreaching"

  dimensions = {
    ApiName = aws_apigatewayv2_api.main.name
  }

  tags = local.common_tags
}

# Alarm: RDS CPU exceeds threshold
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "${local.resource_prefix}-rds-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Alert when RDS CPU exceeds 80%"
  treat_missing_data  = "notBreaching"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.identifier
  }

  tags = local.common_tags
}

# Alarm: API 4xx errors exceed threshold
resource "aws_cloudwatch_metric_alarm" "api_4xx_errors" {
  alarm_name          = "${local.resource_prefix}-api-4xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "4XXError"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "Sum"
  threshold           = 50
  alarm_description   = "Alert when 4xx errors exceed 50 in 5 minutes"
  treat_missing_data  = "notBreaching"

  dimensions = {
    ApiName = aws_apigatewayv2_api.main.name
  }

  tags = local.common_tags
}

# Alarm: API 5xx errors exceed threshold
resource "aws_cloudwatch_metric_alarm" "api_5xx_errors" {
  alarm_name          = "${local.resource_prefix}-api-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Alert when 5xx errors exceed 5 in 5 minutes"
  treat_missing_data  = "notBreaching"

  dimensions = {
    ApiName = aws_apigatewayv2_api.main.name
  }

  tags = local.common_tags
}

# ============================================================================
# CloudWatch Dashboard
# ============================================================================

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${local.resource_prefix}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      # ===================== Row 1: Lambda Metrics =====================
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", { stat = "Sum" }],
            [".", "Errors", { stat = "Sum" }],
            [".", "Duration", { stat = "Average" }],
            [".", "ConcurrentExecutions", { stat = "Maximum" }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "Lambda Functions Performance"
          period  = 300
          yAxis = {
            left = {
              showUnits = true
            }
          }
          liveData = true
        }
        width   = 12
        height  = 6
        x       = 0
        y       = 0
      },

      # ===================== Row 1: API Gateway Metrics =====================
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApiGateway", "Count", { stat = "Sum" }],
            [".", "Latency", { stat = "Average" }],
            [".", "4XXError", { stat = "Sum" }],
            [".", "5XXError", { stat = "Sum" }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "API Gateway Performance"
          period  = 300
          yAxis = {
            left = {
              showUnits = true
            }
          }
          liveData = true
        }
        width   = 12
        height  = 6
        x       = 12
        y       = 0
      },

      # ===================== Row 2: RDS Metrics =====================
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", { stat = "Average" }],
            [".", "DatabaseConnections", { stat = "Average" }],
            [".", "ReadLatency", { stat = "Average" }],
            [".", "WriteLatency", { stat = "Average" }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "RDS Database Performance"
          period  = 300
          yAxis = {
            left = {
              showUnits = true
            }
          }
          liveData = true
        }
        width   = 12
        height  = 6
        x       = 0
        y       = 6
      },

      # ===================== Row 2: CloudFront Metrics =====================
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/CloudFront", "Requests", { stat = "Sum" }],
            [".", "BytesDownloaded", { stat = "Sum" }],
            [".", "CacheHitRate", { stat = "Average" }],
            [".", "4xxErrorRate", { stat = "Average" }],
            [".", "5xxErrorRate", { stat = "Average" }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "CloudFront CDN Performance"
          period  = 300
          yAxis = {
            left = {
              showUnits = true
            }
          }
          liveData = true
        }
        width   = 12
        height  = 6
        x       = 12
        y       = 6
      },

      # ===================== Row 3: Custom Application Metrics =====================
      {
        type = "metric"
        properties = {
          metrics = [
            ["StockDashboard", "StockFetched", { stat = "Sum" }],
            [".", "CacheHit", { stat = "Sum" }],
            [".", "RequestError", { stat = "Sum" }],
            [".", "RequestDuration", { stat = "Average" }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "Application Custom Metrics"
          period  = 60
          yAxis = {
            left = {
              showUnits = true
            }
          }
          liveData = true
        }
        width   = 12
        height  = 6
        x       = 0
        y       = 12
      },

      # ===================== Row 3: Logs Insights =====================
      {
        type = "log"
        properties = {
          query   = "fields @timestamp, @message, @duration | filter @message like /ERROR/ | stats count() by bin(5m)"
          region  = data.aws_region.current.name
          title   = "Error Rate (5-min bins)"
        }
        width   = 12
        height  = 6
        x       = 12
        y       = 12
      },
    ]
  })
}

# ============================================================================
# Log Groups (already created in other files, but reference here)
# ============================================================================

# Log Retention Policies are already set in lambda.tf and apigateway.tf

# ============================================================================
# Composite Alarms (Optional: alert on multiple conditions)
# ============================================================================

resource "aws_cloudwatch_composite_alarm" "critical_issues" {
  alarm_name          = "${local.resource_prefix}-critical-issues"
  alarm_description   = "Composite alarm for critical application issues"
  actions_enabled     = true
  alarm_actions       = [] # Add SNS topic ARN for notifications

  alarm_rule = join(" OR ", [
    "arn:aws:cloudwatch:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:alarm:${aws_cloudwatch_metric_alarm.lambda_errors.alarm_name}",
    "arn:aws:cloudwatch:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:alarm:${aws_cloudwatch_metric_alarm.api_5xx_errors.alarm_name}",
    "arn:aws:cloudwatch:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:alarm:${aws_cloudwatch_metric_alarm.rds_cpu.alarm_name}",
  ])

  tags = local.common_tags
}

# ============================================================================
# Outputs
# ============================================================================

output "dashboard_url" {
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${data.aws_region.current.name}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
  description = "CloudWatch Dashboard URL"
}

output "alarms" {
  value = {
    lambda_errors              = aws_cloudwatch_metric_alarm.lambda_errors.alarm_name
    api_latency                = aws_cloudwatch_metric_alarm.api_latency.alarm_name
    rds_cpu                    = aws_cloudwatch_metric_alarm.rds_cpu.alarm_name
    api_4xx_errors             = aws_cloudwatch_metric_alarm.api_4xx_errors.alarm_name
    api_5xx_errors             = aws_cloudwatch_metric_alarm.api_5xx_errors.alarm_name
    critical_issues_composite  = aws_cloudwatch_composite_alarm.critical_issues.alarm_name
  }
  description = "CloudWatch Alarms"
}
