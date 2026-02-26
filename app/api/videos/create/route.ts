import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const public_token = randomUUID();
    const share_token  = randomUUID();

    const { data, error } = await supabaseAdmin
      .from('videos')
      .insert({
        public_token,
        share_token,
        status: 'pending',
        ...(body.cta_text  ? { cta_text:  body.cta_text  } : {}),
        ...(body.cta_url   ? { cta_url:   body.cta_url   } : {}),
        ...(body.cta_label ? { cta_label: body.cta_label } : {}),
      })
      .select('id, public_token, share_token')
      .single();

    if (error) throw error;

    return NextResponse.json({
      id: data.id,
      public_token: data.public_token,
      share_token: data.share_token,
    });
  } catch (err: any) {
    console.error('[create] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
