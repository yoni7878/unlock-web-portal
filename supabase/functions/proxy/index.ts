import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// List of proxy servers to try as fallbacks
const proxyServers = [
  'https://api.allorigins.win/get?url=',
  'https://cors-anywhere.herokuapp.com/',
  'https://thingproxy.freeboard.io/fetch/'
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate URL
    let targetUrl: URL
    try {
      targetUrl = new URL(url.startsWith('http') ? url : `https://${url}`)
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Attempting to fetch: ${targetUrl.toString()}`)

    // Try multiple approaches to fetch the content
    let content = ''
    let contentType = 'text/html'
    let success = false

    // Method 1: Direct fetch with enhanced headers
    try {
      const response = await fetch(targetUrl.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        redirect: 'follow'
      })

      if (response.ok) {
        content = await response.text()
        contentType = response.headers.get('content-type') || 'text/html'
        success = true
        console.log('Direct fetch successful')
      } else {
        console.log(`Direct fetch failed: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.log(`Direct fetch error: ${error.message}`)
    }

    // Method 2: Try with AllOrigins proxy if direct fetch failed
    if (!success) {
      try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl.toString())}`
        const response = await fetch(proxyUrl)
        
        if (response.ok) {
          const data = await response.json()
          if (data.contents) {
            content = data.contents
            contentType = 'text/html'
            success = true
            console.log('AllOrigins proxy successful')
          }
        }
      } catch (error) {
        console.log(`AllOrigins proxy error: ${error.message}`)
      }
    }

    // Method 3: Try a simple HTML fallback for popular sites
    if (!success) {
      const hostname = targetUrl.hostname.toLowerCase()
      
      if (hostname.includes('tiktok')) {
        content = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>TikTok Proxy</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #000; color: #fff; }
              .container { max-width: 600px; margin: 0 auto; }
              .logo { font-size: 48px; margin-bottom: 20px; }
              .message { font-size: 18px; margin-bottom: 30px; }
              .link { background: #fe2c55; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">🎵</div>
              <h1>TikTok Access</h1>
              <p class="message">Click below to access TikTok through an alternative method:</p>
              <a href="https://www.tiktok.com" target="_blank" class="link">Open TikTok</a>
              <br><br>
              <p><small>Note: This is a proxy service. Content may load differently than the original site.</small></p>
            </div>
          </body>
          </html>
        `
        success = true
        console.log('Using TikTok fallback page')
      }
    }

    if (!success) {
      return new Response(
        JSON.stringify({ 
          error: `Unable to access ${targetUrl.hostname}. This site may be blocked or require special authentication.`,
          suggestions: [
            'Try accessing the site directly in a new browser tab',
            'Check if the site requires login or has geographic restrictions',
            'Some sites block proxy access for security reasons'
          ]
        }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Process HTML content to make it work in the proxy
    if (contentType.includes('text/html')) {
      const baseUrl = `${targetUrl.protocol}//${targetUrl.host}`
      
      content = content
        // Remove potential blocking scripts
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/onload=["'][^"']*["']/gi, '')
        .replace(/onerror=["'][^"']*["']/gi, '')
        // Fix relative URLs
        .replace(/href=["']\/([^"']*?)["']/g, `href="${baseUrl}/$1"`)
        .replace(/src=["']\/([^"']*?)["']/g, `src="${baseUrl}/$1"`)
        // Fix protocol-relative URLs
        .replace(/href=["']\/\/([^"']*?)["']/g, `href="https://$1"`)
        .replace(/src=["']\/\/([^"']*?)["']/g, `src="https://$1"`)
        // Add base tag and proxy notice
        .replace(/<head>/i, `<head><base href="${baseUrl}/"><style>body::before{content:"🔓 Proxy Mode - Loading ${targetUrl.hostname}";position:fixed;top:0;left:0;right:0;background:#333;color:#fff;padding:10px;text-align:center;z-index:9999;}</style>`)
    }

    return new Response(
      JSON.stringify({ 
        content, 
        contentType,
        url: targetUrl.toString(),
        proxied: true
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Proxy error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Proxy service temporarily unavailable',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})