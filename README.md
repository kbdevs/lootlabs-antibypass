# LootLabs Anti-Bypass Project


> TL;DR: This project blocks all attempts to bypass LootLabs content lockers through a secure Cloudflare Workers implementation.


## Need Help? I'll Set It Up for $5 in Crypto! 💰
If this setup feels overwhelming, I can help for just $5 in crypto. Ping me in the LootLabs Discord (@kbdevs) to get started.

---

This project contains Cloudflare Workers to secure and obfuscate destination URLs by dynamically generating encrypted links through the LootLabs API.

## How does this work?
- The Redirect API Worker makes it so that each time a user requests your link it generates a completely new URL so that bypassers take a long time or don't work.
- The Check Referrer Worker makes sure that the user is coming from lootlabs instead of a bypass site.

## Setup & Deployment

1. Deploy the [Block Bypass Worker](https://github.com/kbdevs/lootlabs-antibypass/blob/main/publicRelease.md)
###### This is optional and slightly more secure
2. Deploy the [Redirect API Worker](https://github.com/kbdevs/lootlabs-antibypass/blob/main/redirectAPI.md)
3. Deploy the [Check Referrer Worker](https://github.com/kbdevs/lootlabs-antibypass/blob/main/blockBypass.md)


## Files Included
- **redirectAPI.js / redirectAPI.md**: Handles URL redirection using encryption.
- **blockBypass.js / blockBypass.md**: Ensures requests come from approved referrers.
- **publicRelease.js / publicRelease.md**: A publicaly available method to reduce bypasses.

