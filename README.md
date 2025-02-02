# LootLabs Anti-Bypass Project

> TL;DR: This project blocks all attempts to bypass LootLabs content lockers through a secure Cloudflare Workers implementation.

This project contains Cloudflare Workers to secure and obfuscate destination URLs by dynamically generating encrypted links through the LootLabs API.

## Overview
- Prevents users from bypassing content lockers.
- Encrypts the destination URLs using the LootLabs API.
- Consists of multiple workers: one for redirecting and one for blocking bypass attempts.

## Setup & Deployment
1. Deploy the [Redirect API Worker](https://github.com/kbdevs/lootlabs-antibypass/blob/main/redirectAPI.md)
2. Deploy the [Check Referrer Worker](https://github.com/kbdevs/lootlabs-antibypass/blob/main/blockBypass.md)

## Files Included
- **redirectAPI.js / redirectAPI.md**: Handles URL redirection using encryption.
- **blockBypass.js / blockBypass.md**: Ensures requests come from approved referrers.

