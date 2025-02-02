addEventListener("fetch", (event) => {
	event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
	const allowedReferrers = ["https://lootdest.org", "https://loot-link.com"];
	const referrer = request.headers.get("Referer") || "";
	const url = new URL(request.url);

	// If not from allowed referrer, redirect to base URL
	if (
		!allowedReferrers.some((url) => referrer.startsWith(url)) ||
		!url.searchParams.get("antibypass")
	) {
		const baseUrl = url.origin + url.pathname;
		const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta http-equiv="refresh" content="0;url=${baseUrl}">
          </head>
          <body>
            Do not try to bypass.
          </body>
        </html>
      `;
		return new Response(html, {
			headers: { "Content-Type": "text/html" },
		});
	}

	try {
		// Get and decode the base64 URL parameter
		const encodedURL = url.searchParams.get("url");
		if (!encodedURL) {
			throw new Error("Missing URL parameter");
		}

		// Decode base64 and handle padding if necessary
		const paddedURL = encodedURL.padEnd(
			encodedURL.length + ((4 - (encodedURL.length % 4)) % 4),
			"="
		);
		const decodedURL = atob(paddedURL);

		// Validate the decoded URL
		try {
			new URL(decodedURL); // This will throw if URL is invalid
		} catch (e) {
			throw new Error("Invalid URL format after decoding");
		}

		// Redirect to the decoded URL
		return Response.redirect(decodedURL, 302);
	} catch (error) {
		// Handle any errors during decoding or validation
		return new Response(`Error: ${error.message}`, {
			status: 400,
			headers: { "Content-Type": "text/plain" },
		});
	}
}
