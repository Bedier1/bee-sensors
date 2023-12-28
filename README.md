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

### Continuous Integration (CI) Pipeline

The CI pipeline ensures high-quality code and robust functionality through the following steps:

1. **Unit and Integration Tests**: Verifies that both small units of code and their integration work as expected.
2. **Code and Dockerfile Linting**: Checks the source code and Dockerfile for stylistic and programmatic errors to maintain code quality and consistency.
3. **API Version Verification**: Ensures that the endpoint `/api/version` returns the correct version.
4. **End-to-End Testing with Venom**: Conducts thorough tests to simulate real-world scenarios and check the complete flow of the application.

### Scorecard Pipeline

The Scorecard Pipeline focuses on the security aspect of the codebase:

1. **Security Scanning**: Analyzes the code to identify potential security vulnerabilities.

### Terrascan

In the context of Kubernetes and infrastructure as code:

1. **Kubernetes Manifest Analysis**: Reviews Kubernetes manifest files for issues and adherence to best practices.

### Automated Docker Image Building and Deployment

This process streamlines the building and deployment of Docker images:

1. **Repository Checkout**: Pulls the latest code from the repository.
2. **Version Extraction**: Retrieves the application version from `package.json`.
3. **Docker Buildx Setup**: Prepares the Docker Buildx environment for the build process.
4. **Docker Hub Login**: Authenticates with Docker Hub for image publishing.
5. **Docker Image Building and Pushing**: Builds the Docker image and pushes it to Docker Hub.
6. **Helm Chart Update**: Updates the Helm chart in the `bee-sensors-manifest` repository with the new Docker image version.


## Infrastructure
### Kubernetes and Observability
Instructions for Kubernetes setup and observability stack installation with Grafana, Loki, Promtail, Prometheus, and Alertmanager.

#### Installation Commands
```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
helm install lokii grafana/loki-stack --values ./kubernetes/observability/values.yml
