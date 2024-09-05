/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { createClient } from '@supabase/supabase-js'

export default {
  async fetch(request, env) {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY)
    const { data, error } = await supabase.from('countries').select('*')
    if (error) throw error
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },
}
