'use client';
import {useEffect,useState} from 'react';
import {supabase} from '../../../lib/supabase';

type Stats={total:number;pending:number;review:number;failed:number};

export default function EnrichmentBar(){
  const [s,setS]=useState<Stats>({total:0,pending:0,review:0,failed:0});
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');

  async function authHeaders():Promise<Record<string,string>>{
    if(!supabase)return {};
    const {data}=await supabase.auth.getSession();
    return data.session?.access_token?{Authorization:`Bearer ${data.session.access_token}`}:{ };
  }
  async function load(){
    try{
      const r=await fetch('/api/enrich-professionals-queue',{headers:await authHeaders(),cache:'no-store'});
      if(r.ok)setS(await r.json());
    }catch{}
  }
  useEffect(()=>{void load()},[]);
  async function run(){
    if(busy||!s.pending)return;
    setBusy(true);setMessage('Alimentando profissionais...');
    try{
      for(let i=0;i<80;i++){
        const r=await fetch('/api/enrich-professionals-queue',{method:'POST',headers:{'Content-Type':'application/json',...(await authHeaders())},body:'{}'});
        const text=await r.text();
        let x:any={};try{x=text?JSON.parse(text):{}}catch{x={error:`Resposta inválida (${r.status})`}}
        await load();
        if(!r.ok){setMessage(x.error||'Falha no processamento');break}
        if(x.done){setMessage('Todos os profissionais passaram pela busca automática.');break}
        await new Promise(resolve=>setTimeout(resolve,700));
      }
    }finally{setBusy(false);await load()}
  }
  const done=s.review+s.failed;
  const pct=s.total?Math.round(done/s.total*100):0;
  return <section style={{maxWidth:1272,margin:'22px auto 0',padding:'0 28px',color:'#e8eeee'}}>
    <div style={{border:'1px solid #263238',borderRadius:16,padding:'16px 18px',background:'#0c1418',display:'flex',justifyContent:'space-between',gap:18,alignItems:'center',flexWrap:'wrap'}}>
      <div style={{flex:'1 1 420px'}}>
        <div style={{fontWeight:800,fontSize:14}}>Alimentação automática <span style={{color:'#8da49d'}}>· {pct}%</span></div>
        <div style={{fontSize:13,color:'#9ba9ad',marginTop:5}}>{done}/{s.total} pesquisados · {s.pending} aguardando · {s.review} para revisar{s.failed?` · ${s.failed} com falha`:''}</div>
        <div style={{height:5,background:'#1b282d',borderRadius:99,marginTop:10,overflow:'hidden'}}><div style={{height:'100%',width:`${pct}%`,background:'#8ebcaf',borderRadius:99}}/></div>
        {message&&<div style={{fontSize:12,color:'#829398',marginTop:7}}>{message}</div>}
      </div>
      <button type="button" onClick={run} disabled={busy||!s.pending} style={{border:'1px solid #34464d',borderRadius:10,padding:'12px 18px',background:busy||!s.pending?'#172126':'#eef3f4',color:busy||!s.pending?'#819095':'#10181c',fontWeight:800,cursor:busy||!s.pending?'default':'pointer'}}>{busy?'Alimentando...':s.pending?'Alimentar todos':'Todos pesquisados ✓'}</button>
    </div>
  </section>;
}
