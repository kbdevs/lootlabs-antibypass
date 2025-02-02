addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

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
  
  // Extract 'url' parameter from the query string
  var targetUrl = url.searchParams.get('url')
  const temp = targetUrl
  if (custom_urls[temp]) {
    targetUrl = custom_urls[temp]["url"] + "?antibypass=" + ((Math.random() + 1).toString(36).substring(7))

    console.log(targetUrl)
      // API key for LootLabs API
    const apiKey = "your lootlabs api key, get it here https://creators.lootlabs.gg/advanced"

    // Construct the LootLabs API URL
    const lootlabsApiUrl = `https://be.lootlabs.gg/api/lootlabs/url_encryptor?destination_url=${encodeURIComponent(targetUrl)}&api_token=${apiKey}`

    try {
      // Fetch response from the API
      const response = await fetch(lootlabsApiUrl)
      const result = await response.json()

      if (!response.ok || !result.message) {
        return new Response(`Error from LootLabs API: ${result.message || "Unknown error"}`, { status: 500 })
      }

      var redirectUrl = (custom_urls[temp]["link"] + "&data=" + result.message)
      console.log(redirectUrl)
  
      return Response.redirect(redirectUrl, 302)
    } catch (error) {
      return new Response(`An error occurred: ${error.message}`, { status: 500 })
    }
  } else {
    return Response.redirect("https://google.com", 302)
  }
}
