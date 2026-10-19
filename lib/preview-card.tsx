import {ImageResponse} from 'next/og';
import type {Professional} from './professionals';
// Imagem que vai no WhatsApp: o print da prévia montado num celular (1ª mensagem) ou num navegador (2ª),
// com a foto, o nome e uma frase pessoal. Um print "cru" parece captura qualquer; montado, parece feito para a pessoa.
export type ShotView='mobile'|'desktop';
const BG='linear-gradient(160deg,#0b1215 0%,#132025 55%,#1b2e35 100%)';
const initials=(name:string)=>name.replace(/\b(dra?|doutora?)\.?\s+/gi,'').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
function Header({p,label,accent,photo}:{p:Professional;label:string;accent:string;photo?:string}){
 const who=[p.specialty||p.profession,p.city].filter(Boolean).join(' · ');
 return <div style={{display:'flex',flexDirection:'column'}}>
  <div style={{display:'flex',alignItems:'center',gap:14,color:'#9fb0b3',fontSize:22,letterSpacing:5}}><span style={{color:'#fff',fontWeight:700,letterSpacing:1,fontSize:26}}>37LAB</span><span>·</span><span>PRÉVIA DO SEU SITE</span></div>
  <div style={{display:'flex',alignItems:'center',gap:26,marginTop:44}}>
   {photo?<img src={photo} width={112} height={112} style={{borderRadius:56,objectFit:'cover',border:`4px solid ${accent}`}}/>:<div style={{display:'flex',width:112,height:112,borderRadius:56,background:accent,color:'#fff',fontSize:42,alignItems:'center',justifyContent:'center'}}>{initials(p.name)}</div>}
   <div style={{display:'flex',flexDirection:'column',flex:1}}><span style={{color:'#fff',fontSize:34,fontWeight:700}}>{p.name}</span>{who&&<span style={{color:'#9fb0b3',fontSize:25,marginTop:6}}>{who}</span>}</div>
  </div>
  <div style={{display:'flex',color:'#fff',fontSize:58,lineHeight:1.08,letterSpacing:-1.5,marginTop:40}}>{label}</div>
 </div>}
export function previewCard({view,p,label,shot,photo}:{view:ShotView;p:Professional;label:string;shot:string;photo?:string}){
 const accent=p.theme?.primary||'#3f7d6d';
 if(view==='mobile')return new ImageResponse(<div style={{display:'flex',flexDirection:'column',width:'100%',height:'100%',background:BG,padding:'64px 72px 0',fontFamily:'sans-serif'}}>
  <Header p={p} label={label} accent={accent} photo={photo}/>
  <div style={{display:'flex',justifyContent:'center',marginTop:52}}>
   <div style={{display:'flex',padding:16,borderRadius:72,background:'#05090b',border:'3px solid #33424a',boxShadow:'0 40px 90px rgba(0,0,0,.55)'}}>
    <img src={shot} width={430} height={931} style={{borderRadius:56,objectFit:'cover',objectPosition:'top'}}/>
   </div>
  </div>
 </div>,{width:1080,height:1350});
 return new ImageResponse(<div style={{display:'flex',flexDirection:'column',width:'100%',height:'100%',background:BG,padding:'64px 72px 0',fontFamily:'sans-serif'}}>
  <Header p={p} label={label} accent={accent} photo={photo}/>
  <div style={{display:'flex',flexDirection:'column',marginTop:52,borderRadius:22,overflow:'hidden',border:'3px solid #33424a',boxShadow:'0 40px 90px rgba(0,0,0,.55)'}}>
   <div style={{display:'flex',alignItems:'center',gap:10,height:44,padding:'0 20px',background:'#1d2a30'}}><div style={{display:'flex',width:14,height:14,borderRadius:7,background:'#ff5f57'}}/><div style={{display:'flex',width:14,height:14,borderRadius:7,background:'#febc2e'}}/><div style={{display:'flex',width:14,height:14,borderRadius:7,background:'#28c840'}}/></div>
   <img src={shot} width={1050} height={656} style={{objectFit:'cover',objectPosition:'top'}}/>
  </div>
 </div>,{width:1200,height:1200});
}
