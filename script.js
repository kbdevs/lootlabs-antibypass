// ==================== CONFIGURATION ====================
const CONFIG = {
	urls: {
	  example: {
		destination_url: "",
		lootlabs_url: "https://lootdest.org/s?WAyDAUH",
		steps: 10,
	  },

	},
	api: {
	  key: "lootlabs api key",
	  baseUrl: "where the worker is, e.g worker.dev/lootlabs",
	  defaultRedirect: "anywhere, e.g https://google.com",
	},
	security: {
	  allowedReferrers: [
		"https://lootdest.org/",
		"https://loot-dest.org/",
		"https://lootlabs.gg/",
		"https://loot-link.com/",
		"https://lootdest.com/",
	  ],
	  analyticsPassword: "you can make it",
	  analyticsEnabled: false,
	  encryptionKey: "encrypt",
	  discordWebhookEnabled: false,
	  discordWebhook: "https://.....",
	  maxTimeDiffSeconds: 30 * 60, // 30 minutes
	  minTimeDiffSeconds: 45, // 45 seconds minimum wait
	},
  };
  
  // Pre-computed encrypted URLs for better performance
  const ENCODED_URLS = Object.fromEntries(
	Object.entries(CONFIG.urls).map(([key, value]) => [
	  key,
	  {
		url: `${CONFIG.api.baseUrl}?mode=check`,
		link: value.lootlabs_url,
		destination_url: value.destination_url,
		steps: value.steps || 1,
	  }
	])
  );
  
  // ==================== CRYPTO UTILITIES ====================
  class CryptoUtils {
	static getKeyBytes(key) {
	  const encoder = new TextEncoder();
	  let keyBytes = encoder.encode(key);
	  
	  if (keyBytes.length < 32) {
		const padded = new Uint8Array(32);
		padded.set(keyBytes);
		return padded;
	  }
	  
	  return keyBytes.length > 32 ? keyBytes.slice(0, 32) : keyBytes;
	}
  
	static async encrypt(str, key) {
	  const encoder = new TextEncoder();
	  const iv = crypto.getRandomValues(new Uint8Array(12));
	  const keyBytes = this.getKeyBytes(key);
	  
	  const cryptoKey = await crypto.subtle.importKey(
		"raw", keyBytes, "AES-GCM", false, ["encrypt"]
	  );
	  
	  const encrypted = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv }, cryptoKey, encoder.encode(str)
	  );
	  
	  const combined = new Uint8Array(iv.length + encrypted.byteLength);
	  combined.set(iv, 0);
	  combined.set(new Uint8Array(encrypted), iv.length);
	  
	  return btoa(String.fromCharCode(...combined));
	}
  
	static async decrypt(encryptedStr, key) {
	  const data = Uint8Array.from(atob(encryptedStr), c => c.charCodeAt(0));
	  const iv = data.slice(0, 12);
	  const encrypted = data.slice(12);
	  const keyBytes = this.getKeyBytes(key);
	  
	  const cryptoKey = await crypto.subtle.importKey(
		"raw", keyBytes, "AES-GCM", false, ["decrypt"]
	  );
	  
	  const decrypted = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv }, cryptoKey, encrypted
	  );
	  
	  return new TextDecoder().decode(decrypted);
	}
  }
  
  // ==================== HTML TEMPLATES ====================
  class HTMLTemplates {
	static base({ title, bodyContent, redirectJs = '' }) {
	  return `<!DOCTYPE html>
  <html>
  <head>
	<meta charset="UTF-8">
	<title>${title}</title>
	<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap" rel="stylesheet">
	<style>
	  html, body { height: 100%; margin: 0; padding: 0; }
	  body {
		background: #121212; color: #e0e0e0;
		font-family: 'Lexend', sans-serif;
		display: flex; flex-direction: column;
		align-items: center; justify-content: center;
		gap: 1rem; text-align: center; padding: 2rem; box-sizing: border-box;
	  }
	  .spinner {
		border: 4px solid rgba(255,255,255,0.1);
		border-top: 4px solid #a855f7;
		border-radius: 50%; width: 48px; height: 48px;
		animation: spin 1s linear infinite; margin: 1rem auto;
	  }
	  @keyframes spin { to { transform: rotate(360deg); } }
	  a, strong { color: #a855f7; }
	  p { margin: .5rem 0; }
	</style>
  </head>
  <body>
	${bodyContent}
	${redirectJs}
  </body>
  </html>`;
	}
  
	static error(redirectUrl, reason) {
	  const bodyContent = `
	  	<div class="spinner"></div> <!-- Added spinner here -->
	  	<p><strong>Verification Failed.</strong></p> <!-- Clearer heading -->
	  	<p>${reason}</p>
		<p>Redirecting in  <strong><span id="countdown">10</span>...</strong></p>
	  `;
	  const redirectJs = `
		<script>
		  let c = 10;
		  const iv = setInterval(() => {
			if (--c <= 0) { 
			  clearInterval(iv); 
			  window.location.href = '${redirectUrl}'; 
			}
			document.getElementById('countdown').textContent = c;
		  }, 1000);
		</script>`;
	  
	  return this.base({ title: 'Access Denied', bodyContent, redirectJs });
	}
  
	static waiting({ currentStep, totalSteps }) {
	  const bodyContent = `
		<div class="spinner"></div>
		<p>Processing step <strong>${currentStep}</strong> of <strong>${totalSteps}</strong>…</p>
		<noscript><p><em>JavaScript is required. <a href="#">Retry</a></em></p></noscript>
	  `;
	  
	  return {
		htmlStart: this.base({ title: 'Please Wait', bodyContent }).split('</body>')[0]
	  };
	}
  
	static step({ current, total, nextUrl }) {
	  const bodyContent = `
		<div class="spinner"></div>
		<p>Step <strong>${current}</strong> of <strong>${total}</strong> complete.</p>
		<p>Redirecting to step <strong>${current + 1}</strong> in <span id="countdown">5</span>…</p>
	  `;
	  const redirectJs = `
		<script>
		  let c = 5;
		  const iv = setInterval(() => {
			c--;
			document.getElementById('countdown').textContent = c;
			if (c <= 0) {
			  clearInterval(iv);
			  window.location.href = "${nextUrl}";
			}
		  }, 1000);
		</script>`;
	  
	  return this.base({ title: `Step ${current} Complete`, bodyContent, redirectJs });
	}
  
	static notFound() {
	  return this.base({
		title: 'Access Denied',
		bodyContent: '<p>Do not try to bypass.</p>'
	  });
	}
  }
  
  // ==================== ANALYTICS ====================
  class Analytics {
	static async increment(type, target, meta = {}) {
	  const tasks = [];
	  
	  if (CONFIG.security.discordWebhookEnabled) {
		tasks.push(this.sendDiscordWebhook(type, target, meta));
	  }
	  
	  if (CONFIG.security.analyticsEnabled) {
		tasks.push(this.updateCounter(type, target));
	  }
	  
	  await Promise.allSettled(tasks);
	}
  
	static async sendDiscordWebhook(type, target, meta) {
	  const styles = {
		initial_requests: { title: "📥 Initial Request", color: 0x95A5A6 },
		bypass_bad_referrer: { title: "⛔ Bypass Blocked", color: 0xE74C3C },
		success: { title: "✅ Successful Redirect", color: 0x2ECC71 }
	  };
	  
	  const { title, color } = styles[type] || { title: "ℹ️ Counter Hit", color: 0x95A5A6 };
	  
	  const embed = {
		title,
		color,
		description: `A \`${type}\` event occurred for **${target}**.`,
		thumbnail: { url: CONFIG.urls[target]?.destination_url + "favicon.ico" },
		fields: [
		  { name: "Target Key", value: target, inline: true },
		  { name: "Step", value: `${meta.step || "-"}`, inline: true },
		  { name: "Referer", value: meta.referer || "-", inline: false },
		  { name: "User-Agent", value: meta.ua || "-", inline: false }
		],
		footer: { text: "Lootlabs Analytics" },
		timestamp: new Date().toISOString()
	  };
  
	  try {
		await fetch(CONFIG.security.discordWebhook, {
		  method: "POST",
		  headers: { "Content-Type": "application/json" },
		  body: JSON.stringify({
			username: "AIMr AI Lootlabs Logs",
			avatar_url: "https://i.imgur.com/5DL5To2.png",
			embeds: [embed]
		  })
		});
	  } catch (err) {
		console.error("Discord webhook error:", err);
	  }
	}
  
	static async updateCounter(type, target) {
	  const key = `${type}_${target}`;
	  const current = await requests_counts.get(key) || "0";
	  const next = parseInt(current, 10) + 1;
	  await requests_counts.put(key, next.toString());
	}
  }
  
  // ==================== REQUEST UTILITIES ====================
  class RequestUtils {
	static getClientIP(request) {
	  return request.headers.get("cf-connecting-ip") ||
			 request.headers.get("x-forwarded-for") ||
			 "0.0.0.0";
	}
  
	static getUserAgent(request) {
	  return request.headers.get("User-Agent") || "unknown";
	}
  
	static getReferrer(request) {
	  return request.headers.get("Referer") || "none";
	}
  
	static isAllowedReferrer(referer) {
	  return CONFIG.security.allowedReferrers.some(allowed => 
		referer.startsWith(allowed)
	  );
	}
  
	static validateTimestamp(urlTokenTimestamp) {
	  if (!urlTokenTimestamp) return { valid: false, reason: "Missing timestamp." };
	  
	  const currentTimestamp = Math.floor(Date.now() / 1000);
	  const diffSeconds = currentTimestamp - Number(urlTokenTimestamp);
	  
	  if (diffSeconds <= CONFIG.security.minTimeDiffSeconds) {
		return { valid: false, reason: "You were too quick." };
	  }
	  
	  if (diffSeconds >= CONFIG.security.maxTimeDiffSeconds) {
		return { valid: false, reason: "You took too long." };
	  }
	  
	  return { valid: true };
	}
  }
  
  // ==================== ROUTE HANDLERS ====================
  class RouteHandlers {
	static async handleRedirect(request, event) {
	  const url = new URL(request.url);
	  const targetKey = url.searchParams.get("url");
	  const currentStep = parseInt(url.searchParams.get("step")) || 1;
  
	  if (!targetKey || !ENCODED_URLS[targetKey]) {
		return Response.redirect(CONFIG.api.defaultRedirect, 302);
	  }
  
	  const redirectBase = ENCODED_URLS[targetKey].link;
	  const currentTimestamp = Math.floor(Date.now() / 1000);
	  const clientIp = RequestUtils.getClientIP(request);
  
	  // Generate encrypted tokens
	  const [timeToken, ipToken] = await Promise.all([
		CryptoUtils.encrypt(currentTimestamp.toString(), CONFIG.security.encryptionKey),
		CryptoUtils.encrypt(clientIp, CONFIG.security.encryptionKey)
	  ]);
  
	  const modifiedUrl = `${CONFIG.api.baseUrl}?mode=check&time=${encodeURIComponent(timeToken)}&step=${currentStep}&ip=${encodeURIComponent(ipToken)}&return=${targetKey}`;
  
	  const lootlabsParams = new URLSearchParams({
		destination_url: modifiedUrl,
		api_token: CONFIG.api.key,
	  });
  
	  const apiPromise = fetch(`https://be.lootlabs.gg/api/lootlabs/url_encryptor?${lootlabsParams}`)
		.then(response => response.json())
		.catch(() => null);
  
	  const { htmlStart } = HTMLTemplates.waiting({
		currentStep,
		totalSteps: ENCODED_URLS[targetKey].steps
	  });
  
	  const encoder = new TextEncoder();
	  const stream = new ReadableStream({
		async start(controller) {
		  controller.enqueue(encoder.encode(htmlStart));
		  
		  const result = await apiPromise;
		  
		  if (result?.message) {
			const finalUrl = `${redirectBase}&data=${result.message}`;
			controller.enqueue(encoder.encode(`
			  <script>window.location.href = "${finalUrl}";</script>
			</body></html>`));
		  } else {
			const destinationUrl = ENCODED_URLS[targetKey].destination_url;
			controller.enqueue(encoder.encode(`
			  <p>Oops, something went wrong.</p>
			  <p><a href="${modifiedUrl}">Try again</a> or <a href="${destinationUrl}">skip</a>.</p>
			</body></html>`));
		  }
		  
		  controller.close();
		}
	  });
  
	  return new Response(stream, { headers: { 'Content-Type': 'text/html' } });
	}
  
	static async handleBypassCheck(request, event) {
	  const url = new URL(request.url);
	  const returnPath = url.searchParams.get("return") || "home";
	  const currentStep = parseInt(url.searchParams.get("step")) || 1;
	  const requiredSteps = ENCODED_URLS[returnPath]?.steps || 1;
  
	  const destination = ENCODED_URLS[returnPath]?.destination_url || CONFIG.api.defaultRedirect;
	  const safeRedirect = `${CONFIG.api.baseUrl}?url=${returnPath}`;
	  const referer = RequestUtils.getReferrer(request);
	  const clientIp = RequestUtils.getClientIP(request);
  
	  let reasons = [];
  
	  // Validate referrer
	  if (!RequestUtils.isAllowedReferrer(referer)) {
		reasons.push("You didn't come from lootlabs.");
	  }
  
	  // Validate timestamp
	  const timeEnc = url.searchParams.get("time");
	  if (timeEnc) {
		try {
		  const urlTokenTimestamp = await CryptoUtils.decrypt(timeEnc, CONFIG.security.encryptionKey);
		  const timestampValidation = RequestUtils.validateTimestamp(urlTokenTimestamp);
		  if (!timestampValidation.valid) {
			reasons.push(timestampValidation.reason);
		  }
		} catch {
		  reasons.push("Invalid timestamp token.");
		}
	  } else {
		reasons.push("Missing timestamp.");
	  }
  
	  // Validate IP
	  const ipEnc = url.searchParams.get("ip");
	  if (ipEnc) {
		try {
		  const urlTokenIp = await CryptoUtils.decrypt(ipEnc, CONFIG.security.encryptionKey);
		  if (urlTokenIp !== clientIp) {
			reasons.push("You switched IPs.");
		  }
		} catch {
		  reasons.push("Invalid IP token.");
		}
	  } else {
		reasons.push("Missing IP token.");
	  }
  
	  // Log analytics
	  const meta = {
		step: url.searchParams.get("step") || "1",
		ip: clientIp,
		referer,
		ua: RequestUtils.getUserAgent(request)
	  };
  
	  if (reasons.length === 0) {
		// Success case
		event.waitUntil(Analytics.increment("success", returnPath, meta));
		
		if (currentStep < requiredSteps) {
		  const nextUrl = `${CONFIG.api.baseUrl}?url=${returnPath}&step=${currentStep + 1}`;
		  return new Response(
			HTMLTemplates.step({ current: currentStep, total: requiredSteps, nextUrl }),
			{ headers: { "Content-Type": "text/html" } }
		  );
		}
		
		return Response.redirect(destination, 302);
	  } else {
		// Failure case
		event.waitUntil(Analytics.increment("bypass_bad_referrer", returnPath, meta));
		
		const reason = reasons.join(" ") + "<br>If you continually have issues, join the discord at aimr.dev/discord.";
		return new Response(HTMLTemplates.error(safeRedirect, reason), {
		  headers: { "Content-Type": "text/html" },
		});
	  }
	}
  
	static async handle404(request) {
	  const url = new URL(request.url);
	  const returnPath = url.searchParams.get("url") || "home";
	  const safeRedirect = `${CONFIG.api.baseUrl}?url=${returnPath}`;
	  const reason = "Do not remove any parameters from the url.";
	  
	  return new Response(HTMLTemplates.error(safeRedirect, reason), {
		headers: { "Content-Type": "text/html" },
	  });
	}
  
	static async handleAnalytics(request) {
	  if (!CONFIG.security.analyticsEnabled) {
		return new Response("Analytics are disabled", { status: 404 });
	  }
  
	  const url = new URL(request.url);
	  const password = url.searchParams.get("password");
  
	  if (password !== CONFIG.security.analyticsPassword) {
		return new Response("Unauthorized", { status: 401 });
	  }
  
	  // Handle clear counters request
	  if (url.searchParams.get("action") === "clear") {
		const list = await requests_counts.list();
		await Promise.all(list.keys.map(key => requests_counts.delete(key.name)));
		return new Response(JSON.stringify({ success: true }), {
		  headers: { "Content-Type": "application/json" },
		});
	  }
  
	  try {
		const counters = { targets: {} };
		let totalInitialRequests = 0;
		let totalBypassBadReferrer = 0;
		let totalSuccess = 0;
  
		// Collect per-target stats
		for (const key of Object.keys(CONFIG.urls)) {
		  const targetStats = {
			initial_requests: await requests_counts.get(`initial_requests_${key}`) || "0",
			bypass_bad_referrer: await requests_counts.get(`bypass_bad_referrer_${key}`) || "0",
			success: await requests_counts.get(`success_${key}`) || "0",
		  };
  
		  counters.targets[key] = targetStats;
  
		  // Add to totals
		  totalInitialRequests += parseInt(targetStats.initial_requests);
		  totalBypassBadReferrer += parseInt(targetStats.bypass_bad_referrer);
		  totalSuccess += parseInt(targetStats.success);
		}
  
		// Add totals
		counters.initial_requests = totalInitialRequests.toString();
		counters.bypass_bad_referrer = totalBypassBadReferrer;
		counters.success = totalSuccess.toString();
  
		if (url.searchParams.get("json") === "1") {
		  return new Response(JSON.stringify(counters), {
			headers: { "Content-Type": "application/json" },
		  });
		}
  
		// Return HTML dashboard (truncated for brevity - would include the full HTML)
		const html = this.generateAnalyticsHTML(counters);
		return new Response(html, { headers: { "Content-Type": "text/html" } });
	  } catch (error) {
		return new Response("Error fetching analytics data", { status: 500 });
	  }
	}
  
	static generateAnalyticsHTML(counters) {
	  // This would contain the full analytics HTML template
	  // Truncated here for brevity, but would include all the dashboard HTML
	  return `
	  <!DOCTYPE html>
	  <html>
		<head>
		  <meta charset="UTF-8">
		  <title>Link Analytics</title>
		  <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap" rel="stylesheet">
		  <style>
			body { 
			  background-color: #121212; 
			  color: #e0e0e0; 
			  font-family: 'Lexend', sans-serif; 
			  padding: 2rem;
			  max-width: 1200px;
			  margin: 0 auto;
			}
			.stat-entry {
			  background: #1e1e1e; 
			  padding: 1.5rem;
			  margin: 0.8rem 0;
			  border-radius: 8px;
			  font-size: 1.2em;
			  display: flex;
			  justify-content: space-between;
			  align-items: center;
			  transition: transform 0.2s;
			}
			.stat-entry:hover {
			  transform: translateX(10px);
			}
			.stat-value {
			  font-weight: bold;
			  font-size: 1.4em;
			  color: #a855f7;
			}
			.button-container {
			  margin: 20px 0;
			  display: flex;
			  gap: 10px;
			}
			.clear-button {
			  background: #dc2626;
			  color: white;
			  border: none;
			  padding: 12px 24px;
			  border-radius: 8px;
			  cursor: pointer;
			  font-size: 1em;
			  transition: all 0.2s;
			}
			.clear-button:hover {
			  background: #ef4444;
			  transform: translateY(-2px);
			}
			.download-button {
			  background: #2563eb;
			  color: white;
			  border: none;
			  padding: 12px 24px;
			  border-radius: 8px;
			  cursor: pointer;
			  font-size: 1em;
			  transition: all 0.2s;
			}
			.download-button:hover {
			  background: #3b82f6;
			  transform: translateY(-2px);
			}
			.refresh-button {
			  background: #059669;
			  color: white;
			  border: none;
			  padding: 12px 24px;
			  border-radius: 8px;
			  cursor: pointer;
			  font-size: 1em;
			  transition: all 0.2s;
			}
			.refresh-button:hover {
			  background: #10b981;
			  transform: translateY(-2px);
			}
			.progress-bar {
			  width: 100%;
			  height: 30px;
			  background: #1e1e1e;
			  border-radius: 15px;
			  margin: 20px 0;
			  overflow: hidden;
			  position: relative;
			}
			.progress-segment {
			  height: 100%;
			  float: left;
			  transition: width 0.3s ease;
			}
			.progress-success {
			  background: #059669;
			}
			.progress-bypass {
			  background: #dc2626;
			}
			.progress-remaining {
			  background: #374151;
			}
			.stats-grid {
			  display: grid;
			  grid-template-columns: repeat(4, 1fr);
			  gap: 20px;
			  margin-top: 20px;
			}
			.stat-card {
			  background: #1e1e1e;
			  padding: 20px;
			  border-radius: 12px;
			  text-align: center;
			}
			.stat-card h3 {
			  color: #a855f7;
			  margin: 0 0 8px 0;
			}
			.stat-percentage {
			  font-size: 0.9em;
			  color: #9ca3af;
			}
			.target-stats {
			  margin-top: 20px;
			  padding: 20px;
			  background: #1a1a1a;
			  border-radius: 12px;
			}
			.target-stats h3 {
			  color: #a855f7;
			  margin-bottom: 12px;
			  margin-top: 0px;
			  text-transform: uppercase;
			}
			.mini-progress {
			  width: 100%;
			  height: 4px;
			  background: #374151;
			  border-radius: 2px;
			  margin-top: 8px;
			  overflow: hidden;
			}
			.mini-progress-fill {
			  height: 100%;
			  border-radius: 2px;
			  transition: width 0.3s ease;
			}
			.mini-progress-success { background: #059669; }
			.mini-progress-bypass { background: #dc2626; }
			.mini-progress-incomplete { background: #374151; }
		.footer {
		  margin-top: 20px;
		  padding: 20px;
		  text-align: center;
		  color: #9ca3af;
		  border-top: 1px solid #2d2d2d;
		}
		.footer a {
		  color: #a855f7;
		  text-decoration: none;
		}
		.footer a:hover {
		  text-decoration: underline;
		}
		  </style>
		</head>
		<body>
		  <h1>Link Analytics Dashboard</h1>
		  <div class="button-container">
			<button class="clear-button" onclick="clearCounters()">Clear All Counters</button>
			<button class="download-button" onclick="downloadCounters()">Download as JSON</button>
			<button class="refresh-button" onclick="window.location.reload()">Refresh Page</button>
		  </div>
  
		  <h2>Total Statistics</h2>
		  <div class="target-stats">
			<div class="stats-grid">
			  <div class="stat-card">
				<h3>INITIAL</h3>
				<div class="stat-value">${counters.initial_requests}</div>
			  </div>
			  <div class="stat-card">
				<h3>SUCCESS</h3>
				<div class="stat-value">${counters.success}</div>
				<div class="stat-percentage">${(
								  (parseInt(counters.success) /
									  parseInt(counters.initial_requests)) *
									  100 || 0
							  ).toFixed(1)}%</div>
			  </div>
			  <div class="stat-card">
				<h3>BLOCKED</h3>
				<div class="stat-value">${counters.bypass_bad_referrer}</div>
				<div class="stat-percentage">${(
								  (counters.bypass_bad_referrer / parseInt(counters.initial_requests)) * 100 || 0
							  ).toFixed(1)}%</div>
			  </div>
			  <div class="stat-card">
				<h3>INCOMPLETE</h3>
				<div class="stat-value">${
								  parseInt(counters.initial_requests) -
								  parseInt(counters.success) -
								  counters.bypass_bad_referrer
							  }</div>
				<div class="stat-percentage">${(
								  ((parseInt(counters.initial_requests) -
									  parseInt(counters.success) -
									  counters.bypass_bad_referrer) /
									  parseInt(counters.initial_requests)) *
									  100 || 0
							  ).toFixed(1)}%</div>
			  </div>
			</div>
			<div class="progress-bar">
			  <div class="progress-segment progress-success" style="width: ${
							  (parseInt(counters.success) /
								  parseInt(counters.initial_requests)) *
								  100 || 0
						  }%"></div>
			  <div class="progress-segment progress-bypass" style="width: ${
							  (counters.bypass_bad_referrer / parseInt(counters.initial_requests)) * 100 || 0
						  }%"></div>
			  <div class="progress-segment progress-remaining" style="width: ${
							  ((parseInt(counters.initial_requests) -
								  parseInt(counters.success) -
								  counters.bypass_bad_referrer) /
								  parseInt(counters.initial_requests)) *
								  100 || 0
						  }%"></div>
			</div>
		  </div>
  
		  <h2>Per-Target Statistics</h2>
		  ${Object.entries(counters.targets)
					  .sort(
						  ([, a], [, b]) =>
							  parseInt(b.initial_requests) - parseInt(a.initial_requests)
					  )
					  .map(
						  ([target, stats]) => `
			  <div class="target-stats">
				<h3>${target}</h3>
				<div class="stats-grid">
				  <div class="stat-card">
					<h3>INITIAL</h3>
					<div class="stat-value">${stats.initial_requests}</div>
				  </div>
				  <div class="stat-card">
					<h3>SUCCESS</h3>
					<div class="stat-value">${stats.success}</div>
					<div class="stat-percentage">${(
										  (parseInt(stats.success) /
											  parseInt(stats.initial_requests)) *
											  100 || 0
									  ).toFixed(1)}%</div>
				  </div>
				  <div class="stat-card">
					<h3>BLOCKED</h3>
					<div class="stat-value">${stats.bypass_bad_referrer}</div>
					<div class="stat-percentage">${(
										  (parseInt(stats.bypass_bad_referrer) /
											  parseInt(stats.initial_requests)) *
											  100 || 0
									  ).toFixed(1)}%</div>
				  </div>
				  <div class="stat-card">
					<h3>INCOMPLETE</h3>
					<div class="stat-value">${
										  parseInt(stats.initial_requests) -
										  parseInt(stats.success) -
										  parseInt(stats.bypass_bad_referrer)
									  }</div>
					<div class="stat-percentage">${(
										  ((parseInt(stats.initial_requests) -
											  parseInt(stats.success) -
											  parseInt(stats.bypass_bad_referrer)) /
											  parseInt(stats.initial_requests)) *
											  100 || 0
									  ).toFixed(1)}%</div>
				  </div>
				</div>
				<div class="progress-bar">
				  <div class="progress-segment progress-success" style="width: ${
									  (parseInt(stats.success) / parseInt(stats.initial_requests)) *
										  100 || 0
								  }%"></div>
				  <div class="progress-segment progress-bypass" style="width: ${
									  (parseInt(stats.bypass_bad_referrer) /
										  parseInt(stats.initial_requests)) *
										  100 || 0
								  }%"></div>
				  <div class="progress-segment progress-remaining" style="width: ${
									  ((parseInt(stats.initial_requests) -
										  parseInt(stats.success) -
										  parseInt(stats.bypass_bad_referrer)) /
										  parseInt(stats.initial_requests)) *
										  100 || 0
								  }%"></div>
				</div>
			  </div>
			`
					  )
					  .join("")}
  
		  <div class="footer">
			Made by kbdevs, creator of <a href="https://lootlabs.pages.dev" target="_blank">lootlabs.pages.dev</a>
		  </div>
  
		  <script>
			window.clearCounters = async function() {
			  if (!confirm('Are you sure you want to clear all counters?')) return;
			  const response = await fetch(window.location.href + '&action=clear');
			  const result = await response.json();
			  if (result.success) {
				window.location.reload();
			  }
			}
  
			window.downloadCounters = async function() {
			  const baseUrl = window.location.href.replace('&json=1','').replace('?json=1','');
			  const fetchUrl = baseUrl.includes('?') ? baseUrl + '&json=1' : baseUrl + '?json=1';
			  const response = await fetch(fetchUrl);
			  const jsonData = await response.json();
			  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
			  const link = document.createElement('a');
			  link.href = URL.createObjectURL(blob);
			  link.download = 'counters.json';
			  document.body.appendChild(link);
			  link.click();
			  document.body.removeChild(link);
			}
		  </script>
		</body>
	  </html>
	  `;
	}
  }
  
  // ==================== MAIN REQUEST HANDLER ====================
  async function handleRequest(request, event) {
	const url = new URL(request.url);
	const basePath = url.origin + url.pathname;
	const mode = url.searchParams.get("mode");
	const targetKey = url.searchParams.get("url");
  
	// Early return for disabled analytics
	if (!CONFIG.security.analyticsEnabled && basePath === CONFIG.api.baseUrl + "/analytics") {
	  return new Response("Analytics are disabled", { status: 404 });
	}
  
	// Route to appropriate handler
	if (basePath === CONFIG.api.baseUrl + "/analytics") {
	  return RouteHandlers.handleAnalytics(request);
	}
  
	if (basePath === CONFIG.api.baseUrl + "/404") {
	  return RouteHandlers.handle404(request);
	}
  
	// Log initial requests
	if (targetKey && !mode) {
	  const meta = {
		step: url.searchParams.get("step") || "1",
		ip: RequestUtils.getClientIP(request),
		referer: RequestUtils.getReferrer(request),
		ua: RequestUtils.getUserAgent(request)
	  };
	  event.waitUntil(Analytics.increment("initial_requests", targetKey, meta));
	}
  
	if (mode === "check") {
	  return RouteHandlers.handleBypassCheck(request, event);
	}
  
	return RouteHandlers.handleRedirect(request, event);
  }
  
  // ==================== EVENT LISTENER ====================
  addEventListener("fetch", event => {
	event.respondWith(handleRequest(event.request, event));
  });
		
