// created by kbdevs
// created by kbdevs
// created by kbdevs

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const targetKey = url.searchParams.get("url");

  const customUrls = {
    example: { url: "where you want it to go", link: "lootlabs base url" },
    real: { url: "https://google.com", link: "https://loot-link.com/s?idajdoajo" }
  };

  if (!customUrls[targetKey]) {
    return Response.redirect("https://google.com", 302);
  }

  const baseUrl = customUrls[targetKey].url;
  const redirectBase = customUrls[targetKey].link;
  const randomToken = (Math.random() + 1).toString(36).substring(7);
  const modifiedUrl = `${baseUrl}?antibypass=${randomToken}`;

  // console.log("Modified Target URL:", modifiedUrl);

  const apiKey = "your lootlabs api key";
  const lootlabsApiUrl = `https://be.lootlabs.gg/api/lootlabs/url_encryptor?destination_url=${encodeURIComponent(modifiedUrl)}&api_token=${apiKey}`;

  try {
    const response = await fetch(lootlabsApiUrl);
    const result = await response.json();

    if (!response.ok || !result.message) {
      return new Response(`LootLabs API Error: ${result.message || "Unknown error"}`, { status: 500 });
    }

    const finalRedirectUrl = `${redirectBase}&data=${result.message}`;
    // console.log("Final Redirect URL:", finalRedirectUrl);

    return Response.redirect(finalRedirectUrl, 302);
  } catch (error) {
    return new Response(`An error occurred: ${error.message}`, { status: 500 });
  }
}

// created by kbdevs
// created by kbdevs
// created by kbdevs
