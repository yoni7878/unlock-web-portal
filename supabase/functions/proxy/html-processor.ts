import { generateProxyScript } from './scripts.ts'

export function processHtmlContent(content: string, targetUrl: URL): string {
  console.log(`Processing HTML content for ${targetUrl.hostname}`)
  
  const baseUrl = `${targetUrl.protocol}//${targetUrl.host}`
  
  // Special handling for problematic sites
  const isYouTube = targetUrl.hostname.includes('youtube.com')
  const isSpotify = targetUrl.hostname.includes('spotify.com')
  const isTikTok = targetUrl.hostname.includes('tiktok.com')
  
  console.log(`Site type: YouTube=${isYouTube}, Spotify=${isSpotify}, TikTok=${isTikTok}`)
  
  // Ultra-aggressive iframe restriction removal
  let processedContent = content
    // Remove ALL security headers and meta tags
    .replace(/<meta[^>]*http-equiv[^>]*>/gi, '')
    .replace(/<meta[^>]*name\s*=\s*["']referrer["'][^>]*>/gi, '')
    .replace(/<meta[^>]*name\s*=\s*["']viewport["'][^>]*>/gi, '')
    
    // Remove CSP and frame-ancestors completely
    .replace(/Content-Security-Policy[^;"\n\r]*/gi, '')
    .replace(/X-Frame-Options[^;"\n\r]*/gi, '')
    .replace(/frame-ancestors[^;"\n\r]*/gi, '')
    
    // Remove any script that might detect iframes
    .replace(/<script[^>]*>[\s\S]*?if[\s\S]*?(top|parent|frameElement)[\s\S]*?<\/script>/gi, '')
    .replace(/window\.top[^;]*;/gi, '// removed iframe check')
    .replace(/self\s*[!=]=?\s*top/gi, 'false')
    .replace(/parent\s*[!=]=?\s*window/gi, 'false')
    .replace(/window\s*[!=]=?\s*window\.top/gi, 'false')
    
    // Remove redirects and navigation blockers
    .replace(/location\.href\s*=\s*["'][^"']*["']/gi, '// blocked redirect')
    .replace(/window\.location\s*=\s*["'][^"']*["']/gi, '// blocked redirect')
    .replace(/document\.location\s*=\s*["'][^"']*["']/gi, '// blocked redirect')
    
    // Site-specific fixes
    if (isYouTube) {
      processedContent = processedContent
        .replace(/ytInitialData/g, 'ytInitialDataProxy')
        .replace(/ytInitialPlayerResponse/g, 'ytInitialPlayerResponseProxy')
        .replace(/yt\.config_/g, 'ytProxy.config_')
    }
    
    if (isSpotify) {
      processedContent = processedContent
        .replace(/Spotify\.AppLoader/g, 'SpotifyProxy.AppLoader')
        .replace(/window\.location\.reload/g, '// blocked reload')
    }
    
    if (isTikTok) {
      processedContent = processedContent
        .replace(/window\.SIGI_STATE/g, 'window.SIGI_STATE_PROXY')
        .replace(/TikTok\.initialize/g, 'TikTokProxy.initialize')
    }
    
    // Fix relative links and resources
    processedContent = processedContent
      .replace(/href\s*=\s*["']\s*\/([^"']*?)["']/g, `href="${baseUrl}/$1"`)
    .replace(/src\s*=\s*["']\s*\/([^"']*?)["']/g, `src="${baseUrl}/$1"`)
    .replace(/action\s*=\s*["']\s*\/([^"']*?)["']/g, `action="${baseUrl}/$1"`)
    
    // Fix protocol-relative URLs
    .replace(/href\s*=\s*["']\s*\/\/([^"']*?)["']/g, `href="https://$1"`)
    .replace(/src\s*=\s*["']\s*\/\/([^"']*?)["']/g, `src="https://$1"`)
    
    // Add ultra-permissive headers and base
    .replace(/<head[^>]*>/i, `<head>
      <base href="${baseUrl}/">
      <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes">
      <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob: filesystem:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; frame-ancestors *; child-src *;">
      <meta http-equiv="X-Frame-Options" content="ALLOWALL">
      <meta http-equiv="Permissions-Policy" content="*">
      <style>
        body { 
          background: white !important; 
          color: black !important;
          min-height: 100vh !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: visible !important;
        }
        html, * {
          box-sizing: border-box !important;
          position: relative !important;
        }
        /* Ultra-aggressive iframe blocker removal */
        .iframe-blocker, .frame-blocker, [class*="frame-deny"], [class*="iframe-deny"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
        [style*="position: fixed"][style*="z-index"], .overlay-blocker {
          display: none !important;
        }
      </style>`)
    
    // Add the proxy script before closing body tag
    .replace(/<\/body>/i, `${generateProxyScript(targetUrl.hostname)}</body>`)
  
  console.log(`Processed HTML content: ${processedContent.length} chars after modification`)
  return processedContent
}