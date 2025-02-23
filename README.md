# LootLabs Anti-Bypass
###### From the creator of https://lootlabs.pages.dev.

> TL;DR: This project blocks all attempts to bypass LootLabs content lockers through a secure Cloudflare Workers implementation.


## Need Help? I'll Set It Up for $5 in Crypto! 💰
If this setup feels overwhelming, I can help for just $5 in crypto. Ping me in the LootLabs Discord (@kbdevs) to get started.

---

This project contains a Cloudflare Worker to block all bypass attempts of LootLabs content locker links by using the redirect API and referrer blocking, as well this has some analytics tracking.

Currently this uses a KV to track the analytics, if you get too many clicks this will go over the cloudflare free tier, I will soon add an option to disable the analytics.

## Setup & Deployment

1. Deploy the [Worker](https://github.com/kbdevs/lootlabs-antibypass/blob/main/SETUP.md)

