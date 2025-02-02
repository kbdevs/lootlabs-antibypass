# LootLabs Anti-Bypass Project

This project contains Cloudflare Workers to secure and obfuscate destination URLs by dynamically generating encrypted links through the LootLabs API.

## Overview
- Prevents users from bypassing content lockers.
- Encrypts the destination URLs using the LootLabs API.
- Consists of multiple workers: one for redirecting and one for blocking bypass attempts.

## Setup & Deployment
1. Deploy each worker on Cloudflare Workers.
2. Configure the `custom_urls` object and update the API key as required.
3. Test by visiting the worker URL with a valid query parameter, e.g., `?url=real`.

## Files Included
- **redirectAPI.js / redirectAPI.md**: Handles URL redirection using encryption.
- **blockBypass.js / blockBypass.md**: Ensures requests come from approved referrers.

## Support
For setup help or support, please reach out via the provided contact methods in the project documentation.
