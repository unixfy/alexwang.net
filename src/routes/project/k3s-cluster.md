---
title: K3S Kubernetes Cluster
image: k3s-cluster.png
date: 2022-06-01
---

For quite a while, I've run my projects and self-hosted applications using Docker-compose files. However, this was quickly becoming cumbersome with my growing number of self-hosted services and servers to host those services. So, I deployed my own Kubernetes cluster using Rancher's K3S distribution on my collection of VPSes around the world.

It's important to note that my Kubernetes is a little special: it isn't on any hyperscaler with a managed control plane (so I'm also hosting the control plane), and nodes are not colocated from a physical nor network standpoint. It's essentially a Kubernetes-at-the-edge deployment but on a global scale. I've also implemented ArgoCD for GitOps, which makes it much easier and safer to deploy my projects to the cluster.

I've especially enjoyed having a centralized observability stack and control plane with Kubernetes, as well as the highly declarative operations enabled by ArgoCD. Plus, it's a very useful skill at the hyperscale :-)