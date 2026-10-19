import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
export const maxDuration=60;
// Print da prévia para mandar como imagem no WhatsApp: celular (1ª mensagem) ou computador (2ª).
// Captura via Microlink: sem chave tem ~50 prints/dia grátis; com MICROLINK_API_KEY usa o plano pago.
const VIEWPORT={mobile:{width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true},desktop:{width:1440,height:900,deviceScaleFactor:1,isMobile:false,hasTouch:false}};
const sb=(auth:string|null)=>{const url=process.env.NEXT_PUBLIC_SUPABASE_URL!,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;return createClient(url,key,{global:{headers:auth?{Authorization:auth}:{}}})};
export async function GET(req:NextRequest){try{
 const{data:{user}}=await sb(req.headers.get('authorization')).auth.getUser();if(!user)return NextResponse.json({error:'Não autorizado'},{status:401});
 const q=new URL(req.url).searchParams,slug=q.get('slug')||'',view=q.get('view')==='desktop'?'desktop':'mobile';
 // Só slugs do próprio site: a rota não pode virar um capturador de qualquer URL.
 if(!/^[a-z0-9-]{1,120}$/.test(slug))return NextResponse.json({error:'Slug inválido'},{status:400});
 const key=process.env.MICROLINK_API_KEY,params=new URLSearchParams({url:`https://sites.37lab.com.br/${slug}`,screenshot:'true',meta:'false',embed:'screenshot.url',waitForTimeout:'1500'});
 for(const[k,v]of Object.entries(VIEWPORT[view]))params.set(`viewport.${k}`,String(v));
 const r=await fetch(`https://${key?'pro':'api'}.microlink.io/?${params}`,{headers:key?{'x-api-key':key}:{},cache:'no-store'});
 const type=r.headers.get('content-type')||'';
 if(!r.ok||!type.startsWith('image/'))return NextResponse.json({error:r.status===429?'Limite diário de prints atingido. Tire o print manualmente ou tente amanhã.':'Não foi possível gerar o print da prévia.'},{status:502});
 return new NextResponse(await r.arrayBuffer(),{headers:{'Content-Type':type,'Cache-Control':'private, max-age=3600'}});
}catch(e:any){return NextResponse.json({error:e?.message||'Falha ao gerar o print'},{status:500})}}
