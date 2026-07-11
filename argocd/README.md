# ArgoCD — GitOps CD for Project 5

ArgoCD implements GitOps continuous deployment. Instead of GitHub Actions
SSHing into the server and running deploy commands, the cluster itself
watches GitHub and pulls changes automatically.

## How it changes the deploy flow

### Current flow (Projects 1-4)