# Bee Sensors Project

## Overview
A DevOps project integrating SDLC methodologies to process SenseBox data with Node.js, highlighting RESTful API development, Redis caching, and Kubernetes deployment.

## Features
### RESTful API
- `/metrics`: Prometheus metrics.
- `/api/temperature`: Average temperature from SenseBox data.
- `/api/version`: Current application version.

### Redis Caching
Implemented a Redis cluster in Kubernetes for enhanced API performance.

### Middleware and Performance Monitoring
Custom middleware using Prometheus for tracking request times.

### Readiness Check
`/readyz` endpoint for application availability.

## Development
### Node.js Implementation
Node.js for RESTful API development.

### Redis Cluster Setup
Redis cluster setup in Kubernetes for high availability.

## DevOps Integration
### CI/CD Pipelines
Pipelines for tests, linting, Dockerfile validation, end-to-end testing with Venom, security checks with Scorecard, and Kubernetes manifest validation with Terrascan.

### GitHub Actions Workflows: 
CI pipeline:
- Checks unit test and integration test
- Check code and Dockerfile linting
- ensure endpoint /api/version return correct version
- run end to end test with venom
Scorecard Pipeline:
- scan the code from security issues
Terrascan:
- Run pipeline to check k8s mainfest issues and best practices 
Automates Docker image building and deployment:
- Checks out the repository.
- Extracts version from `package.json`.
- Sets up Docker Buildx.
- Logs in to Docker Hub.
- Builds and pushes Docker image.
- Updates Helm chart in bee-sensors-manifest repository.

## Infrastructure
### Kubernetes and Observability
Instructions for Kubernetes setup and observability stack installation with Grafana, Loki, Promtail, Prometheus, and Alertmanager.

#### Installation Commands
```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
helm install lokii grafana/loki-stack --values ./kubernetes/observability/values.yml
