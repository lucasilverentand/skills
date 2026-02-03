---
name: terraform-modules
description: Creates Terraform modules for infrastructure as code. Use when provisioning cloud resources, creating reusable infrastructure modules, or managing cloud state.
argument-hint: [provider]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Terraform Modules

Creates Terraform configurations for cloud infrastructure.

## Your Task

1. **Identify resources**: Determine what to provision
2. **Create module structure**: Set up files and variables
3. **Write configurations**: Define resources
4. **Configure state**: Set up remote state backend
5. **Test**: Plan and apply

## Module Structure

```
modules/
  app/
    main.tf
    variables.tf
    outputs.tf
    versions.tf
```

## AWS ECS Example

```hcl
# main.tf
resource "aws_ecs_cluster" "main" {
  name = var.cluster_name

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_service" "app" {
  name            = var.service_name
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [aws_security_group.app.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = var.container_name
    container_port   = var.container_port
  }
}
```

```hcl
# variables.tf
variable "cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
}

variable "service_name" {
  description = "Name of the ECS service"
  type        = string
}

variable "desired_count" {
  description = "Number of tasks to run"
  type        = number
  default     = 2
}
```

```hcl
# outputs.tf
output "cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = aws_ecs_cluster.main.arn
}
```

## Tips

- Use remote state (S3, Terraform Cloud)
- Use workspaces for environments
- Lock state files for team collaboration
- Use `terraform fmt` and `terraform validate`
