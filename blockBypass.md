# BlockBypass Worker
###### From the creator of https://lootlabs.pages.dev.

## Need Help? I'll Set It Up for $5 in Crypto! 💰
If this setup feels overwhelming, I can help for just $5 in crypto. Ping me in the LootLabs Discord (@kbdevs) to get started.

---

## What Does This Worker Do? 🔒
This Cloudflare Worker prevents unauthorized bypass of LootLabs content lockers by checking the `Referer` header. Only requests from approved domains are allowed, and any untrusted request is redirected to a safe URL.

### 🚀 How It Works
1. Listens for incoming requests.
2. Checks the `Referer` header against a list of allowed domains.
3. If the request originates from an untrusted source, responds with a redirect or informative page.
4. For valid requests, decodes the destination URL and redirects the user accordingly.

### 🔥 Key Features
✅ Prevents bypass attempts by validating referrers.<br>
✅ Decodes and validates destination URLs for correct redirection.<br>
✅ Easily deployable as a Cloudflare Worker with ultra-fast performance.<br>

---

## 📌 Setup Guide

### 1️⃣ Deploy on Cloudflare Workers
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Compute (Workers)**.
3. Click **Create**.
4. Ensure you're on the **Workers** tab.
5. Click **Create Worker**, name it (e.g., `blockBypass`), and deploy.
6. In the Editor, paste the BlockBypass script.

### 2️⃣ Test Your Worker
1. Open your Worker URL with appropriate parameters.
2. Verify that requests from trusted domains are properly redirected, while others receive the fallback response.

---

## 🛠 Example Usage
If your deployed Worker URL is `https://yourworker.workers.dev/`, a typical request would be:

```
https://yourworker.workers.dev/?url=yourEncodedURL
```

#### The `yourEncodedURL` is the base64 encoded version of the final url.

🔹 The worker validates the referrer, decodes the URL, and redirects users accordingly.

### ❗ Important Notes
- If a request comes from an unapproved referrer, the user is redirected back to a safe base URL.
- Validate and secure your deployment settings to prevent misuse.

---

## ❤️ Support & Donations
If you find this worker useful and want to support me, consider donating:

### **Crypto Wallets**

**Bitcoin (BTC):**  
`bc1q5kvxfy2d9ptcjlf3plz5j47g8x06ucym4ulste`

**Ethereum (ETH) & USDT (ERC-20) & USDC (ERC-20):**  
`0xE80Dc00cBf1947282eaC355D5f6daAccB5ee86fF`

**Litecoin (LTC):**  
`LSAFBzjE91KkWDbCBB1WZmFbe4U9XYac9L`

**Monero (XMR):**  
`42VNEjqQ9qWGoovQ2V7XQfWFkDWhyFWdMQqM5Nv5GK8DBdGJeajZQvi8ypn6NzSVhiLFhiX96LDuxMw6vubVxaYd3JoiXqG`

**Solana (SOL):**  
`3VWTezAw3pjw71uea5UtY3BkGTdVvXZMoTnZJhyLFccP`

🙌 Thanks for your support!

