import type { Professional } from '../../lib/professionals';

const Mark=({children}:{children:string})=><span className="m2Mark">{children}</span>;

export default function Medical02({p}:{p:Professional}){
 const mapQuery=encodeURIComponent([p.clinic,p.address].filter(Boolean).join(' '));
 const initials=p.shortName.split(' ').filter(Boolean).slice(-2).map(x=>x[0]).join('');
 const faqs=p.faqs||[];
 return <main className="medical02">
  {p.status==='demo'&&<div className="m2Demo"><span>37LAB / MEDICAL 02</span><b>DEMONSTRAÇÃO PRIVADA</b></div>}
  <header className="m2Header"><a href="#inicio" className="m2Brand"><span className="m2Logo">+</span><span><strong>{p.shortName}</strong><small>{p.specialty}</small></span></a><nav><a href="#sobre">Perfil</a><a href="#atuacao">Atuação</a><a href="#local">Consultório</a><a href="#faq">FAQ</a></nav>{p.whatsapp?<a className="m2HeaderCta" href={`https://wa.me/${p.whatsapp}`} target="_blank" rel="noreferrer">Agendar ↗</a>:<a className="m2HeaderCta" href="#contato">Contato ↗</a>}</header>

  <section id="inicio" className="m2Hero"><div className="m2HeroCopy"><div className="m2Overline"><span></span>{p.eyebrow||'MEDICINA • TECNOLOGIA • CUIDADO'}</div><h1>Medicina clara.<br/><em>Cuidado preciso.</em></h1><p>{p.bio}</p><div className="m2Actions">{p.whatsapp&&<a className="m2Primary" href={`https://wa.me/${p.whatsapp}`} target="_blank" rel="noreferrer">Agendar consulta <b>↗</b></a>}<a href="#atuacao" className="m2TextLink">Conhecer atuação →</a></div><div className="m2Facts"><div><small>ESPECIALIDADE</small><strong>{p.specialty}</strong></div>{p.registration&&<div><small>REGISTRO</small><strong>{p.registration}</strong></div>}<div><small>LOCAL</small><strong>{p.city} / {p.state}</strong></div></div></div><div className="m2HeroMedia">{p.professionalImage?<img src={p.professionalImage} alt={`Foto profissional de ${p.name}`}/>:<div className="m2Portrait"><span>{initials}</span><small>FOTO PROFISSIONAL</small></div>}<div className="m2Floating"><span>01</span><div><small>ATENDIMENTO</small><b>Individualizado</b></div></div><div className="m2Cross">+</div></div></section>

  <section className="m2Ticker"><span>PREVENÇÃO</span><i>+</i><span>ACOMPANHAMENTO</span><i>+</i><span>CIÊNCIA</span><i>+</i><span>ESCUTA</span><i>+</i><span>SAÚDE</span></section>

  <section id="sobre" className="m2About"><div className="m2SectionIndex">01 / PERFIL</div><div className="m2AboutMain"><h2>{p.aboutTitle||'Medicina contemporânea, próxima e individualizada.'}</h2><div className="m2AboutGrid"><p>{p.aboutText||p.bio}</p>{p.quote&&<blockquote>“{p.quote}”</blockquote>}</div></div><aside><Mark>+</Mark><small>ABORDAGEM</small><b>{p.careLabel||'cuidado centrado no paciente'}</b></aside></section>

  <section id="atuacao" className="m2Services"><div className="m2ServicesHead"><div><span className="m2SectionIndex">02 / ATUAÇÃO</span><h2>Áreas de cuidado</h2></div><p>Atendimento estruturado para orientar, acompanhar e cuidar da saúde de forma individualizada.</p></div><div className="m2ServiceList">{p.services.map((s,i)=><article key={s.title}><span className="m2ServiceNo">0{i+1}</span><h3>{s.title}</h3><p>{s.description}</p><b>↗</b></article>)}</div></section>

  <section className="m2Statement"><span>37LAB / MEDICAL 02</span><h2>Informação clara.<br/><em>Decisões mais conscientes.</em></h2><p>Uma presença digital construída para transmitir confiança, precisão e proximidade.</p></section>

  {(p.clinic||p.address)&&<section id="local" className="m2Location"><div className="m2LocationImage">{p.clinicImage?<img src={p.clinicImage} alt={p.clinic||'Consultório'}/>:<div className="m2ClinicPlaceholder"><Mark>+</Mark><span>AMBIENTE / CONSULTÓRIO</span></div>}<span className="m2ImageLabel">03 / LOCAL</span></div><div className="m2LocationCopy"><small>ONDE ATENDO</small><h2>{p.clinic||'Consultório'}</h2>{p.address&&<p>{p.address}</p>}{p.phone&&<a href={`tel:${p.phone.replace(/\D/g,'')}`}>{p.phone}</a>}<a className="m2Map" href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer">Abrir no mapa <b>↗</b></a></div></section>}

  <section id="faq" className="m2Faq"><div><span className="m2SectionIndex">04 / INFORMAÇÕES</span><h2>Antes da<br/>consulta.</h2></div><div>{faqs.map(f=><details key={f.question}><summary><span>{f.question}</span><b>+</b></summary><p>{f.answer}</p></details>)}</div></section>

  <section id="contato" className="m2Contact"><div><small>PRÓXIMO PASSO</small><h2>Vamos conversar<br/>sobre sua saúde?</h2></div><div><p>Consulte disponibilidade e informações diretamente com a equipe.</p>{p.whatsapp&&<a href={`https://wa.me/${p.whatsapp}`} target="_blank" rel="noreferrer">Agendar pelo WhatsApp <b>↗</b></a>}</div></section>

  <footer className="m2Footer"><div className="m2Brand"><span className="m2Logo">+</span><span><strong>{p.shortName}</strong><small>{p.specialty}</small></span></div><div><span>{p.city} / {p.state}</span>{p.registration&&<span>{p.registration}</span>}</div><div>{p.instagram&&<a href={p.instagram} target="_blank" rel="noreferrer">Instagram ↗</a>}<span>© {new Date().getFullYear()}</span></div><small>CONCEITO E TECNOLOGIA <b>37LAB</b></small></footer>
 </main>
}