import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
console.log('Function starting up...')
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
  }
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'), {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization'),
        },
      },
    })
    if (req.method === 'GET') {
      console.log('Handling GET request...')
      const { data, error } = await supabase
        .from('realtime_status')
        .select('app_name, updated_at')
        .eq('id', 1)
        .single()
      if (error) {
        console.error('Error fetching status:', error)
        throw error
      }
      return new Response(
        JSON.stringify({
          appName: data.app_name,
          timestamp: data.updated_at,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          status: 200,
        }
      )
    }
    if (req.method === 'POST') {
      console.log('Handling POST request...')
      const body = await req.json()
      const appName = body.appName
      if (!appName) {
        return new Response(
          JSON.stringify({
            error: 'appName is required',
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
            status: 400,
          }
        )
      }
      const { error } = await supabase
        .from('realtime_status')
        .update({
          app_name: appName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)
      if (error) {
        console.error('Error updating status:', error)
        throw error
      }
      return new Response(
        JSON.stringify({
          message: `Status updated to ${appName}`,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          status: 200,
        }
      )
    }
    return new Response('Method Not Allowed', {
      headers: {
        ...corsHeaders,
      },
      status: 405,
    })
  } catch (err) {
    console.error('Main handler error:', err)
    return new Response(String(err?.message ?? err), {
      headers: {
        ...corsHeaders,
      },
      status: 500,
    })
  }
})
