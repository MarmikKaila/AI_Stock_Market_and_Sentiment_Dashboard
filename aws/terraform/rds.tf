# ============================================================================
# RDS PostgreSQL database with RDS Proxy for connection pooling
# ============================================================================

# Security group for RDS
resource "aws_security_group" "rds_sg" {
  name        = "${local.resource_prefix}-rds-sg"
  description = "Security group for RDS PostgreSQL"

  ingress {
    description = "PostgreSQL from anywhere (restrict in production)"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${local.resource_prefix}-rds-sg"
    }
  )
}

# RDS Subnet Group (for multi-AZ deployment)
resource "aws_db_subnet_group" "main" {
  name       = "${local.resource_prefix}-subnet-group"
  subnet_ids = data.aws_subnets.default.ids

  tags = merge(
    local.common_tags,
    {
      Name = "${local.resource_prefix}-subnet-group"
    }
  )
}

# Get default VPC subnets
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_vpc" "default" {
  default = true
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "main" {
  identifier             = "${local.resource_prefix}-db"
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = "db.t3.micro" # Free tier eligible
  allocated_storage      = var.db_allocated_storage
  storage_type           = "gp2"
  storage_encrypted      = true
  
  db_name  = var.db_name
  username = "postgres"
  password = random_password.db_password.result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  multi_az               = false
  publicly_accessible    = true # For easier testing; restrict in production

  backup_retention_period = 1
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"

  skip_final_snapshot       = var.environment == "dev" ? true : false
  final_snapshot_identifier = var.environment == "prod" ? "${local.resource_prefix}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  enabled_cloudwatch_logs_exports = []
  deletion_protection             = var.environment == "prod" ? true : false

  tags = merge(
    local.common_tags,
    {
      Name = "${local.resource_prefix}-db"
    }
  )

  depends_on = [
    aws_security_group.rds_sg,
    aws_db_subnet_group.main
  ]
}
