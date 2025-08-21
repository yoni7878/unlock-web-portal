import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    // Enhanced headers for better compatibility
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"'
    }

    // Special handling for specific sites
    if (targetUrl.hostname.includes('spotify.com')) {
      fetchHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      fetchHeaders['Sec-Ch-Ua'] = '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"'
    }

    // Fetch the target website
    const response = await fetch(targetUrl.toString(), {
      headers: fetchHeaders
    })

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch: ${response.status} ${response.statusText}` }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const contentType = response.headers.get('content-type') || 'text/html'
    let content = await response.text()

    // Check if site blocks iframe embedding
    const xFrameOptions = response.headers.get('x-frame-options')
    const csp = response.headers.get('content-security-policy')
    
    if (xFrameOptions || (csp && csp.includes('frame-ancestors'))) {
      console.log(`Site ${targetUrl.hostname} has iframe restrictions`)
    }

    // If it's HTML, modify it to work within our proxy
    if (contentType.includes('text/html')) {
      // Replace relative URLs with absolute URLs
      const baseUrl = `${targetUrl.protocol}//${targetUrl.host}`
      
      content = content
        // Remove security headers that block iframe embedding
        .replace(/<meta[^>]*http-equiv=["']X-Frame-Options["'][^>]*>/gi, '')
        .replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '')
        // Fix relative links
        .replace(/href=["']\/([^"']*?)["']/g, `href="${baseUrl}/$1"`)
        .replace(/src=["']\/([^"']*?)["']/g, `src="${baseUrl}/$1"`)
        // Fix protocol-relative URLs
        .replace(/href=["']\/\/([^"']*?)["']/g, `href="https://$1"`)
        .replace(/src=["']\/\/([^"']*?)["']/g, `src="https://$1"`)
        // Remove iframe detection scripts
        .replace(/if\s*\(\s*window\s*!=\s*window\.top\s*\)/gi, 'if(false)')
        .replace(/if\s*\(\s*self\s*!=\s*top\s*\)/gi, 'if(false)')
        .replace(/if\s*\(\s*parent\s*!=\s*self\s*\)/gi, 'if(false)')
        // Add base tag and meta tags for better compatibility
        .replace(/<head>/i, `<head>
          <base href="${baseUrl}/">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;">
          <style>
            body { 
              background: white !important; 
              color: black !important;
              min-height: 100vh !important;
            }
            * {
              box-sizing: border-box !important;
            }
            /* Hide potential iframe detection overlays */
            [style*="position: fixed"][style*="z-index"] {
              display: none !important;
            }
          </style>`)
        // Fix dark mode issues for video sites
        .replace(/<body([^>]*)>/i, '<body$1 style="background: white !important; color: black !important;">')
        // Remove any dark theme classes that might cause issues
        .replace(/class="[^"]*dark[^"]*"/gi, 'class=""')
        .replace(/data-theme="dark"/gi, 'data-theme="light"')
        // Add scripts to handle JavaScript-heavy sites
        .replace(/<\/body>/i, `
          <script>
            // Override iframe detection
            Object.defineProperty(window, 'top', {
              get: function() { return window; }
            });
            Object.defineProperty(window, 'parent', {
              get: function() { return window; }
            });
            
            // Intercept navigation
            document.addEventListener('click', function(e) {
              const link = e.target.closest('a');
              if (link && link.href && !link.href.startsWith('javascript:') && !link.href.startsWith('#')) {
                e.preventDefault();
                window.parent.postMessage({type: 'navigate', url: link.href}, '*');
              }
            });
            
            // Handle dynamic content loading
            const observer = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                  mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.tagName === 'A') {
                      node.addEventListener('click', function(e) {
                        if (this.href && !this.href.startsWith('javascript:') && !this.href.startsWith('#')) {
                          e.preventDefault();
                          window.parent.postMessage({type: 'navigate', url: this.href}, '*');
                        }
                      });
                    }
                  });
                }
              });
            });
            observer.observe(document.body, { childList: true, subtree: true });
          </script>
          </body>`)
    }

    return new Response(
      JSON.stringify({ 
        content, 
        contentType,
        url: targetUrl.toString() 
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
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})