import { notFound } from 'next/navigation';
import { getProfessional } from '../../../lib/professionals';

export default async function DemoPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params; const p=getProfessional(slug); if(!p) notFound();
  return <main>
    <div className="demoBar">Demonstração privada preparada pela 37LAB</div>
    <nav><strong>{p.shortName}</strong><span>{p.specialty}</span><a href="#contato">Agendar consulta</a></nav>
    <section className="hero"><div><small>SAÚDE COM PROPÓSITO</small><h1>Cuidado integral para todas as fases da sua vida.</h1><p>{p.bio}</p>{p.whatsapp&&<a className="primary" href={`https://wa.me/${p.whatsapp}`}>Agendar pelo WhatsApp</a>}</div><div className="portrait"><span>Foto profissional</span></div></section>
    <section className="about"><small>SOBRE</small><h2>{p.name}</h2><p>{p.profession} • {p.specialty}</p>{p.registration&&<p>{p.registration}</p>}</section>
    <section><div className="heading"><small>ÁREAS DE ATUAÇÃO</small><h2>Como posso te ajudar?</h2></div><div className="cards">{p.services.map(s=><article key={s.title}><h3>{s.title}</h3><p>{s.description}</p></article>)}</div></section>
    {(p.clinic||p.address)&&<section className="location"><small>ONDE ATENDO</small><h2>{p.clinic}</h2><p>{p.address}</p>{p.phone&&<p>{p.phone}</p>}</section>}
    <section id="contato" className="cta"><small>VAMOS CUIDAR DA SUA SAÚDE?</small><h2>Agende sua consulta</h2><p>Entre em contato e consulte disponibilidade de atendimento.</p>{p.whatsapp&&<a href={`https://wa.me/${p.whatsapp}`}>Agendar pelo WhatsApp</a>}</section>
    <footer><strong>{p.shortName}</strong><span>{p.specialty}</span><em>Demo • 37LAB</em></footer>
  </main>
}