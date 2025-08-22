import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { validateAndProcessUrl, createFetchHeaders } from './url-utils.ts'
import { processHtmlContent } from './html-processor.ts'

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
      targetUrl = validateAndProcessUrl(url)
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch the target website
    const response = await fetch(targetUrl.toString(), {
      headers: createFetchHeaders(targetUrl)
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

    // Process HTML content if needed
    if (contentType.includes('text/html')) {
      content = processHtmlContent(content, targetUrl)
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