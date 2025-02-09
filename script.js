// Configuration constants
const CUSTOM_URLS = {
    url_parameter: { destination_url: "where you want it to go", lootlabs_url: "the base url for the lootlabs content locker, look at the one below for an example" },
    keys: { destination_url: "https://example.com/keygen", lootlabs_url: "https://loot-link.com/s?ijdoajaojo" }
    // example request: https://yourworker.com/?url=keys
  };
  
  const API_KEY = "LOOTLABS API KEY, GET IT IN THE ADVANCED PART OF THE DASHBOARD";
  const BASE_URL = "WHERE THE WORKER IS HOSTED, THE URL I TOLD YOU TO NOTE DOWN";
  const DEFAULT_REDIRECT = "URL TO REDIRECT IF THERE IS AN ERROR";
  



  const ALLOWED_REFERRERS = ['https://lootdest.org', 'https://loot-link.com'];
  
  // Pre-encode URLs
  const ENCODED_URLS = {};
  for (const [key, value] of Object.entries(CUSTOM_URLS)) {
    const encodedUrl = encodeURIComponent(btoa(value.destination_url));
    ENCODED_URLS[key] = {
      url: `${BASE_URL}?mode=check&url=${encodedUrl}`,
      link: value.lootlabs_url
    };
  }
  
  // Error page template
  const createErrorPage = (redirectUrl) => `
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
      <p>Redirecting back in <span id="countdown">5</span> seconds...</p>
      <script>
        let countdown = 5;
        let redirectTriggered = false;
        const interval = setInterval(() => {
          countdown--;
          document.getElementById('countdown').textContent = countdown;
          if (countdown <= 2 && !redirectTriggered) {
            redirectTriggered = true;
            window.location.href = '${redirectUrl}';
          }
          if (countdown <= 0) clearInterval(interval);
        }, 1000);
      </script>
    </body>
  </html>
  `;
  
  addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });
  
  async function handleRequest(request) {
    try {
      const url = new URL(request.url);
      const mode = url.searchParams.get("mode");
  
      if (mode === "check") {
        return handleBypassCheck(request);
      } else {
        return handleRedirect(request);
      }
    } catch (error) {
      return new Response(`Error: ${error.message}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
  
  async function handleRedirect(request) {
    const url = new URL(request.url);
    const targetKey = url.searchParams.get("url");
  
    if (!targetKey || !ENCODED_URLS[targetKey]) {
      return Response.redirect(DEFAULT_REDIRECT, 302);
    }
  
    const { url: baseUrl, link: redirectBase } = ENCODED_URLS[targetKey];
    const randomToken = (Math.random() + 1).toString(36).substring(7);
    
    const params = new URLSearchParams(new URL(baseUrl).search);
    params.set("antibypass", randomToken);
    params.set("return", targetKey);
    
    const modifiedUrl = `${BASE_URL}?${params.toString()}`;
    console.log(modifiedUrl);
  
    const lootlabsParams = new URLSearchParams({
      destination_url: modifiedUrl,
      api_token: API_KEY
    });
  
    const response = await fetch(`https://be.lootlabs.gg/api/lootlabs/url_encryptor?${lootlabsParams}`);
    const result = await response.json();
  
    if (!response.ok || !result.message) {
      throw new Error(result.message || "API Error");
    }
  
    return Response.redirect(`${redirectBase}&data=${result.message}`, 302);
  }
  
  async function handleBypassCheck(request) {
    const url = new URL(request.url);
    const returnPath = url.searchParams.get("return") || 'home';
    const redirectUrl = `${BASE_URL}?url=${returnPath}`;
  
    if (!url.searchParams.get("antibypass")) {
      return Response.redirect(redirectUrl, 302);
    }
  
    if (url.searchParams.get("denied")) {
      return new Response(createErrorPage(redirectUrl), {
        headers: { 'Content-Type': 'text/html' }
      });
    }
  
    const referrer = request.headers.get('Referer') || '';
    if (!ALLOWED_REFERRERS.some(allowed => referrer.startsWith(allowed))) {
      const deniedUrl = `${BASE_URL}?mode=check&denied=true&return=${returnPath}`;
      return new Response(createErrorPage(deniedUrl), {
        headers: { 'Content-Type': 'text/html' }
      });
    }
  
    const encodedURL = url.searchParams.get("url");
    if (!encodedURL) {
      throw new Error("Missing URL parameter");
    }
  
    const paddedURL = encodedURL.padEnd(encodedURL.length + (4 - (encodedURL.length % 4)) % 4, '=');
    const decodedURL = atob(paddedURL);
  
    try {
      new URL(decodedURL);
    } catch {
      throw new Error("Invalid URL format after decoding");
    }
  
    return Response.redirect(decodedURL, 302);
  }
  