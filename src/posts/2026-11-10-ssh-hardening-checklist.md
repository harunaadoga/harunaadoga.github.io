---
title: "SSH hardening on RHEL, Rocky and AlmaLinux: a working checklist"
description: "Ten settings that close the most common SSH weaknesses on RHEL-family servers, with the commands to apply and verify each one safely."
date: 2026-11-10
topics: ["Linux", "Security", "How-to"]
video: xPjogpvOukA
---

SSH is the front door of almost every Linux server. This checklist is the written companion to the SSH episode of my [Linux Server Hardening series](https://github.com/harunaadoga/linux-server-hardening). It targets RHEL, Rocky Linux and AlmaLinux 9 and later.

## Before you start

Two rules will save you from locking yourself out:

1. **Keep a second session open.** Test every change from a new terminal before you close the one you are working in.
2. **Validate before you reload.** `sshd -t` checks the configuration and prints nothing if it is valid.

```bash
sudo sshd -t && sudo systemctl reload sshd
```

## Use a drop-in file

On RHEL 9 and later, `/etc/ssh/sshd_config` includes everything in `/etc/ssh/sshd_config.d/`. Put your settings in a file of your own instead of editing the main file, so package updates never overwrite them.

For most options, `sshd` uses the **first** value it reads. The include line sits at the top of the main file and the drop-ins are read in name order, so give your file a name that sorts first:

```bash
sudo vi /etc/ssh/sshd_config.d/00-hardening.conf
```

## The checklist

```bash
# /etc/ssh/sshd_config.d/00-hardening.conf

# 1. No direct root login
PermitRootLogin no

# 2. Keys only, no passwords
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes

# 3. Never allow empty passwords
PermitEmptyPasswords no

# 4. Only named groups may log in
AllowGroups sshusers wheel

# 5. Limit guessing
MaxAuthTries 4
MaxSessions 10
LoginGraceTime 60

# 6. Drop idle sessions (15 minutes)
ClientAliveInterval 300
ClientAliveCountMax 3

# 7. Turn off what you do not use
X11Forwarding no
AllowAgentForwarding no
AllowTcpForwarding no

# 8. Ignore legacy trust files
IgnoreRhosts yes
HostbasedAuthentication no

# 9. Log enough to investigate
LogLevel VERBOSE

# 10. Show a legal banner before login
Banner /etc/issue.net
```

A few notes on the items that catch people out.

### Passwords off means keys on first

Copy your public key to the server and confirm that key login works **before** you set `PasswordAuthentication no`.

```bash
ssh-copy-id user@server
ssh -o PreferredAuthentications=publickey user@server
```

### Create the group before you restrict to it

`AllowGroups` denies everyone who is not in a listed group. Create the group and add yourself first.

```bash
sudo groupadd sshusers
sudo usermod -aG sshusers youruser
```

### Leave ciphers to crypto-policies

On RHEL-family systems, ciphers, MACs and key exchange algorithms are set system-wide. Do not hand-write `Ciphers` lines. Check and set the policy instead:

```bash
update-crypto-policies --show
sudo update-crypto-policies --set DEFAULT
```

## Verify what is actually in effect

`sshd -T` prints the effective configuration after every include has been processed. This is the only output you should trust.

```bash
sudo sshd -T | grep -Ei 'permitrootlogin|passwordauthentication|maxauthtries|allowgroups|clientalive|x11forwarding'
```

Also check the permissions on the files that matter:

```bash
sudo stat -c '%a %U:%G %n' /etc/ssh/sshd_config /etc/ssh/sshd_config.d/*.conf
# expect 600 root:root
```

## If you changed the port

Moving SSH off port 22 reduces log noise but is not a security control on its own. If you do it, SELinux and the firewall both need to know:

```bash
sudo semanage port -a -t ssh_port_t -p tcp 2222
sudo firewall-cmd --permanent --add-port=2222/tcp
sudo firewall-cmd --reload
```

## What this does not cover

Hardening the daemon is one layer. You still need patching, a host firewall, account policies and monitoring of failed logins. The rest of the series works through those in order.
