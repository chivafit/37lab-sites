'use client';
import {useEffect,useState} from 'react';
import {useParams,useRouter} from 'next/navigation';
import {supabase} from '../../../../lib/supabase';
import {generateDemoForLead} from '../../../../lib/demo-generator';

type Fact={id:string;field_name:string;field_value:string|null;source_url:string;source_title:string|null;confidence:number|null;verified:boolean};

export default function Lead(){
 const {id}=useParams<{id:string}>(); const router=useRouter();
 const [lead,setLead]=useState<any>(); const [facts,setFacts]=useState<Fact[]>([]); const [msg,setMsg]=useState(''); const [creating,setCreating]=useState(false);
 useEffect(()=>{load()},[id]);
 async function load(){if(!supabase)return;const[{data:l},{data:f}]=await Promise.all([supabase.from('professional_leads').select('*').eq('id',id).single(),supabase.from('enrichment_facts').select('*').eq('lead_id',id).order('field_name')]);setLead(l);setFacts(f||[])}
 async function verify(f:Fact){if(!supabase)return;await supabase.from('enrichment_facts').update({verified:!f.verified}).eq('id',f.id);load()}
 async function createDemo(){setCreating(true);setMsg('Gerando demo...');const result=await generateDemoForLead(id);setCreating(false);if(result.professionalId){setMsg(result.created?'Demo criada ✓':'Demo já existente');router.push(`/admin/clientes/${result.professionalId}`)}else setMsg(result.error||'Não foi possível gerar a demo')}
 if(!lead)return <main className="adminGenerator"><section className="adminIntro"><p>Carregando...</p></section></main>;
 return <main className="adminGenerator"><header className="adminTop"><div><b>37LAB</b><span>Sites</span></div><small>REVISÃO DE ENRIQUECIMENTO</small></header><section className="adminIntro"><div><span className="adminKicker">REVISAR FONTES</span><h1>{lead.name}<br/><em>{lead.specialty||'dados profissionais'}</em></h1><p>Somente dados verificados entram automaticamente na demo.</p></div><div className="adminStatus"><b>{lead.suggested_template}</b><span>{msg}</span></div></section><section style={{padding:'0 5vw 80px'}}><div style={{display:'grid',gap:10}}>{facts.map(f=><article key={f.id} style={{background:'#fff',padding:18,border:'1px solid #ddd'}}><small>{f.field_name} • confiança {f.confidence??'—'}</small><h3>{f.field_value||'—'}</h3><p>{f.source_title}</p><a href={f.source_url} target="_blank" rel="noreferrer">Abrir fonte ↗</a> <button onClick={()=>verify(f)}>{f.verified?'✓ Verificado':'Marcar verificado'}</button></article>)}</div><button disabled={creating||!!lead.professional_id} onClick={createDemo} style={{padding:18,marginTop:24}}>{lead.professional_id?'Demo já criada':creating?'Gerando...':'Gerar demo com dados verificados'}</button></section></main>;
}
