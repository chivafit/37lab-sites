import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';

export const maxDuration=60;

export async function POST(req:NextRequest){
 try{
  const auth=req.headers.get('authorization');
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!anon)return NextResponse.json({error:'Supabase não configurado'},{status:500});
  const client=createClient(url,anon,{global:{headers:auth?{Authorization:auth}:{}}});
  const{data:{user}}=await client.auth.getUser();
  if(!user)return NextResponse.json({error:'Não autorizado'},{status:401});
  const{data:rows,error}=await client.from('professionals').select('id,name,city,state,address,clinic_name,registration_label,registration_number,content').neq('status','archived').order('name');
  if(error)throw error;
  const origin=new URL(req.url).origin;
  const results:any[]=[];
  for(const p of rows||[]){
   if(p.address&&p.clinic_name&&p.registration_number){results.push({id:p.id,name:p.name,skipped:true});continue}
   try{
    const r=await fetch(`${origin}/api/enrich-professional`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:p.name,city:p.city||'',state:p.state||'MG'}),cache:'no-store'});
    const e=await r.json();
    if(!r.ok||!e?.found){results.push({id:p.id,name:p.name,found:false});continue}
    const patch:any={};
    if(!p.address&&e.address)patch.address=e.address;
    if(!p.clinic_name&&e.clinic)patch.clinic_name=e.clinic;
    if(!p.registration_number&&e.registration){const m=String(e.registration).match(/^([A-Za-z-]+)\s*(.*)$/);patch.registration_label=m?.[1]||null;patch.registration_number=m?.[2]||e.registration}
    if(Object.keys(patch).length){patch.content={...(p.content||{}),enrichmentSources:e.sources||[],enrichedAt:new Date().toISOString()};const{error:ue}=await client.from('professionals').update(patch).eq('id',p.id);if(ue)throw ue}
    results.push({id:p.id,name:p.name,found:true,fields:Object.keys(patch).filter(x=>x!=='content')});
   }catch(e:any){results.push({id:p.id,name:p.name,error:e?.message||'Falha'})}
  }
  return NextResponse.json({total:results.length,updated:results.filter(x=>x.fields?.length).length,found:results.filter(x=>x.found).length,results});
 }catch(e:any){return NextResponse.json({error:e?.message||'Falha no enriquecimento em lote'},{status:500})}
}
