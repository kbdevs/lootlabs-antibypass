# LootLabs Anti-Bypass Worker

## If this seems like too much work, I will personally set it up for $5 crypto! (It's worth it)

This Cloudflare Worker ensures that users cannot bypass LootLabs content lockers by directly accessing the destination URL. Instead, it dynamically generates a secure, encrypted LootLabs link.

## How It Works
- The script listens for incoming requests.
- It checks if the requested URL matches one of the predefined `custom_urls`.
- If a match is found, it appends an `antibypass` parameter to the target URL to prevent caching.
- The script then calls LootLabs' API to encrypt the new URL.
- Users are redirected to the encrypted LootLabs link instead of the original destination.

## Features
✅ Prevents direct access to the destination URL.<br>
✅ Uses dynamic URL encryption to make bypassing harder.<br>
✅ Can be deployed as a Cloudflare Worker for fast performance.<br>

## Setup Instructions

### 1. Deploy on Cloudflare Workers
###### If this seems like too much work, I will personally set it up for $5 crypto! (It's worth it)
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the sidebar navigate to **Compute (Workers)**.
3. Click **Create** at the top.
4. Make sure you are on the workers tab (not the pages tab)
5. Click **Create worker**
6. Set the name of the worker to something memorable (ex. lootlabsapi)
7. Note down the URL shown under the entry field, it is important for later!
8. Click **Deploy**
9. In the top right click **Edit Code**
10. Paste in the **[script.js](https://raw.githubusercontent.com/kbdevs/lootlabs-antibypass/refs/heads/main/script.js?v=1)**
11. Edit the variables with steps #2 & #3

### 2. Configure Your Custom URLs
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
- **Key** (`example`, `real`) is the identifier used in the `url` query parameter.
- **url** is the final destination where users should be redirected **after** unlocking the content.
- **link** is the base LootLabs content locker link.

### 3. Get Your LootLabs API Key
- Sign up or log in to [LootLabs](https://creators.lootlabs.gg/advanced).
- Navigate to the API settings and copy your API key.
- Replace `your lootlabs api key` in the script with your actual key.

### 4. Test Your Worker
- Visit `https://your-worker-url/?url=one of your items`.
- You should be redirected to the LootLabs content locker with a dynamically generated encrypted link.

## Example Usage
Assuming your Worker is deployed at `https://yourworker.workers.dev/`, a valid request would look like:

```
https://yourworker.workers.dev/?url=real
```
This will:
1. Generate a new encrypted LootLabs link.
2. Redirect the user to it instead of the original URL.

## Notes
- If an invalid `url` parameter is provided, users are redirected to Google by default.
- Always keep your API key secure.
