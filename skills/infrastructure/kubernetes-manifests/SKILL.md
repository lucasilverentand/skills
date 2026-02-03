---
name: kubernetes-manifests
description: Creates Kubernetes deployment manifests. Use when deploying to Kubernetes, configuring pods, services, or ingress resources.
argument-hint: [resource-type]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Kubernetes Manifests

Creates Kubernetes deployment configurations and resources.

## Your Task

1. **Identify requirements**: Determine what resources are needed
2. **Create manifests**: Write YAML configurations
3. **Configure resources**: Set limits, replicas, probes
4. **Test locally**: Validate with kubectl or k9s
5. **Document**: Add deployment instructions

## Basic Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
  labels:
    app: app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: app
  template:
    metadata:
      labels:
        app: app
    spec:
      containers:
        - name: app
          image: app:latest
          ports:
            - containerPort: 3000
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
          env:
            - name: NODE_ENV
              value: production
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: database-url
```

## Service

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: app
spec:
  selector:
    app: app
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
```

## Ingress

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - app.example.com
      secretName: app-tls
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: app
                port:
                  number: 80
```

## Tips

- Always set resource requests and limits
- Use liveness and readiness probes
- Store secrets in Kubernetes Secrets
- Use namespaces for isolation
