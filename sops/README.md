# SOPS Secrets Management — Project 5

SOPS (Secrets OPerationS) encrypts secrets before they go into Git.
Your `.env` file currently lives only on the server and is never
committed — SOPS lets you commit an encrypted version safely.

## How it works