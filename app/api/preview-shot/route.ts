import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {getProfessionalRecord} from '../../../lib/professionals-db';
import {previewCard,type ShotView} from '../../../lib/preview-card';
export const maxDuration=60;
// Imagem da prévia para mandar no WhatsApp: celular (1ª mensagem) ou computador (2ª), montada com foto e nome.
// Captura via Microlink: sem chave tem ~50 prints/dia grátis; com MICROLINK_API_KEY usa o plano pago.
const VIEWPORT={mobile:{width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true},desktop:{width:1440,height:900,deviceScaleFactor:1,isMobile:false,hasTouch:false}};
// No print some a faixa "DEMONSTRAÇÃO PRIVADA" (nome interno do modelo, parece rascunho) e nada fica escondido esperando rolagem.
const PRINT_CSS='.cDemo,.clDemo,.dDemo,.d2Demo,.m2Demo,.pDemo,.demoBar{display:none!important}.reveal{opacity:1!important;transform:none!important}';
const sb=(auth:string|null)=>{const url=process.env.NEXT_PUBLIC_SUPABASE_URL!,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;return createClient(url,key,{global:{headers:auth?{Authorization:auth}:{}}})};
const dataUrl=async(r:Response)=>`data:${r.headers.get('content-type')||'image/png'};base64,${Buffer.from(await r.arrayBuffer()).toString('base64')}`;
async function screenshot(slug:string,view:ShotView){
 const key=process.env.MICROLINK_API_KEY,params=new URLSearchParams({url:`https://sites.37lab.com.br/${slug}`,screenshot:'true',meta:'false',embed:'screenshot.url',waitForTimeout:'1500',styles:PRINT_CSS});
 for(const[k,v]of Object.entries(VIEWPORT[view]))params.set(`viewport.${k}`,String(v));
 return fetch(`https://${key?'pro':'api'}.microlink.io/?${params}`,{headers:key?{'x-api-key':key}:{},cache:'no-store'});
}
async function photoOf(url?:string){if(!url)return undefined;try{const r=await fetch(url,{cache:'no-store'});return r.ok&&r.headers.get('content-type')?.startsWith('image/')?await dataUrl(r):undefined}catch{return undefined}}
export async function GET(req:NextRequest){try{
 const{data:{user}}=await sb(req.headers.get('authorization')).auth.getUser();if(!user)return NextResponse.json({error:'Não autorizado'},{status:401});
 const q=new URL(req.url).searchParams,slug=q.get('slug')||'',view:ShotView=q.get('view')==='desktop'?'desktop':'mobile',name=(q.get('name')||'').trim().slice(0,40);
 // Só slugs do próprio site: a rota não pode virar um capturador de qualquer URL.
 if(!/^[a-z0-9-]{1,120}$/.test(slug))return NextResponse.json({error:'Slug inválido'},{status:400});
 const[r,p]=await Promise.all([screenshot(slug,view),getProfessionalRecord(slug)]);
 const type=r.headers.get('content-type')||'';
 if(!r.ok||!type.startsWith('image/'))return NextResponse.json({error:r.status===429?'Limite diário de prints atingido. Tire o print manualmente ou tente amanhã.':'Não foi possível gerar o print da prévia.'},{status:502});
 if(!p)return new NextResponse(await r.arrayBuffer(),{headers:{'Content-Type':type,'Cache-Control':'private, max-age=3600'}});
 const label=view==='mobile'?(name?`${name}, este pode ser o seu site.`:'Este pode ser o site de vocês.'):(name?`${name}, no computador ele fica assim.`:'No computador, o site fica assim.');
 const card=previewCard({view,p,label,shot:await dataUrl(r),photo:await photoOf(p.professionalImage)});
 return new NextResponse(await card.arrayBuffer(),{headers:{'Content-Type':'image/png','Cache-Control':'private, max-age=3600'}});
}catch(e:any){return NextResponse.json({error:e?.message||'Falha ao gerar o print'},{status:500})}}
