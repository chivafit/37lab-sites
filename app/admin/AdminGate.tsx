'use client';

import {FormEvent,ReactNode,useEffect,useState} from 'react';
import {supabase,isSupabaseConfigured} from '../../lib/supabase';

const ADMIN_EMAIL='iararodriguesimih@gmail.com';

export default function AdminGate({children}:{children:ReactNode}){
  const [checking,setChecking]=useState(true);
  const [allowed,setAllowed]=useState(false);
  const [email,setEmail]=useState(ADMIN_EMAIL);
  const [password,setPassword]=useState('');
  const [message,setMessage]=useState('');
  const [submitting,setSubmitting]=useState(false);

  useEffect(()=>{
    const client=supabase;
    if(!client){setChecking(false);return;}
    let alive=true;
    client.auth.getUser().then(({data})=>{
      if(!alive)return;
      const ok=data.user?.email?.toLowerCase()===ADMIN_EMAIL;
      setAllowed(ok);
      setChecking(false);
      if(data.user&&!ok)client.auth.signOut();
    });
    const {data:listener}=client.auth.onAuthStateChange((_event,session)=>{
      if(!alive)return;
      const ok=session?.user?.email?.toLowerCase()===ADMIN_EMAIL;
      setAllowed(ok);
      setChecking(false);
    });
    return()=>{alive=false;listener.subscription.unsubscribe();};
  },[]);

  async function login(e:FormEvent){
    e.preventDefault();
    const client=supabase;
    if(!client)return;
    if(email.trim().toLowerCase()!==ADMIN_EMAIL){setMessage('Acesso não autorizado.');return;}
    if(!password){setMessage('Digite sua senha.');return;}
    setSubmitting(true);setMessage('Validando acesso...');
    const {data,error}=await client.auth.signInWithPassword({email:ADMIN_EMAIL,password});
    if(error||data.user?.email?.toLowerCase()!==ADMIN_EMAIL){
      if(data.user)await client.auth.signOut();
      setMessage('E-mail ou senha incorretos.');setSubmitting(false);return;
    }
    setAllowed(true);setMessage('');setSubmitting(false);
  }

  if(checking)return <main style={shell}><div style={card}><div style={brand}>37LAB <small style={small}>Sites</small></div><p style={muted}>Verificando acesso administrativo...</p></div></main>;
  if(!isSupabaseConfigured)return <main style={shell}><div style={card}><div style={brand}>37LAB <small style={small}>Sites</small></div><h1 style={title}>Configuração indisponível.</h1><p style={muted}>O Supabase não está configurado neste deployment.</p></div></main>;
  if(!allowed)return <main style={shell}><section style={loginWrap}><div><span style={kicker}>ÁREA PRIVADA</span><h1 style={hero}>Painel 37LAB<br/><i style={{color:'#89a69d'}}>Sites.</i></h1><p style={muted}>Entre para acessar profissionais, demos e clientes.</p></div><form onSubmit={login} style={card}><span style={kicker}>ACESSO ADMINISTRATIVO</span><label style={label}>E-mail<input style={input} type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username"/></label><label style={label}>Senha<input style={input} type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" autoFocus/></label><button style={button} disabled={submitting}>{submitting?'Entrando...':'Entrar no painel →'}</button>{message&&<p style={error}>{message}</p>}</form></section></main>;
  return <>{children}</>;
}

const shell:React.CSSProperties={minHeight:'100vh',background:'#080d0f',color:'#eef1ef',fontFamily:'Arial,sans-serif',display:'grid',placeItems:'center',padding:'32px'};
const loginWrap:React.CSSProperties={width:'min(1100px,100%)',display:'grid',gridTemplateColumns:'1.2fr .8fr',gap:'72px',alignItems:'center'};
const card:React.CSSProperties={width:'100%',maxWidth:'480px',background:'#0d1417',border:'1px solid #26343a',borderRadius:'24px',padding:'34px',boxShadow:'0 24px 80px rgba(0,0,0,.28)'};
const brand:React.CSSProperties={fontFamily:'Georgia,serif',fontSize:'30px',marginBottom:'22px'};
const small:React.CSSProperties={fontFamily:'Arial,sans-serif',fontSize:'10px',letterSpacing:'3px',color:'#829097'};
const kicker:React.CSSProperties={fontSize:'10px',letterSpacing:'3px',color:'#89a69d',fontWeight:700};
const hero:React.CSSProperties={fontFamily:'Georgia,serif',fontWeight:400,fontSize:'clamp(48px,7vw,82px)',lineHeight:.95,margin:'18px 0 24px'};
const title:React.CSSProperties={fontFamily:'Georgia,serif',fontSize:'36px',fontWeight:400};
const muted:React.CSSProperties={color:'#9ba9ae',fontSize:'15px',lineHeight:1.7};
const label:React.CSSProperties={display:'grid',gap:'8px',marginTop:'22px',fontSize:'11px',letterSpacing:'1px',color:'#aeb9bd'};
const input:React.CSSProperties={width:'100%',boxSizing:'border-box',border:'1px solid #304047',borderRadius:'12px',background:'#091013',color:'#fff',padding:'14px 15px',fontSize:'15px',outline:'none'};
const button:React.CSSProperties={width:'100%',border:0,borderRadius:'12px',background:'#edf1ef',color:'#0a0e10',padding:'15px',fontWeight:700,marginTop:'24px',cursor:'pointer'};
const error:React.CSSProperties={color:'#e2a7a7',fontSize:'13px',marginTop:'14px'};
