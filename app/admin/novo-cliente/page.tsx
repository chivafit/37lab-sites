'use client';

import { useMemo, useState } from 'react';

type FormState={name:string;shortName:string;profession:string;specialty:string;registration:string;clinic:string;address:string;phone:string;whatsapp:string;instagram:string;city:string;state:string;primary:string;secondary:string};
const initial:FormState={name:'',shortName:'',profession:'Médico',specialty:'',registration:'',clinic:'',address:'',phone:'',whatsapp:'',instagram:'',city:'Piumhi',state:'MG',primary:'#155846',secondary:'#6f9187'};
const slugify=(v:string)=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/^(dr|dra)\.?\s+/,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const cleanPhone=(v:string)=>v.replace(/\D/g,'');

export default function NovoCliente(){
 const [form,setForm]=useState(initial); const [copied,setCopied]=useState(false);
 const set=(key:keyof FormState,value:string)=>setForm(s=>({...s,[key]:value}));
 const slug=useMemo(()=>slugify(form.shortName||form.name||'novo-cliente'),[form.shortName,form.name]);
 const generated=useMemo(()=>{
  const specialty=form.specialty||'Especialidade médica'; const city=form.city||'Piumhi';
  const first=form.shortName||form.name||'Profissional';
  const whatsapp=cleanPhone(form.whatsapp);
  return `{
  slug:'${slug}',
  name:${JSON.stringify(form.name)},
  shortName:${JSON.stringify(form.shortName||form.name)},
  profession:${JSON.stringify(form.profession)},
  specialty:${JSON.stringify(form.specialty)},
  ${form.registration?`registration:${JSON.stringify(form.registration)},\n  `:''}${form.clinic?`clinic:${JSON.stringify(form.clinic)},\n  `:''}${form.address?`address:${JSON.stringify(form.address)},\n  `:''}${form.phone?`phone:${JSON.stringify(form.phone)},\n  `:''}${whatsapp?`whatsapp:${JSON.stringify(whatsapp)},\n  `:''}${form.instagram?`instagram:${JSON.stringify(form.instagram)},\n  `:''}city:${JSON.stringify(form.city)}, state:${JSON.stringify(form.state)},
  eyebrow:'SAÚDE • CUIDADO • CONFIANÇA',
  heroTitle:'Cuidado próximo.',
  heroEmphasis:'Saúde por inteiro.',
  bio:${JSON.stringify(`Atendimento em ${specialty} com cuidado individualizado, atenção à prevenção e acompanhamento em ${city}.`)},
  aboutTitle:${JSON.stringify(`${specialty} com atenção, ciência e humanidade.`)},
  aboutText:'Uma abordagem centrada nas necessidades de cada paciente, com escuta, orientação e acompanhamento individualizado.',
  quote:'Cuidar da saúde também é acompanhar, orientar e prevenir.',
  careLabel:'cuidado centrado em cada paciente',
  services:[
    {title:'Consulta',description:'Avaliação individualizada e orientação profissional.',icon:'plus'},
    {title:'Prevenção',description:'Cuidado preventivo e promoção da saúde.',icon:'shield'},
    {title:'Acompanhamento',description:'Continuidade do cuidado conforme cada necessidade.',icon:'heart'},
    {title:'Orientação',description:'Informação clara para decisões de saúde mais conscientes.',icon:'user'}
  ],
  faqs:[
    {question:'Como faço para agendar?',answer:'Entre em contato com a equipe para consultar disponibilidade.'},
    {question:'Onde acontece o atendimento?',answer:${JSON.stringify(form.clinic&&form.address?`O atendimento acontece em ${form.clinic} — ${form.address}.`:'Confirme o local de atendimento diretamente com a equipe.')}},
    {question:'Atende por convênio?',answer:'Consulte diretamente a equipe para confirmar convênios e modalidades de atendimento.'},
    {question:'Como funciona a primeira consulta?',answer:'As orientações específicas são fornecidas no momento do agendamento.'}
  ],
  theme:{primary:${JSON.stringify(form.primary)},secondary:${JSON.stringify(form.secondary)},background:'#f7f9f5',surface:'#ffffff'},
  seo:{title:${JSON.stringify(`${first} | ${specialty} em ${city}`)},description:${JSON.stringify(`Atendimento em ${specialty} em ${city}, ${form.state||'MG'}, com cuidado individualizado e acompanhamento profissional.`)}},
  template:'medical-01',status:'demo'
}`;
 },[form,slug]);
 async function copy(){await navigator.clipboard.writeText(generated);setCopied(true);setTimeout(()=>setCopied(false),1600)}
 return <main className="adminGenerator">
  <header className="adminTop"><div><b>37LAB</b><span>Sites</span></div><small>GERADOR INTERNO • MEDICAL 01</small></header>
  <section className="adminIntro"><div><span className="adminKicker">NOVO CLIENTE</span><h1>Da ficha à demo<br/><em>em minutos.</em></h1><p>Preencha os dados confirmados do profissional. O gerador monta a configuração inicial do Medical 01 para revisão antes da publicação.</p></div><div className="adminStatus"><span>Template</span><b>Medical 01</b><span>URL prevista</span><b>/demo/{slug}</b></div></section>
  <section className="adminWorkspace">
   <form className="adminForm" onSubmit={e=>e.preventDefault()}>
    <h2>Dados do profissional</h2><div className="adminGrid">
     <label>Nome completo<input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Dr. Nome Sobrenome"/></label>
     <label>Nome exibido<input value={form.shortName} onChange={e=>set('shortName',e.target.value)} placeholder="Dr. Nome Sobrenome"/></label>
     <label>Profissão<input value={form.profession} onChange={e=>set('profession',e.target.value)}/></label>
     <label>Especialidade<input value={form.specialty} onChange={e=>set('specialty',e.target.value)} placeholder="Oftalmologia"/></label>
     <label>Registro<input value={form.registration} onChange={e=>set('registration',e.target.value)} placeholder="CRM-MG 00000"/></label>
     <label>Clínica<input value={form.clinic} onChange={e=>set('clinic',e.target.value)} placeholder="Nome da clínica"/></label>
     <label className="wide">Endereço<input value={form.address} onChange={e=>set('address',e.target.value)} placeholder="Rua, número, bairro — cidade/UF"/></label>
     <label>Telefone<input value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="(37) 0000-0000"/></label>
     <label>WhatsApp<input value={form.whatsapp} onChange={e=>set('whatsapp',e.target.value)} placeholder="5537999999999"/></label>
     <label className="wide">Instagram<input value={form.instagram} onChange={e=>set('instagram',e.target.value)} placeholder="https://instagram.com/..."/></label>
     <label>Cidade<input value={form.city} onChange={e=>set('city',e.target.value)}/></label><label>UF<input value={form.state} onChange={e=>set('state',e.target.value)}/></label>
    </div>
    <h2>Identidade</h2><div className="colorFields"><label>Principal<input type="color" value={form.primary} onChange={e=>set('primary',e.target.value)}/><code>{form.primary}</code></label><label>Secundária<input type="color" value={form.secondary} onChange={e=>set('secondary',e.target.value)}/><code>{form.secondary}</code></label></div>
   </form>
   <aside className="adminOutput"><div className="outputHead"><div><span>CONFIGURAÇÃO GERADA</span><b>{slug}</b></div><button type="button" onClick={copy}>{copied?'Copiado ✓':'Copiar configuração'}</button></div><pre>{generated}</pre><div className="adminNote"><b>Antes de publicar</b><p>Enriqueça e confirme especialidade, registro, serviços, textos, contatos e endereço. O conteúdo automático é apenas a base editorial.</p></div></aside>
  </section>
 </main>
}