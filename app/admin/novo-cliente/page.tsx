'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';

type FormState={name:string;shortName:string;profession:string;specialty:string;registration:string;clinic:string;address:string;phone:string;whatsapp:string;instagram:string;city:string;state:string;primary:string;secondary:string};
type ImageState={professional?:File;clinic?:File;professionalPreview?:string;clinicPreview?:string};
const initial:FormState={name:'',shortName:'',profession:'Médico',specialty:'',registration:'',clinic:'',address:'',phone:'',whatsapp:'',instagram:'',city:'Piumhi',state:'MG',primary:'#155846',secondary:'#6f9187'};
const slugify=(v:string)=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/^(dr|dra)\.?\s+/,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const cleanPhone=(v:string)=>v.replace(/\D/g,'');

export default function NovoCliente(){
 const [form,setForm]=useState(initial); const [images,setImages]=useState<ImageState>({}); const [copied,setCopied]=useState(false);
 const set=(key:keyof FormState,value:string)=>setForm(s=>({...s,[key]:value}));
 const slug=useMemo(()=>slugify(form.shortName||form.name||'novo-cliente'),[form.shortName,form.name]);
 const demoPath=`/demo/${slug}`;
 const demoUrl=typeof window!=='undefined'?`${window.location.origin}${demoPath}`:demoPath;
 useEffect(()=>()=>{if(images.professionalPreview)URL.revokeObjectURL(images.professionalPreview);if(images.clinicPreview)URL.revokeObjectURL(images.clinicPreview)},[images.professionalPreview,images.clinicPreview]);
 function imageChange(kind:'professional'|'clinic',e:ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];if(!file)return;const key=kind==='professional'?'professionalPreview':'clinicPreview';setImages(s=>{const old=s[key];if(old)URL.revokeObjectURL(old);return {...s,[kind]:file,[key]:URL.createObjectURL(file)}})}
 const generated=useMemo(()=>{
  const specialty=form.specialty||'Especialidade médica'; const city=form.city||'Piumhi'; const first=form.shortName||form.name||'Profissional'; const whatsapp=cleanPhone(form.whatsapp);
  return `{
  slug:'${slug}',
  name:${JSON.stringify(form.name)}, shortName:${JSON.stringify(form.shortName||form.name)}, profession:${JSON.stringify(form.profession)}, specialty:${JSON.stringify(form.specialty)},
  ${form.registration?`registration:${JSON.stringify(form.registration)}, `:''}${form.clinic?`clinic:${JSON.stringify(form.clinic)}, `:''}${form.address?`address:${JSON.stringify(form.address)}, `:''}${form.phone?`phone:${JSON.stringify(form.phone)}, `:''}${whatsapp?`whatsapp:${JSON.stringify(whatsapp)}, `:''}${form.instagram?`instagram:${JSON.stringify(form.instagram)}, `:''}
  city:${JSON.stringify(form.city)}, state:${JSON.stringify(form.state)},
  ${images.professional?`professionalImage:'/clients/${slug}/professional.${images.professional.name.split('.').pop()?.toLowerCase()||'jpg'}',\n  `:''}${images.clinic?`clinicImage:'/clients/${slug}/clinic.${images.clinic.name.split('.').pop()?.toLowerCase()||'jpg'}',\n  `:''}eyebrow:'SAÚDE • CUIDADO • CONFIANÇA', heroTitle:'Cuidado próximo.', heroEmphasis:'Saúde por inteiro.',
  bio:${JSON.stringify(`Atendimento em ${specialty} com cuidado individualizado, atenção à prevenção e acompanhamento em ${city}.`)},
  aboutTitle:${JSON.stringify(`${specialty} com atenção, ciência e humanidade.`)},
  aboutText:'Uma abordagem centrada nas necessidades de cada paciente, com escuta, orientação e acompanhamento individualizado.',
  quote:'Cuidar da saúde também é acompanhar, orientar e prevenir.', careLabel:'cuidado centrado em cada paciente',
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
 },[form,slug,images.professional,images.clinic]);
 async function copy(){await navigator.clipboard.writeText(generated);setCopied(true);setTimeout(()=>setCopied(false),1600)}
 return <main className="adminGenerator">
  <header className="adminTop"><div><b>37LAB</b><span>Sites</span></div><small>GERADOR INTERNO • MEDICAL 01</small></header>
  <section className="adminIntro"><div><span className="adminKicker">NOVO CLIENTE</span><h1>Da ficha à demo<br/><em>em minutos.</em></h1><p>Preencha os dados confirmados e selecione as imagens. O slug do cliente gera automaticamente a URL exclusiva da demonstração.</p></div><div className="adminStatus"><span>Template</span><b>Medical 01</b><span>URL personalizada prevista</span><b className="urlPreview">{demoUrl}</b><small>Esta URL passa a existir após o cadastro ser salvo/publicado.</small></div></section>
  <section className="adminWorkspace">
   <form className="adminForm" onSubmit={e=>e.preventDefault()}>
    <h2>Dados do profissional</h2><div className="adminGrid">
     <label>Nome completo<input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Dr. Nome Sobrenome"/></label><label>Nome exibido<input value={form.shortName} onChange={e=>set('shortName',e.target.value)} placeholder="Dr. Nome Sobrenome"/></label>
     <label>Profissão<input value={form.profession} onChange={e=>set('profession',e.target.value)}/></label><label>Especialidade<input value={form.specialty} onChange={e=>set('specialty',e.target.value)} placeholder="Oftalmologia"/></label>
     <label>Registro<input value={form.registration} onChange={e=>set('registration',e.target.value)} placeholder="CRM-MG 00000"/></label><label>Clínica<input value={form.clinic} onChange={e=>set('clinic',e.target.value)} placeholder="Nome da clínica"/></label>
     <label className="wide">Endereço<input value={form.address} onChange={e=>set('address',e.target.value)} placeholder="Rua, número, bairro — cidade/UF"/></label><label>Telefone<input value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="(37) 0000-0000"/></label><label>WhatsApp<input value={form.whatsapp} onChange={e=>set('whatsapp',e.target.value)} placeholder="5537999999999"/></label>
     <label className="wide">Instagram<input value={form.instagram} onChange={e=>set('instagram',e.target.value)} placeholder="https://instagram.com/..."/></label><label>Cidade<input value={form.city} onChange={e=>set('city',e.target.value)}/></label><label>UF<input value={form.state} onChange={e=>set('state',e.target.value)}/></label>
    </div>
    <h2>Imagens</h2><p className="formHelp">Selecione a foto profissional e uma imagem do consultório/clínica. Nesta etapa elas ficam em pré-visualização; ao automatizarmos o botão Criar demo, os arquivos serão enviados junto com o cadastro.</p><div className="imageUploads">
     <label className="uploadCard"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>imageChange('professional',e)}/>{images.professionalPreview?<img src={images.professionalPreview} alt="Prévia da foto profissional"/>:<div className="uploadEmpty"><b>＋</b><strong>Foto profissional</strong><span>JPG, PNG ou WebP</span></div>}<em>{images.professional?.name||'Selecionar imagem'}</em></label>
     <label className="uploadCard"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>imageChange('clinic',e)}/>{images.clinicPreview?<img src={images.clinicPreview} alt="Prévia da clínica"/>:<div className="uploadEmpty"><b>＋</b><strong>Clínica / consultório</strong><span>JPG, PNG ou WebP</span></div>}<em>{images.clinic?.name||'Selecionar imagem'}</em></label>
    </div>
    <h2>Identidade</h2><div className="colorFields"><label>Principal<input type="color" value={form.primary} onChange={e=>set('primary',e.target.value)}/><code>{form.primary}</code></label><label>Secundária<input type="color" value={form.secondary} onChange={e=>set('secondary',e.target.value)}/><code>{form.secondary}</code></label></div>
   </form>
   <aside className="adminOutput"><div className="outputHead"><div><span>CONFIGURAÇÃO GERADA</span><b>{slug}</b></div><button type="button" onClick={copy}>{copied?'Copiado ✓':'Copiar configuração'}</button></div><div className="demoUrlCard"><span>URL DA DEMO</span><strong>{demoUrl}</strong><small>Gerada a partir do nome exibido do cliente.</small></div><pre>{generated}</pre><div className="adminNote"><b>Próxima automação</b><p>O gerador já prepara URL e caminhos das imagens. Falta conectar o botão Criar demo ao armazenamento e ao cadastro persistente para publicar tudo em uma única ação.</p></div></aside>
  </section>
 </main>
}