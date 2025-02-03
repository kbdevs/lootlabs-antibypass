addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const allowedReferrers = ['https://lootdest.org', 'https://loot-link.com'];
  const referrer = request.headers.get('Referer') || '';
  const url = new URL(request.url);
  
  // If not from allowed referrer, redirect to base URL
  if (url.searchParams.get("denied")) {
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Access Denied</title>
        <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap" rel="stylesheet">
        <style>
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
          }
          body {
            background-color: #121212;
            color: #e0e0e0;
            font-family: 'Lexend', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
            padding: 2rem;
            box-sizing: border-box;
          }
          a, strong {
            color: #a855f7;
          }
        </style>
      </head>
      <body>
        <p>Do not try to bypass.</p>
      </body>
    </html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
  }
  if (!allowedReferrers.some(url => referrer.startsWith(url)) || !url.searchParams.get("antibypass")) {
    const baseUrl = url.origin + url.pathname + "?denied=true";
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Access Denied</title>
        <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap" rel="stylesheet">
        <style>
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
          }
          body {
            background-color: #121212;
            color: #e0e0e0;
            font-family: 'Lexend', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
            padding: 2rem;
            box-sizing: border-box;
          }
          a, strong {
            color: #a855f7;
          }
        </style>
        <meta http-equiv="refresh" content="0;url=${baseUrl}">
      </head>
      <body>
        <p>Do not try to bypass.</p>
      </body>
    </html>
  `;
  
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  // Rest of the code remains unchanged
  try {
    const encodedURL = url.searchParams.get("url");
    if (!encodedURL) {
      throw new Error("Missing URL parameter");
    }
    
    const paddedURL = encodedURL.padEnd(encodedURL.length + (4 - (encodedURL.length % 4)) % 4, '=');
    const decodedURL = atob(paddedURL);
    
    try {
      new URL(decodedURL);
    } catch (e) {
      throw new Error("Invalid URL format after decoding");
    }
    
    return Response.redirect(decodedURL, 302);
    
  } catch (error) {
    return new Response(`Error: ${error.message}`, {
      status: 400,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
