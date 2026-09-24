'use client';
import {useEffect,useState} from 'react';
import {supabase} from '../../../lib/supabase';
type Stats={total:number;pending:number;review:number;failed:number};
export default function EnrichmentBar(){
 const[s,setS]=useState<Stats>({total:0,pending:0,review:0,failed:0});const[busy,setBusy]=useState(false);const[message,setMessage]=useState('');
 async function authHeaders():Promise<Record<string,string>>{if(!supabase)return{};const{data}=await supabase.auth.getSession();return data.session?.access_token?{Authorization:`Bearer ${data.session.access_token}`}:{}}
 async function load(){try{const r=await fetch('/api/enrich-professionals-queue',{headers:await authHeaders(),cache:'no-store'});if(r.ok)setS(await r.json())}catch{}}
 useEffect(()=>{void load()},[]);
 async function run(){if(busy||!s.pending)return;setBusy(true);setMessage('Alimentando...');try{for(let i=0;i<80;i++){const r=await fetch('/api/enrich-professionals-queue',{method:'POST',headers:{'Content-Type':'application/json',...(await authHeaders())},body:'{}'});const text=await r.text();let x:any={};try{x=text?JSON.parse(text):{}}catch{x={error:`Resposta inválida (${r.status})`}}await load();if(!r.ok){setMessage(x.error||'Falha');break}if(x.done){setMessage('Busca concluída');break}await new Promise(ok=>setTimeout(ok,700))}}finally{setBusy(false);await load()}}
 const done=s.review+s.failed,pct=s.total?Math.round(done/s.total*100):0;
 return <section style={{maxWidth:1320,margin:'10px auto 0',padding:'0 28px',color:'#e8eeee'}}><div style={{border:'1px solid #202c31',borderRadius:10,padding:'9px 12px',background:'#0c1418',display:'flex',gap:14,alignItems:'center'}}><div style={{minWidth:155}}><b style={{fontSize:11}}>Busca automática <span style={{color:'#8da49d'}}>{pct}%</span></b><div style={{fontSize:9,color:'#829398',marginTop:2}}>{done}/{s.total} feitos · {s.pending} aguardando · {s.review} revisar{s.failed?` · ${s.failed} falhas`:''}</div></div><div style={{height:4,background:'#1b282d',borderRadius:99,overflow:'hidden',flex:1}}><div style={{height:'100%',width:`${pct}%`,background:'#8ebcaf'}}/></div>{message&&<span style={{fontSize:9,color:'#829398',whiteSpace:'nowrap'}}>{message}</span>}<button onClick={run} disabled={busy||!s.pending} style={{border:'1px solid #34464d',borderRadius:7,padding:'7px 11px',background:busy||!s.pending?'#172126':'#eef3f4',color:busy||!s.pending?'#819095':'#10181c',fontSize:10,fontWeight:800,whiteSpace:'nowrap'}}>{busy?'Alimentando...':s.pending?'Alimentar todos':'Concluído ✓'}</button></div></section>
}
