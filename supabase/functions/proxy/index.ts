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
      console.log(`Site ${targetUrl.hostname} has iframe restrictions - X-Frame-Options: ${xFrameOptions}, CSP: ${csp?.substring(0, 100)}`)
    }
    
    console.log(`Content-Type: ${contentType}, Response size: ${content.length} chars`)

    // If it's HTML, modify it to work within our proxy
    if (contentType.includes('text/html')) {
      console.log(`Processing HTML content for ${targetUrl.hostname}`)
      
      // Replace relative URLs with absolute URLs
      const baseUrl = `${targetUrl.protocol}//${targetUrl.host}`
      
      // More aggressive iframe restriction removal
      content = content
        // Remove ALL security headers that could block iframe embedding
        .replace(/<meta[^>]*http-equiv\s*=\s*["']X-Frame-Options["'][^>]*>/gi, '')
        .replace(/<meta[^>]*http-equiv\s*=\s*["']Content-Security-Policy["'][^>]*>/gi, '')
        .replace(/<meta[^>]*name\s*=\s*["']referrer["'][^>]*>/gi, '')
        
        // Remove any existing X-Frame-Options or CSP from HTML
        .replace(/X-Frame-Options\s*:\s*[^;"\n\r]*/gi, '')
        .replace(/Content-Security-Policy\s*:\s*[^;"\n\r]*/gi, '')
        
        // Fix relative links and resources
        .replace(/href\s*=\s*["']\s*\/([^"']*?)["']/g, `href="${baseUrl}/$1"`)
        .replace(/src\s*=\s*["']\s*\/([^"']*?)["']/g, `src="${baseUrl}/$1"`)
        .replace(/action\s*=\s*["']\s*\/([^"']*?)["']/g, `action="${baseUrl}/$1"`)
        
        // Fix protocol-relative URLs
        .replace(/href\s*=\s*["']\s*\/\/([^"']*?)["']/g, `href="https://$1"`)
        .replace(/src\s*=\s*["']\s*\/\/([^"']*?)["']/g, `src="https://$1"`)
        
        // More comprehensive iframe detection removal
        .replace(/if\s*\(\s*(window\s*[!=]=?\s*window\.top|self\s*[!=]=?\s*top|parent\s*[!=]=?\s*self|window\s*[!=]=?\s*top|top\s*[!=]=?\s*self)\s*\)/gi, 'if(false)')
        .replace(/window\.top\s*[!=]=?\s*window/gi, 'false')
        .replace(/self\s*[!=]=?\s*top/gi, 'false')
        .replace(/parent\s*[!=]=?\s*self/gi, 'false')
        
        // Remove common redirect scripts
        .replace(/window\.location\s*=\s*["'][^"']*["']/gi, '// removed redirect')
        .replace(/document\.location\s*=\s*["'][^"']*["']/gi, '// removed redirect')
        .replace(/location\.href\s*=\s*["'][^"']*["']/gi, '// removed redirect')
        
        // Add comprehensive base tag and meta tags
        .replace(/<head[^>]*>/i, `<head>
          <base href="${baseUrl}/">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; frame-ancestors *;">
          <meta http-equiv="X-Frame-Options" content="ALLOWALL">
          <style>
            body { 
              background: white !important; 
              color: black !important;
              min-height: 100vh !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            * {
              box-sizing: border-box !important;
            }
            /* Hide iframe detection overlays and redirects */
            [style*="position: fixed"][style*="z-index"] {
              display: none !important;
            }
            .iframe-blocker, .frame-blocker, [class*="frame-deny"] {
              display: none !important;
            }
          </style>`)
        .replace(/<\/body>/i, `
          <script>
            console.log('Proxy iframe scripts loaded for ${targetUrl.hostname}');
            
            // Complete iframe detection override
            try {
              Object.defineProperty(window, 'top', {
                get: function() { return window; },
                configurable: false
              });
              Object.defineProperty(window, 'parent', {
                get: function() { return window; },
                configurable: false
              });
              Object.defineProperty(window, 'frameElement', {
                get: function() { return null; },
                configurable: false
              });
            } catch(e) {
              console.log('Error overriding window properties:', e);
            }
            
            // Prevent ALL navigation and redirect attempts
            const originalLocation = window.location;
            
            // Override location methods
            ['assign', 'replace', 'reload'].forEach(method => {
              const original = window.location[method];
              window.location[method] = function(url) {
                console.log('Blocked location.' + method + ':', url);
                if (url && url !== window.location.href) {
                  window.parent.postMessage({type: 'navigate', url: url}, '*');
                }
                return false;
              };
            });
            
            // Override href setter
            Object.defineProperty(window.location, 'href', {
              set: function(url) {
                console.log('Blocked location.href:', url);
                if (url && url !== window.location.href) {
                  window.parent.postMessage({type: 'navigate', url: url}, '*');
                }
              },
              get: function() {
                return originalLocation.href;
              }
            });
            
            // Override window.open
            window.open = function(url, target, features) {
              console.log('Blocked window.open:', url);
              if (url) {
                window.parent.postMessage({type: 'navigate', url: url}, '*');
              }
              return null;
            };
            
            // Prevent form redirects
            document.addEventListener('submit', function(e) {
              const form = e.target;
              if (form && form.action) {
                e.preventDefault();
                console.log('Blocked form submission to:', form.action);
                if (form.method && form.method.toLowerCase() === 'get') {
                  const formData = new FormData(form);
                  const params = new URLSearchParams(formData);
                  const url = form.action + (form.action.includes('?') ? '&' : '?') + params.toString();
                  window.parent.postMessage({type: 'navigate', url: url}, '*');
                }
                return false;
              }
            }, true);
            
            // Enhanced link interception
            function interceptClicks(e) {
              const link = e.target.closest('a, [onclick], button[type="submit"]');
              if (link) {
                if (link.tagName === 'A' && link.href && !link.href.startsWith('javascript:') && !link.href.startsWith('#')) {
                  e.preventDefault();
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                  console.log('Intercepted link click:', link.href);
                  window.parent.postMessage({type: 'navigate', url: link.href}, '*');
                  return false;
                }
                
                // Handle onclick events
                if (link.onclick) {
                  const originalOnClick = link.onclick;
                  link.onclick = function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    console.log('Blocked onclick event');
                    return false;
                  };
                }
              }
            }
            
            document.addEventListener('click', interceptClicks, true);
            document.addEventListener('mousedown', interceptClicks, true);
            
            // Watch for dynamically added content
            const observer = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                  mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                      // Handle links and buttons in new content
                      const links = node.querySelectorAll ? node.querySelectorAll('a, [onclick], button') : [];
                      links.forEach(function(link) {
                        link.addEventListener('click', interceptClicks, true);
                        link.addEventListener('mousedown', interceptClicks, true);
                      });
                    }
                  });
                }
              });
            });
            
            if (document.body) {
              observer.observe(document.body, { childList: true, subtree: true });
            }
            
            console.log('All proxy protections initialized for ${targetUrl.hostname}');
          </script>
          </body>`)
      
      console.log(`Processed HTML content: ${content.length} chars after modification`)
    } else {
      console.log(`Non-HTML content type: ${contentType}`)
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