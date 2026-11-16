---
title: "My PhD in plain language: placing network functions at the edge"
description: "What network function virtualisation is, why mixed hardware makes it hard, and what my doctoral research at Glasgow contributed."
date: 2026-11-03
topics: ["Networking", "Research Computing"]
---

People often ask what my PhD was about. The title is *Leveraging NFV heterogeneity at the network edge*. Here is the version without the jargon.

## Network functions used to be boxes

A firewall, a load balancer, an intrusion detection system: each of these was once a dedicated appliance in a rack. **Network function virtualisation** (NFV) turns them into software, so an operator can start, stop and move them like any other workload.

Traffic usually has to pass through several of these functions in a fixed order. That ordered path is called a **service function chain**.

## The hardware is no longer uniform

Once a network function is software, it can run in many places:

- in a virtual machine
- in a container
- inside the kernel
- on a programmable switch, written in a language such as P4
- on a SmartNIC

Each option has a different cost and a different speed. A function on a programmable switch can process packets very quickly, but the switch has limited resources and not every function fits. A container is flexible but slower.

This mix is what I mean by *heterogeneity*. At the network edge, close to users, it matters most, because capacity is small and applications expect low delay.

## The question

If you have a chain of functions and a mixed set of hosts, **where should each function run so that end-to-end latency stays low?**

Existing placement approaches mostly assumed one kind of host. There was little support for deploying functions across different packet-processing platforms as one system.

## What the thesis contributed

1. **A map of the field.** A taxonomy of frameworks for running network functions on different platforms, to help operators and researchers compare them. The survey behind it is published in [Future Internet](https://doi.org/10.3390/fi14020059).
2. **Measurements.** Testbed experiments on what you gain from heterogeneous execution, published at [IEEE NetSoft 2022](https://doi.org/10.1109/NetSoft54395.2022.9844115).
3. **An exact model.** An integer linear programme that places functions across programmable data-plane devices and ordinary hosts to minimise end-to-end latency.
4. **A fast heuristic.** Exact models are slow at scale. HYPHA is a heuristic that reaches near-optimal placements quickly, with fewer latency violations. This work appeared at [IEEE GLOBECOM 2023](https://doi.org/10.1109/GLOBECOM54140.2023.10437107).
5. **A scheduler for changing conditions.** Users move and load shifts. Using optimal stopping theory, the scheduler decides *when* to re-place a function, which reduces both latency violations and unnecessary migrations.

## Why it still matters to me

I now run research computing infrastructure, where the same trade-off appears every day. GPUs, SmartNICs, fast fabrics and ordinary servers sit side by side, and the job is to put each workload where it runs best.

The full thesis is [open access from the University of Glasgow](https://doi.org/10.5525/gla.thesis.84344).
