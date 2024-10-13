# How to integration test

## Overview

```console
backend environment ------- middle server ------ UI environment
```

- 2 environment (laptop or things else) will connect to one middle server (on internet)
- 2 connect (to middle server) is SSH. We will use `forward port` feature of SSH (search SSH forward port or SSH tunnel)

## Steps

### Prepare

Add SSH public keys of two environments to middle server.

### Forward from backend environment

```bash
ssh -fNT -g -R3001:localhost:3000 ec2-user@3.25.106.168
```