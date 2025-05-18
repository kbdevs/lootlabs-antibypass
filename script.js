// Main configuration object
const CONFIG = {
	// Custom URLs configuration
	urls: {
		// custom urls for the api
		example: {
			destination_url: "https://content.com",
			lootlabs_url: "https://lootdest.org/s?hUSRBMP",
			steps: 1,
		}
    // this would be https://worker.url/?url=example
		// add more urls here
		// you should make the lootlabs url point to the 404 page at /404 so that the bypass is blocked if they try to bypass the api
		// example: https://worker.dev/404?url=example
	},

	// API and URL configuration
	api: {
		// lootlabs api key
		key: "",
		// base url for the api
		baseUrl: "",
    // where the api is, its domain/url, ex. https://example.com/lootlabs
		// default redirect url
		defaultRedirect: "https://google.com",
	},

	// Security configuration
	security: {
		// allowed referrers
		allowedReferrers: [
			"https://lootdest.org/",
			"https://loot-dest.org/",
			"https://lootlabs.gg/",
			"https://loot-link.com/",
			"https://lootdest.com/",
		],
		// analytics password
		analyticsPassword: "password",
		// toggle for analytics features
		analyticsEnabled: true,
		// .../analytics?password=password
		encryptionKey: "encrypt",
	},
};


// in lootlabs make all of your links point to the 404 page at /404

const ALLOWED_REFERRERS = CONFIG.security.allowedReferrers;
const ANALYTICS_PASSWORD = CONFIG.security.analyticsPassword;

// Pre-encode URLs (modified: remove data param and store destination_url)
const ENCODED_URLS = {};
for (const [key, value] of Object.entries(CONFIG.urls)) {
	ENCODED_URLS[key] = {
		url: `${CONFIG.api.baseUrl}?mode=check`,
		link: value.lootlabs_url,
		destination_url: value.destination_url,
		steps: value.steps || 1,
	};
}

// Error page template
const createErrorPage = (redirectUrl, reason) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Access Denied</title>
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap" rel="stylesheet">
    <style>
      html, body { height: 100%; margin: 0; padding: 0; }
      body {
        background-color: #121212;
        color: #e0e0e0;
        font-family: 'Lexend', sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        text-align: center;
        padding: 2rem;
        box-sizing: border-box;
      }
      a, strong { color: #a855f7; }
      p { margin: 8px 0; }

    </style>
  </head>
  <body>
    <p>${reason}</p>
    <p>Redirecting back in <span id="countdown">5</span> seconds...</p>
    <script>
      let countdown = 5;
      const interval = setInterval(() => {
        countdown--;
        document.getElementById('countdown').textContent = countdown;
        if (countdown <= 0) {
          clearInterval(interval);
          window.location.href = '${redirectUrl}';
        }
      }, 1000);
    </script>
  </body>
</html>
`;

// Error page template
const create404Page = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Access Denied</title>
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap" rel="stylesheet">
    <style>
      html, body { height: 100%; margin: 0; padding: 0; }
      body {
        background-color: #121212;
        color: #e0e0e0;
        font-family: 'Lexend', sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        text-align: center;
        padding: 2rem;
        box-sizing: border-box;
      }
      a, strong { color: #a855f7; }
      p { margin: 8px 0; }

    </style>
  </head>
  <body>
    <p>Do not try to bypass.</p>
  </body>
</html>
`;

// Modified incrementCounter function
async function incrementCounter(type, target) {
	if (!CONFIG.security.analyticsEnabled) return; // Skip if analytics disabled
	const key = `${type}_${target}`;
	const currentCount = (await requests_counts.get(key)) || "0";
	await requests_counts.put(key, (parseInt(currentCount) + 1).toString());
}

addEventListener("fetch", (event) => {
	event.respondWith(handleRequest(event.request, event));
});

function handleRequest(request, event) {
	const url = new URL(request.url);

	// Return early for analytics endpoints if disabled
	if (
		!CONFIG.security.analyticsEnabled &&
		url.origin + url.pathname === CONFIG.api.baseUrl + "/analytics"
	) {
		return new Response("Analytics are disabled", { status: 404 });
	}

	if (url.origin + url.pathname === CONFIG.api.baseUrl + "/analytics") {
		return handleAnalytics(request, event);
	}

	if (url.origin + url.pathname === CONFIG.api.baseUrl + "/404") {
		// return new Response(create404Page, {
		//   headers: { 'Content-Type': 'text/html' }
		// });
		const returnPath = url.searchParams.get("url") || "home";
		const safeRedirect = `${CONFIG.api.baseUrl}?url=${returnPath}`;

        const reason = "Do not remove any parameters from the url.";
		return new Response(createErrorPage(safeRedirect, reason), {
			headers: { "Content-Type": "text/html" },
		});
	}

	const mode = url.searchParams.get("mode");
	const targetKey = url.searchParams.get("url");

	if (targetKey && !mode) {
		event.waitUntil(incrementCounter("initial_requests", targetKey));
	}

	if (mode === "check") {
		return handleBypassCheck(request, event);
	}
	return handleRedirect(request, event);
}

function getAesKeyBytes(key) {
	// Ensure key is 32 bytes (256 bits) for AES-256-GCM
	const encoder = new TextEncoder();
	let keyBytes = encoder.encode(key);
	if (keyBytes.length < 32) {
		// Pad with zeros if too short
		let padded = new Uint8Array(32);
		padded.set(keyBytes);
		keyBytes = padded;
	} else if (keyBytes.length > 32) {
		// Truncate if too long
		keyBytes = keyBytes.slice(0, 32);
	}
	return keyBytes;
}

async function encryptString(str, key) {
	const encoder = new TextEncoder();
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const keyBytes = getAesKeyBytes(key);
	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		keyBytes,
		"AES-GCM",
		false,
		["encrypt"]
	);
	const encrypted = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		cryptoKey,
		encoder.encode(str)
	);
	// Combine IV and encrypted data, then base64 encode
	const combined = new Uint8Array(iv.length + encrypted.byteLength);
	combined.set(iv, 0);
	combined.set(new Uint8Array(encrypted), iv.length);
	return btoa(String.fromCharCode(...combined));
}

async function decryptString(encryptedStr, key) {
	const data = Uint8Array.from(atob(encryptedStr), (c) => c.charCodeAt(0));
	const iv = data.slice(0, 12);
	const encrypted = data.slice(12);
	const encoder = new TextEncoder();
	const decoder = new TextDecoder();
	const keyBytes = getAesKeyBytes(key);
	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		keyBytes,
		"AES-GCM",
		false,
		["decrypt"]
	);
	const decrypted = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv },
		cryptoKey,
		encrypted
	);
	return decoder.decode(decrypted);
}

async function handleRedirect(request, event) {
	const url = new URL(request.url);
	const targetKey = url.searchParams.get("url");
	const currentStep = parseInt(url.searchParams.get("step")) || 1;


	if (!targetKey || !ENCODED_URLS[targetKey]) {
		return Response.redirect(CONFIG.api.defaultRedirect, 302);
	}
  	const redirectBase = ENCODED_URLS[targetKey].link;

	// Time token (unchanged)
	const currentTimestamp = Math.floor(Date.now() / 1000);
	const timeToken = await encryptString(
		currentTimestamp.toString(),
		CONFIG.security.encryptionKey
	);

	// New: IP token
	// Cloudflare exposes the client IP in cf-connecting-ip; fallback to x-forwarded-for
	const clientIp =
		request.headers.get("cf-connecting-ip") ||
		request.headers.get("x-forwarded-for") ||
		"0.0.0.0";
	const ipToken = await encryptString(clientIp, CONFIG.security.encryptionKey);

	// Build your check-URL with both tokens
	const modifiedUrl =
		`${CONFIG.api.baseUrl}` +
		`?mode=check` +
		`&time=${encodeURIComponent(timeToken)}` +
		`&level=${currentStep}` +
		`&ip=${encodeURIComponent(ipToken)}` +
		`&return=${targetKey}`;

	const destinationUrl = ENCODED_URLS[targetKey].destination_url;

	const lootlabsParams = new URLSearchParams({
		destination_url: modifiedUrl,
		api_token: CONFIG.api.key,
	});

    console.log("waiting for lootlabs api");
	const apiPromise = fetch(
		`https://be.lootlabs.gg/api/lootlabs/url_encryptor?${lootlabsParams}`
	)
		.then((response) => response.json())
		.catch(() => null);

	const encoder = new TextEncoder();
	const stream = new ReadableStream({
		async start(controller) {
			controller.enqueue(
				encoder.encode(`
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Please Wait</title>
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap" rel="stylesheet">
    <style>
      html, body { height: 100%; margin: 0; padding: 0; }
      body {
        background-color: #121212;
        color: #e0e0e0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Lexend', sans-serif;
        flex-direction: column;
        text-align: center;
        padding: 2rem;
      }
    </style>
  </head>
  <body>
    <p>Please wait while we process your request...</p>
`)
			);

			const result = await apiPromise;
			const finalRedirect = result?.message
				? `${redirectBase}&data=${result.message}`
				: destinationUrl;
			controller.enqueue(
				encoder.encode(`
    <script>
      window.location.href = "${finalRedirect}";
    </script>
  </body>
</html>
`)
			);
			controller.close();
		},
	});

	return new Response(stream, {
		headers: { "Content-Type": "text/html" },
	});
}


const createStepPage = (current, total, nextUrl) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Step ${current} Complete</title>
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap" rel="stylesheet">
    <style>
      html, body { height:100%; margin:0; display:flex; align-items:center; justify-content:center; background:#121212; color:#e0e0e0; font-family:'Lexend',sans-serif; text-align:center; padding:2rem; }
      a, strong { color:#a855f7; }
    </style>
  </head>
  <body>
    <p>Thank you for completing step ${current} of ${total}.</p>
	<br>
    <p>Redirecting you to step ${current + 1} in <span id="countdown">5</span> seconds…</p>
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
    </script>
  </body>
</html>
`;

async function handleBypassCheck(request, event) {
	const url = new URL(request.url);
	const returnPath = url.searchParams.get("return") || "home";
	const currentStep = parseInt(url.searchParams.get("step")) || 1;
	const requiredSteps = ENCODED_URLS[returnPath].steps || 1;

	const destination =
		ENCODED_URLS[returnPath]?.destination_url || CONFIG.api.defaultRedirect;
	const safeRedirect = `${CONFIG.api.baseUrl}?url=${returnPath}`;
	const referer = request.headers.get("Referer") || "";
    let reason = "";

	// Decrypt the time token (existing)
	const timeEnc = url.searchParams.get("time");
	let urlTokenTimestamp = null;
	if (timeEnc) {
		urlTokenTimestamp = await decryptString(
			timeEnc,
			CONFIG.security.encryptionKey
		);
	}

	// 🖧 Decrypt the IP token
	const ipEnc = url.searchParams.get("ip");
	let urlTokenIp = null;
	if (ipEnc) {
		urlTokenIp = await decryptString(ipEnc, CONFIG.security.encryptionKey);
	}

	// Re-obtain the client IP
	const clientIp =
		request.headers.get("cf-connecting-ip") ||
		request.headers.get("x-forwarded-for") ||
		"";

	// Validate time window (as you already do)…
	const currentTimestamp = Math.floor(Date.now() / 1000);
	let isTimestampValid = false;
	if (urlTokenTimestamp) {
		const diffSeconds = currentTimestamp - Number(urlTokenTimestamp);
		if (diffSeconds <= 45) {
			reason += "You were too quick. ";
		} else if (diffSeconds >= 30 * 60) {
            reason += `You took too long. `;
      	} else {
			isTimestampValid = true;
		}
	}

	// Validate IP match
	const isIpValid = urlTokenIp === clientIp;

	// Allowed referrer check (unchanged)
	const isAllowedReferrer = ALLOWED_REFERRERS.some((allowed) =>
		referer.startsWith(allowed)
	);

	// Only allow if all three are true
	if (isAllowedReferrer && isTimestampValid && isIpValid) {
		event.waitUntil(incrementCounter("success", returnPath));
		if (currentStep < requiredSteps) {
			const nextUrl = `${CONFIG.api.baseUrl}?url=${returnPath}&step=${currentStep + 1}`;
			return new Response(
				createStepPage(currentStep, requiredSteps, nextUrl),
				{ headers: { "Content-Type": "text/html" } }
			);
		}
			// last step → go live
		return Response.redirect(destination, 302);
		// return Response.redirect(destination, 302);
	}
  if (!isAllowedReferrer) {
        reason += `You didn't come from lootlabs. `;
	}
  if (!isIpValid) {
        reason += `You switched IPs. `;
	}

	// Otherwise, block
	reason += "<br>If you continually have issues, join the discord at aimr.dev/discord.";
	event.waitUntil(incrementCounter("bypass_bad_referrer", returnPath));
	return new Response(createErrorPage(safeRedirect, reason), {
		headers: { "Content-Type": "text/html" },
	});
}

async function handleAnalytics(request, event) {
	if (!CONFIG.security.analyticsEnabled) {
		return new Response("Analytics are disabled", { status: 404 });
	}

	const url = new URL(request.url);
	const password = url.searchParams.get("password");

	if (password !== ANALYTICS_PASSWORD) {
		return new Response("Unauthorized", { status: 401 });
	}

	// Handle clear counters request
	if (url.searchParams.get("action") === "clear") {
		const list = await requests_counts.list();
		await Promise.all(list.keys.map((key) => requests_counts.delete(key.name)));
		return new Response(JSON.stringify({ success: true }), {
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const list = await requests_counts.list();
		const counters = {
			targets: {},
		};

		// Initialize totals
		let totalInitialRequests = 0;
		let totalBypassBadReferrer = 0;
		let totalSuccess = 0;

		// Collect per-target stats and calculate totals
		for (const key of Object.keys(CONFIG.urls)) {
			const targetStats = {
				initial_requests:
					(await requests_counts.get(`initial_requests_${key}`)) || "0",
				bypass_bad_referrer:
					(await requests_counts.get(`bypass_bad_referrer_${key}`)) || "0",
				success: (await requests_counts.get(`success_${key}`)) || "0",
			};

			counters.targets[key] = targetStats;

			// Add to totals
			totalInitialRequests += parseInt(targetStats.initial_requests);
			totalBypassBadReferrer += parseInt(targetStats.bypass_bad_referrer);
			totalSuccess += parseInt(targetStats.success);
		}

		// Add totals to counters object
		counters.initial_requests = totalInitialRequests.toString();
		counters.bypass_bad_referrer = totalBypassBadReferrer.toString();
		counters.success = totalSuccess.toString();

		if (url.searchParams.get("json") === "1") {
			return new Response(JSON.stringify(counters), {
				headers: { "Content-Type": "application/json" },
			});
		}

		const totalBypass = parseInt(counters.bypass_bad_referrer);

		const html = `
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
              <div class="stat-value">${totalBypass}</div>
              <div class="stat-percentage">${(
								(totalBypass / parseInt(counters.initial_requests)) * 100 || 0
							).toFixed(1)}%</div>
            </div>
            <div class="stat-card">
              <h3>INCOMPLETE</h3>
              <div class="stat-value">${
								parseInt(counters.initial_requests) -
								parseInt(counters.success) -
								totalBypass
							}</div>
              <div class="stat-percentage">${(
								((parseInt(counters.initial_requests) -
									parseInt(counters.success) -
									totalBypass) /
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
							(totalBypass / parseInt(counters.initial_requests)) * 100 || 0
						}%"></div>
            <div class="progress-segment progress-remaining" style="width: ${
							((parseInt(counters.initial_requests) -
								parseInt(counters.success) -
								totalBypass) /
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
		return new Response(html, { headers: { "Content-Type": "text/html" } });
	} catch (error) {
		return new Response("Error fetching analytics data", { status: 500 });
	}
}
