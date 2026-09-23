'use client';

import {ReactNode,useEffect,useState} from 'react';
import {useParams} from 'next/navigation';
import {supabase} from '../../../../lib/supabase';

type Enrichment={registration?:string;address?:string;clinic?:string;sources?:string[];found?:boolean};

function splitRegistration(value:string){
 const v=(value||'').trim();
 const m=v.match(/^([A-Za-z-]+(?:[-\s]?(?:MG|SP|RJ|ES))?)\s*(.*)$/i);
 return {label:m?.[1]?.trim()||'',number:m?.[2]?.replace(/^N[º°]?\s*/i,'').trim()||''};
}

export default function ClientEditorLayout({children}:{children:ReactNode}){
 const params=useParams<{id:string}>();
 const[ready,setReady]=useState(false);
 const[note,setNote]=useState('Buscando dados públicos do profissional...');

 useEffect(()=>{
  let active=true;
  async function enrich(){
   const client=supabase;
   if(!client||!params.id){if(active)setReady(true);return}
   try{
    const{data:p,error}=await client.from('professionals').select('id,name,city,state,address,clinic_name,registration_label,registration_number,content').eq('id',params.id).single();
    if(error||!p){if(active)setReady(true);return}
    const missing=!p.address||!p.clinic_name||!p.registration_number;
    if(!missing){if(active)setReady(true);return}
    const res=await fetch('/api/enrich-professional',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:p.name,city:p.city,state:p.state})});
    if(!res.ok){if(active)setReady(true);return}
    const found:Enrichment=await res.json();
    const patch:any={};
    if(!p.address&&found.address)patch.address=found.address;
    if(!p.clinic_name&&found.clinic)patch.clinic_name=found.clinic;
    if((!p.registration_label||!p.registration_number)&&found.registration){
     const reg=splitRegistration(found.registration);
     if(!p.registration_label&&reg.label)patch.registration_label=reg.label;
     if(!p.registration_number&&reg.number)patch.registration_number=reg.number;
    }
    if(Object.keys(patch).length){
     const content={...(p.content||{}),publicEnrichment:{checkedAt:new Date().toISOString(),sources:found.sources||[],fields:Object.keys(patch)}};
     patch.content=content;
     await client.from('professionals').update(patch).eq('id',params.id);
     if(active)setNote(`${Object.keys(patch).filter(k=>k!=='content').length} dados encontrados. Abrindo editor...`);
    }
   }catch{/* enrichment must never block manual editing */}
   finally{if(active)setReady(true)}
  }
  enrich();
  return()=>{active=false};
 },[params.id]);

 if(!ready)return <main style={{minHeight:'100vh',background:'#080c0f',color:'#edf1f1',display:'grid',placeItems:'center',fontFamily:'Inter,Arial,sans-serif'}}><div style={{textAlign:'center'}}><b style={{fontFamily:'Georgia,serif',fontSize:30}}>37LAB</b><p style={{color:'#829096',fontSize:12,marginTop:14}}>{note}</p></div></main>;
 return <>{children}</>;
}
