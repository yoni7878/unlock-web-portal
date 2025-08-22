import { generateProxyScript } from './scripts.ts'

export function processHtmlContent(content: string, targetUrl: URL): string {
  console.log(`Processing HTML content for ${targetUrl.hostname}`)
  
  const baseUrl = `${targetUrl.protocol}//${targetUrl.host}`
  
  // More aggressive iframe restriction removal
  const processedContent = content
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
    
    // Add the proxy script before closing body tag
    .replace(/<\/body>/i, `${generateProxyScript(targetUrl.hostname)}</body>`)
  
  console.log(`Processed HTML content: ${processedContent.length} chars after modification`)
  return processedContent
}