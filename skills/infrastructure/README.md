# Infrastructure Skills

Skills for containerization, orchestration, and infrastructure as code.

## Skills

| Skill | Description |
|-------|-------------|
| [docker-init](./docker-init/) | Dockerfile creation and optimization |
| [docker-compose](./docker-compose/) | Multi-container application setups |
| [kubernetes-manifests](./kubernetes-manifests/) | Kubernetes deployment configurations |
| [terraform-modules](./terraform-modules/) | Infrastructure as Code with Terraform |

## Usage

```
/docker-init node              # Create Node.js Dockerfile
/docker-init python            # Create Python Dockerfile
/docker-compose                # Set up multi-container app
/kubernetes-manifests          # Generate K8s manifests
/terraform-modules aws         # Create AWS Terraform module
```

## Container Patterns

- **Multi-stage builds** - Optimized image sizes
- **Security hardening** - Non-root users, minimal base images
- **Layer caching** - Efficient build times
- **Health checks** - Container health monitoring

## Supported Platforms

- Docker
- Kubernetes
- Terraform
- AWS ECS/Fargate
- Google Cloud Run
