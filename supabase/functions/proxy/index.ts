import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE'
};

serve(async (req) => {
  console.log(`${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');
    
    if (!targetUrl) {
      return new Response('Missing URL parameter', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    console.log(`Proxying request to: ${targetUrl}`);

    // Create headers for the proxied request
    const proxyHeaders = new Headers();
    
    // Copy relevant headers from the original request
    for (const [key, value] of req.headers.entries()) {
      if (!key.toLowerCase().startsWith('cf-') && 
          !key.toLowerCase().startsWith('x-') &&
          key.toLowerCase() !== 'host' &&
          key.toLowerCase() !== 'origin') {
        proxyHeaders.set(key, value);
      }
    }

    // Set proper headers for the target
    const targetUrlObj = new URL(targetUrl);
    proxyHeaders.set('Host', targetUrlObj.host);
    proxyHeaders.set('Origin', targetUrlObj.origin);
    proxyHeaders.set('Referer', targetUrl);
    proxyHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Remove any iframe restrictions
    proxyHeaders.delete('X-Frame-Options');
    proxyHeaders.delete('Frame-Options');

    const proxyRequest = new Request(targetUrl, {
      method: req.method,
      headers: proxyHeaders,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : null,
    });

    const response = await fetch(proxyRequest);
    
    console.log(`Response status: ${response.status} for ${targetUrl}`);

    // Create response headers
    const responseHeaders = new Headers(corsHeaders);
    
    // Copy response headers but modify some for iframe embedding
    for (const [key, value] of response.headers.entries()) {
      const lowerKey = key.toLowerCase();
      
      if (lowerKey === 'x-frame-options' || lowerKey === 'frame-options') {
        // Allow iframe embedding
        continue; // Skip these headers
      } else if (lowerKey === 'content-security-policy') {
        // Remove or modify CSP to allow iframe embedding
        responseHeaders.set(key, "default-src * 'unsafe-inline' 'unsafe-eval'; frame-ancestors *; child-src *;");
      } else if (lowerKey !== 'content-encoding' && lowerKey !== 'transfer-encoding') {
        responseHeaders.set(key, value);
      }
    }

    // Handle different content types
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('text/html')) {
      let html = await response.text();
      
      // Inject scripts and modify content to work in iframe
      const baseUrl = `${targetUrlObj.protocol}//${targetUrlObj.host}`;
      
      // More aggressive HTML modification
      html = html
        // Remove iframe busters
        .replace(/<script[^>]*>[\s\S]*?(if|while)[\s\S]*?(top|parent|frameElement)[\s\S]*?<\/script>/gi, '')
        .replace(/if\s*\(\s*(window\s*[!=]=?\s*top|top\s*[!=]=?\s*self|self\s*[!=]=?\s*top)/gi, 'if(false')
        .replace(/window\.top\s*[!=]=?\s*window/gi, 'false')
        .replace(/window\s*[!=]=?\s*window\.top/gi, 'false')
        
        // Fix relative URLs
        .replace(/href\s*=\s*["']\s*\/([^"'\/][^"']*?)["']/g, `href="${baseUrl}/$1"`)
        .replace(/src\s*=\s*["']\s*\/([^"'\/][^"']*?)["']/g, `src="${baseUrl}/$1"`)
        .replace(/action\s*=\s*["']\s*\/([^"'\/][^"']*?)["']/g, `action="${baseUrl}/$1"`)
        
        // Fix protocol-relative URLs
        .replace(/href\s*=\s*["']\s*\/\/([^"']*?)["']/g, `href="https://$1"`)
        .replace(/src\s*=\s*["']\s*\/\/([^"']*?)["']/g, `src="https://$1"`);
      
      // Inject our scripts
      html = html.replace(/<head[^>]*>/i, (match) => `${match}
        <base href="${baseUrl}/">
        <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; frame-ancestors *; child-src *;">
        <script>
          console.log('Proxy script loaded for ${targetUrlObj.hostname}');
          
          // Completely override iframe detection
          try {
            Object.defineProperty(window, 'top', {
              get: () => window,
              set: () => false,
              configurable: false
            });
            Object.defineProperty(window, 'parent', {
              get: () => window, 
              set: () => false,
              configurable: false
            });
            Object.defineProperty(window, 'frameElement', {
              get: () => null,
              set: () => false,
              configurable: false
            });
            
            window.self = window;
            window.top = window;
            window.parent = window;
          } catch(e) { console.log('Override error:', e); }
          
          // Intercept navigation attempts
          const originalOpen = window.open;
          window.open = function(url, target, features) {
            console.log('Blocked window.open:', url);
            if (url && window.parent !== window) {
              window.parent.postMessage({type: 'navigate', url: url}, '*');
            }
            return null;
          };
          
          // Override location methods
          const originalAssign = location.assign;
          const originalReplace = location.replace;
          
          location.assign = function(url) {
            console.log('Blocked location.assign:', url);
            if (window.parent !== window) {
              window.parent.postMessage({type: 'navigate', url: url}, '*');
            }
          };
          
          location.replace = function(url) {
            console.log('Blocked location.replace:', url);
            if (window.parent !== window) {
              window.parent.postMessage({type: 'navigate', url: url}, '*');
            }
          };
          
          // Intercept clicks
          document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (link && link.href && !link.href.startsWith('javascript:') && !link.href.startsWith('#')) {
              e.preventDefault();
              e.stopPropagation();
              console.log('Intercepted click:', link.href);
              if (window.parent !== window) {
                window.parent.postMessage({type: 'navigate', url: link.href}, '*');
              }
            }
          }, true);
          
          // Intercept form submissions
          document.addEventListener('submit', function(e) {
            const form = e.target;
            if (form && form.action) {
              e.preventDefault();
              console.log('Intercepted form:', form.action);
              if (window.parent !== window) {
                const url = form.method === 'GET' ? 
                  form.action + '?' + new URLSearchParams(new FormData(form)).toString() :
                  form.action;
                window.parent.postMessage({type: 'navigate', url: url}, '*');
              }
            }
          }, true);
          
          console.log('All proxy overrides applied');
        </script>`);
      
      return new Response(html, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
    }
    
    // For non-HTML content, pass through as-is
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(`Proxy error: ${error.message}`, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});