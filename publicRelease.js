addEventListener("fetch", (event) => {
	event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
	const allowedReferrers = ["https://lootdest.org", "https://loot-link.com"];
	const referrer = request.headers.get("Referer") || "";
	const url = new URL(request.url);

	// Generator page when no query parameters exist
	if (!url.search) {
		const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Lootlabs Gaurd</title>
        <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body {
            background-color: #121212;
            color: #e0e0e0;
            font-family: 'Lexend', sans-serif;
            margin: 0;
            padding: 0;
            animation: fadeIn 1.5s;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          h1 { text-align: center; margin-top: 2rem; }
          form {
            max-width: 500px;
            margin: 2rem auto;
            padding: 2rem;
            background: #1e1e1e;
            border-radius: 8px;
            // box-shadow: 0 0 10px rgba(168,85,247,0.5);
            animation: fadeIn 1.5s;
            text-align: center;
          }
          /* Updated input and button styling to fixed width */
          form input, form button {
            width: 300px;
            padding: 10px;
            margin: 10px auto;
            border-radius: 4px;
            border: none;
            outline: none;
            display: block;
            transition: background-color 0.3s, transform 0.3s;
          }
          form button {
            background-color: #a855f7;
            color: white;
            cursor: pointer;
          }
          form button:hover {
            background-color: #8e3de3;
            transform: scale(1.02);
          }
        </style>
      </head>
      <body>
        <h1>Lootlabs Gaurd</h1>
        <form id="generatorForm">
          <label for="destination">Destination URL:</label><br>
          <input type="text" id="destination" name="destination" required><br><br>
          <button type="button" id="copyButton" disabled>Copy URL</button>
        </form>
        <script>
          const form = document.getElementById('generatorForm');
          const copyButton = document.getElementById('copyButton');
          let generatedLink = '';
          form.addEventListener('input', function() {
            // Enable button if destination input has a value
            const destination = document.getElementById('destination').value;
            copyButton.disabled = !destination;
          });
          copyButton.addEventListener('click', function() {
            const destination = document.getElementById('destination').value;
            const payload = { destination };
            const encoded = btoa(JSON.stringify(payload));
            generatedLink = window.location.origin + window.location.pathname + '?data=' + encodeURIComponent(encoded);
            navigator.clipboard.writeText(generatedLink).then(() => {
              copyButton.innerText = "Copied!";
              setTimeout(() => { copyButton.innerText = "Copy URL"; }, 1000);
            });
          });
        </script>
      </body>
    </html>
    `;
		return new Response(html, { headers: { "Content-Type": "text/html" } });
	}

	// Handle URL when "data" parameter exists
	if (url.searchParams.get("data")) {
		let payload;
		try {
			const encodedData = url.searchParams.get("data");
			payload = JSON.parse(atob(encodedData));
		} catch (error) {
			return new Response("Invalid data parameter", { status: 400 });
		}

		// Allowed referrers: directly redirect to destination
		if (allowedReferrers.some((r) => referrer.startsWith(r))) {
			return Response.redirect(payload.destination, 302);
		} else {
			// Not allowed: show simple message without redirect
			const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Access Denied</title>
          <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap" rel="stylesheet">
          <style>
            body {
              background-color: #121212;
              color: #e0e0e0;
              font-family: 'Lexend', sans-serif;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              animation: fadeIn 1.5s;
            }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            h1 { text-align: center; }
          </style>
        </head>
        <body>
          <h1>Do not try to bypass.</h1>
        </body>
      </html>
      `;
			return new Response(html, { headers: { "Content-Type": "text/html" } });
		}
	}
	// Rest of the code remains unchanged
	try {
		const encodedURL = url.searchParams.get("url");
		if (!encodedURL) {
			throw new Error("Missing URL parameter");
		}

		const paddedURL = encodedURL.padEnd(
			encodedURL.length + ((4 - (encodedURL.length % 4)) % 4),
			"="
		);
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
			headers: { "Content-Type": "text/plain" },
		});
	}
}
