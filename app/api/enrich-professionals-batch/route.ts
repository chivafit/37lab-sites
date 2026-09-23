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

  const body=await req.json().catch(()=>({}));
  const offset=Math.max(0,Number(body.offset)||0);
  const limit=Math.min(20,Math.max(1,Number(body.limit)||10));
  const{data:rows,error}=await client.from('professional_leads').select('id,name,city,state,raw_data,professional_id').order('name').range(offset,offset+limit-1);
  if(error)throw error;
  const origin=new URL(req.url).origin;
  const results:any[]=[];

  for(const lead of rows||[]){
   try{
    const raw=lead.raw_data||{};
    const already=raw.enrichment||{};
    const hasUseful=already.address||already.registration||already.clinic;
    let e:any=already;
    if(!hasUseful){
     const r=await fetch(`${origin}/api/enrich-professional`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:lead.name,city:lead.city||'',state:lead.state||'MG'}),cache:'no-store'});
     e=await r.json();
     if(!r.ok||!e?.found){results.push({id:lead.id,name:lead.name,found:false});continue}
     const nextRaw={...raw,enrichment:{address:e.address||null,clinic:e.clinic||null,registration:e.registration||null,sources:e.sources||[],enrichedAt:new Date().toISOString()}};
     const{error:le}=await client.from('professional_leads').update({raw_data:nextRaw}).eq('id',lead.id);if(le)throw le;
    }

    if(lead.professional_id){
     const{data:p}=await client.from('professionals').select('address,clinic_name,registration_number,content').eq('id',lead.professional_id).single();
     if(p){const patch:any={};if(!p.address&&e.address)patch.address=e.address;if(!p.clinic_name&&e.clinic)patch.clinic_name=e.clinic;if(!p.registration_number&&e.registration){const m=String(e.registration).match(/^([A-Za-z-]+)\s*(.*)$/);patch.registration_label=m?.[1]||null;patch.registration_number=m?.[2]||e.registration}if(Object.keys(patch).length){patch.content={...(p.content||{}),enrichmentSources:e.sources||[],enrichedAt:e.enrichedAt||new Date().toISOString()};const{error:pe}=await client.from('professionals').update(patch).eq('id',lead.professional_id);if(pe)throw pe}}
    }
    results.push({id:lead.id,name:lead.name,found:true});
   }catch(e:any){results.push({id:lead.id,name:lead.name,error:e?.message||'Falha'})}
  }
  const{count}=await client.from('professional_leads').select('id',{count:'exact',head:true});
  const nextOffset=offset+(rows?.length||0);
  return NextResponse.json({total:count||0,offset,processed:rows?.length||0,nextOffset,done:nextOffset>=(count||0),found:results.filter(x=>x.found).length,results});
 }catch(e:any){return NextResponse.json({error:e?.message||'Falha no enriquecimento em lote'},{status:500})}
}
