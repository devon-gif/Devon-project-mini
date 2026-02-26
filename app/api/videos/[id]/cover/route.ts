import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const formData  = await req.formData();
    const coverFile = formData.get('cover') as File | null;

    if (!coverFile) {
      return NextResponse.json({ error: 'cover file required' }, { status: 400 });
    }

    const coverKey   = `${id}/cover.png`;
    const coverBytes = Buffer.from(await coverFile.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from('covers')
      .upload(coverKey, coverBytes, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { error: dbError } = await supabaseAdmin
      .from('videos')
      .update({ cover_path: coverKey })
      .eq('id', id);

    if (dbError) throw dbError;

    return NextResponse.json({ ok: true, cover_path: coverKey });
  } catch (err: any) {
    console.error('[cover] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
