# Setup
###### From the creator of https://lootlabs.pages.dev.

## Need Help? I'll Set It Up for $5 in Crypto! 💰
If this setup feels overwhelming, I can help for just $5 in crypto. Ping me in the LootLabs Discord (@kbdevs) to get started.

---

## 📌 Setup Guide

### 1️⃣ Deploy on Cloudflare Workers
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Compute (Workers)**.
![image](https://github.com/user-attachments/assets/e7a22c67-5cd1-4efb-b3e2-c6aaecd7427c)
3. Click **Create**.
![image](https://github.com/user-attachments/assets/c2ed4036-687f-405c-aff5-a60d3d4aac82)
4. Ensure you're on the **Workers** tab.
5. Click **Quick Start**.
![image](https://github.com/user-attachments/assets/afc0b622-1e75-4acd-896f-90df71f41657)
6. Name your worker something memorable (e.g. lootlabsapi)
![image](https://github.com/user-attachments/assets/521ddb57-00f4-47a8-b904-93074a80d67a)
7. Click **Edit code**
![image](https://github.com/user-attachments/assets/58f1d0a3-affd-4a10-8690-227b324caf2c)
8. Replace all the code with **[script.js](https://raw.githubusercontent.com/kbdevs/lootlabs-antibypass/refs/heads/main/script.js?v=1)**
9. Click **Deploy**
![image](https://github.com/user-attachments/assets/f4c73786-759c-4ba8-afaa-5cf711d8bf17)
10. Click back
<img width="1710" alt="image" src="https://github.com/user-attachments/assets/fb6a3d78-6a79-44fb-a539-a28499ed7611" />
11. Click **Storage & Databases** then **KV**
<img width="1747" alt="image" src="https://github.com/user-attachments/assets/d3b89087-698f-4e48-8ad9-7928b53d04d4" />
12. Click **Create**
<img width="1391" alt="image" src="https://github.com/user-attachments/assets/ed6ad1a4-50e2-41ae-9ce1-2021354f3fe0" />
13. Name it lootlabs and click **Create**
<img width="1344" alt="image" src="https://github.com/user-attachments/assets/c865fb3e-ffcd-4d42-8d56-a79b507ffdbc" />
14. Go back to **Compute (Workers)** and click on your lootlabs worker
<img width="1710" alt="image" src="https://github.com/user-attachments/assets/974409ff-1bf2-490c-80b0-36de251053eb" />
14. Click **Settings**
<img width="1453" alt="image" src="https://github.com/user-attachments/assets/b77a8f1d-552e-4e8d-8877-b59b34571bd4" />
15. Click **Add**
<img width="1455" alt="image" src="https://github.com/user-attachments/assets/c8d27fff-cc89-4728-84be-c2deaa572472" />
16. Click **KV Namespace** <br>
<img width="390" alt="image" src="https://github.com/user-attachments/assets/2051f69d-4e42-4cf1-ade0-e9f96295ddfd" /> <br>
17. Click **Save** <br>
<img width="399" alt="image" src="https://github.com/user-attachments/assets/e57ec77d-365a-4f8f-a64b-58c5366c5c5f" /> <br>
17. Click edit code and scroll to the top of script and customize it to your use.

## Note
If you get too many requests, you may go over the cloudflare KV free tier usage, if this happens just go into the script and change the analytics toggle to false.

## 🛠 Example Usage
If your deployed Worker URL is `https://yourworker.workers.dev/`, a typical request would be:

```
https://yourworker.workers.dev/?url=example
```

---
