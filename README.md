# End-to-End-DevOps | Nodejs-Redis

## Technology Stack
- Node.js
- Jest
- Docker
- Kubernetes
- GitHub Actions
- ArgoCD
- Prometheus
- Grafana
- Loki
- Venom

## Introduction
This Node.js project demonstrates an end-to-end DevOps pipeline, highlighting API development, unit testing, and deployment in a Kubernetes environment. It includes advanced logging and monitoring capabilities, providing a complete overview of the SDLC process in a cloud-native setting.

## Prerequisites
Before starting, ensure you have the following tools installed:
- Minikube
- Docker
- kubectl
- Helm

Refer to the official installation guides for each tool for detailed instructions.

## Application Overview
This application features four RESTful APIs:
1. `/metrics`: Provides Prometheus metrics for monitoring API performance.
2. `/api/temperature`: Core business logic, integrating with Redis and external APIs for temperature data aggregation.
3. `/api/version`: Displays the current Kubernetes version to verify deployment correctness.


## Cache Layer

### Redis Cluster Configuration
The Redis Cluster is implemented using Kubernetes StatefulSet, which is defined in the `redis.yaml` manifest file. This configuration ensures that we have a stable and consistent Redis deployment with persistent storage and a predictable naming convention. The manifest specifies:

- A StatefulSet named `redis` with three replicas, ensuring we have one primary and two replica Redis nodes.
- The use of a custom `redis.conf` configuration file to set up each Redis pod.
- An initialization container to configure Redis nodes based on their role (master or replica) at startup.
- A persistent volume claim template to provide stable and persistent storage for each Redis pod.

### Redis Replication and Failover with Sentinel
Replication in Redis is achieved by configuring Redis replicas to follow a Redis master. The master node is responsible for handling writes, which are then propagated to the replica nodes. In our setup, the initial configuration of the master and replicas is done via the init container in the StatefulSet.

Redis Sentinel is configured to handle failover. If the master node fails, Sentinel will automatically promote one of the replica nodes to be the new master. Sentinel is also deployed as a StatefulSet (`sentinel.yaml`) with the following characteristics:

- A Service named `sentinel` that provides a stable network identity for each Sentinel instance.
- An init container in the Sentinel StatefulSet that configures Sentinel to monitor the Redis master and perform automated failover if necessary.
- Sentinel configuration includes parameters like `down-after-milliseconds`, `failover-timeout`, and `parallel-syncs`, which are crucial for determining the master's health and coordinating failover and synchronization among nodes.

To deploy the Redis Cluster with Sentinel for failover management, apply the following manifest files using `kubectl`:

```bash
kubectl apply -f kubernetes/redis/redis.yaml
kubectl apply -f kubernetes/redis/sentinel.yaml
```
## Prometheus Metrics
Custom metrics are registered and managed through `middleware/metricsMiddleware.js`, tracking API performance metrics like request counts and durations.
## CI/CD Pipeline
### GitHub Actions Workflows (`.github/workflows`)
1. `main.yml`: Node.js setup, unit and integration testing, linting, `/version` endpoint verification, and API testing with Venom.
2. `scorecard.yml`: Scorecard for supply-chain security checks.
3. `terrascan.yml`: Security validation in Kubernetes manifest files.
4. `docker.yml`: Docker image build and push, Helm chart updates in the manifest repository.## CI/CD Pipeline
Continuous Integration and Delivery are crucial in ensuring high quality and frequent releases. Our project leverages GitHub Actions to automate our workflows, which are described below.

### GitHub Actions Workflows (`.github/workflows`)

#### 1. `main.yml`: Node.js Continuous Integration
This workflow is triggered on push and pull request events to the main branch. It consists of several jobs:

- **Run linters**: Enforces code style and syntax correctness across the project.
- **Run tests**: Executes unit tests to ensure code changes do not break functionality.
- **Run linters (Docker)**: Performs linting on the Dockerfile to ensure best practices.
- **Run application**: Deploys the application in the CI environment and checks that the `/version` endpoint responds correctly.
- **Install Venom**: Installs Venom for executing end-to-end API tests, validating the overall functionality of the application.

#### 2. `scorecard.yml`: Supply-Chain Security
This workflow is scheduled to run weekly and on push events to the main branch. It uses the Scorecard action to perform supply-chain security checks and uploads the results to GitHub's code-scanning dashboard for review.

#### 3. `terrascan.yml`: Infrastructure as Code Security
Activated on pull requests affecting Kubernetes files, it employs Terrascan to scan the Kubernetes manifests. It identifies potential security issues in the infrastructure configuration and uploads a SARIF report to GitHub's code-scanning dashboard.

#### 4. `docker.yml`: Docker Build and Push
This workflow is responsible for:

- Building the Docker image tagged with the version extracted from `package.json`.
- Pushing the image to Docker Hub.
- Cloning the `bee-sensors-manifest-` repository and updating the Helm chart with the new image tag.
- Committing and pushing changes to the manifest repository, triggering a deployment through ArgoCD.

Each file is crafted to automate a specific aspect of the SDLC process, from code linting to deployment, ensuring that our main branch is always in a deployable state.



## Observability
### Easy Approach: Loki Stack via Helm Charts
Deploy the Loki stack for logging  and monitoring using Helm:
1. Add Grafana Helm Repository: `helm repo add grafana https://grafana.github.io/helm-charts`
2. Update Helm Repository: `helm repo update`
3. Install Loki Stack: `helm install lokii grafana/loki-stack -n loki --values=kubernetes/observability/values.yml`

### Prometheus Operator
The Prometheus Operator simplifies the deployment and configuration of Prometheus, Alertmanager, and related monitoring components. Here's how to deploy it:

1. **Deploy CRDs**:
   - Initially, deploy the Custom Resource Definitions (CRDs) for the Prometheus Operator. These define the Kubernetes resources used by the operator:
     ```bash
     kubectl apply -f kubernetes/prometheus/crds/
     ```

2. **Deploy Prometheus Operator**:
   - Deploy the Prometheus Operator itself, which manages the Prometheus instances in your cluster:
     ```bash
     kubectl apply -f kubernetes/prometheus/deployment/
     ```

### Service Monitor
Service Monitors are used by Prometheus to identify which services to monitor and how. Here's how to deploy them:

1. **Deploy Service Monitor**:
   - Apply the service monitor configuration to enable Prometheus to capture metrics from your application:
     ```bash
     kubectl apply -f kubernetes/prometheus/service_monitor/
     ```

### How Prometheus and Service Monitor Work

- **Prometheus**: Prometheus is an open-source monitoring system that collects metrics from configured targets at given intervals, evaluates rule expressions, displays the results, and can trigger alerts if some condition is observed to be true. It stores all collected metrics in a time-series database and offers a powerful query language to analyze them.

- **Service Monitor**: In the context of Prometheus Operator, a Service Monitor is a Kubernetes custom resource that declares the endpoints to be monitored by Prometheus. It specifies the service to monitor and the metrics endpoints.

