# Kyverno Policies — Project 5

These policies enforce security standards on the Kubernetes cluster.

## Policies

### require-resource-limits
Enforces that every container in the `production` namespace must define
CPU and memory limits. Prevents resource exhaustion on the node.

### disallow-latest-tag  
Audits deployments using `:latest` image tag. In production, all images
should use specific version tags for reproducible deployments.

### disallow-privileged-containers
Blocks privileged containers from running in the `production` namespace.
Privileged containers have full access to the host Linux capabilities.

## Why not deployed

These policies require Kyverno running in the cluster. Kyverno's admission
controller requires ~256MB RAM. On this single-node 2GB learning droplet
running k3s, Prometheus, Grafana, and Alertmanager, there is insufficient
memory to run Kyverno reliably.

In a production multi-node cluster this would be the first thing installed
before any workloads — policies should be in place before code runs, not
after.

## How to apply

```bash
# Install Kyverno
helm install kyverno kyverno/kyverno --namespace kyverno --create-namespace

# Apply policies
kubectl apply -f kyverno-policies.yaml

# Verify policies are active
kubectl get clusterpolicies
```

## Testing the policies

```bash
# This should be BLOCKED — no resource limits
kubectl run test --image=nginx -n production

# This should be BLOCKED — privileged container
kubectl run test --image=nginx --privileged -n production

# This should pass — has limits and non-latest tag
kubectl apply -f helm/users-api/templates/deployment.yaml
```