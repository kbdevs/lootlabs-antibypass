# LootLabs Redirect API Worker
###### From the creator of https://lootlabs.pages.dev.

## Need Help? I'll Set It Up for $5 in Crypto! 💰
If this setup feels like too much work, I can personally handle it for just $5 in crypto. It's worth it! Ping me in the LootLabs Discord (@kbdevs) to get started.

---

## What Does This Worker Do? 🔒
This Cloudflare Worker prevents users from bypassing LootLabs content lockers by directly accessing the destination URL. Instead, it dynamically generates a secure, encrypted LootLabs link.

### 🚀 How It Works
1. Listens for incoming requests.
2. Checks if the requested URL matches a predefined `custom_urls` entry.
3. Appends an `antibypass` parameter to the target URL to prevent caching.
4. Calls the LootLabs API to encrypt the new URL.
5. Redirects users to the encrypted LootLabs link instead of the original destination.

### 🔥 Key Features
✅ Obfuscates the destination URL.<br>
✅ Uses dynamic URL encryption to enhance security.<br>
✅ Deploys as a Cloudflare Worker for ultra-fast performance.<br>

---

## 📌 Setup Guide

### 1️⃣ Deploy on Cloudflare Workers
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Compute (Workers)** in the sidebar.
3. Click **Create** at the top.
4. Ensure you're on the **Workers** tab (not Pages).
5. Click **Create Worker**.
6. Name the worker (e.g., `lootlabsapi`).
7. Note the generated Worker URL – you'll need this later.
8. Click **Deploy**.
9. In the top right, click **Edit Code**.
10. Paste in the script: **[redirectAPI.js](https://raw.githubusercontent.com/kbdevs/lootlabs-antibypass/refs/heads/main/redirectAPI.js?v=1)**.
11. Modify the necessary variables using steps #2 and #3 below.

### 2️⃣ Configure Your Custom URLs
Edit the `custom_urls` object in the script:

```javascript
const custom_urls = {
  "example": {
    "url": "where i want it to go",
    "link": "the lootlabs base link for this content locker"
  },
  "real": {
    "url": "https://google.com",
    "link": "https://loot-link.com/s?idjadaoj"
  }
}
```

- **Key** (`example`, `real`) is used as an identifier in the `url` query parameter.
- **url** is the final destination after unlocking the content.
- **link** is the base LootLabs content locker link.

### 3️⃣ Get Your LootLabs API Key
1. Go to [LootLabs Advanced Settings](https://creators.lootlabs.gg/advanced).
2. Copy your API key.
3. Replace `your lootlabs api key` in the script with your actual key.

### 4️⃣ Test Your Worker
1. Open `https://your-worker-url/?url=one-of-your-items` in a browser.
2. If everything is set up correctly, you'll be redirected to the encrypted LootLabs content locker link.

---

## 🛠 Example Usage
If your Worker is deployed at `https://yourworker.workers.dev/`, a valid request would be:

```
https://yourworker.workers.dev/?url=real
```

🔹 This generates an encrypted LootLabs link and redirects the user securely.

### ❗ Important Notes
- If an invalid `url` parameter is provided, users are redirected to Google by default.
- Keep your API key **secure** at all times.

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
