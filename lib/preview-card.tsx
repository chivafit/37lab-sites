import {ImageResponse} from 'next/og';
import type {Professional} from './professionals';
// Imagem que vai no WhatsApp, no estilo de apresentação de agência: o site no computador com o celular
// na frente (1ª mensagem) ou só o computador (2ª), sobre fundo claro na cor do site e com pouco texto.
export type ShotView='combo'|'desktop';
const W=1600,H=1100,INK='#1d2522',MUTED='#6f7b77';
// Fundo claro tingido com a cor principal do site, para a imagem combinar com a prévia.
function tint(hex:string|undefined,amount:number){const m=/^#?([0-9a-f]{6})$/i.exec(hex||'');if(!m)return'#eef1ef';const n=parseInt(m[1],16),mix=(c:number)=>Math.round(c*amount+255*(1-amount));return`rgb(${mix(n>>16&255)},${mix(n>>8&255)},${mix(n&255)})`}
function Browser({shot,width}:{shot:string;width:number}){
 const h=Math.round(width*900/1440);
 return <div style={{display:'flex',flexDirection:'column',borderRadius:18,overflow:'hidden',background:'#fff',boxShadow:'0 30px 70px rgba(20,30,28,.18), 0 4px 14px rgba(20,30,28,.08)'}}>
  <div style={{display:'flex',alignItems:'center',gap:9,height:40,padding:'0 18px',background:'#f4f5f4',borderBottom:'1px solid #e3e6e4'}}>{['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} style={{display:'flex',width:12,height:12,borderRadius:6,background:c}}/>)}</div>
  <img src={shot} width={width} height={h} style={{objectFit:'cover',objectPosition:'top'}}/>
 </div>}
function Phone({shot,width}:{shot:string;width:number}){
 const screen=width-20;
 return <div style={{display:'flex',padding:10,borderRadius:52,background:'#101414',boxShadow:'0 30px 70px rgba(20,30,28,.30), 0 4px 14px rgba(20,30,28,.12)'}}>
  <img src={shot} width={screen} height={Math.round(screen*844/390)} style={{borderRadius:42,objectFit:'cover',objectPosition:'top'}}/>
 </div>}
export function previewCard({view,p,desktop,mobile}:{view:ShotView;p:Professional;desktop:string;mobile?:string}){
 const bg=`linear-gradient(135deg,${tint(p.theme?.primary,.10)} 0%,${tint(p.theme?.primary,.03)} 100%)`;
 const side=view==='combo'&&mobile?90:150,caption=<div style={{display:'flex',position:'absolute',left:side,right:side,bottom:56,alignItems:'baseline',justifyContent:'space-between'}}>
  <span style={{fontSize:30,color:INK}}>Prévia do site · {p.name}</span><span style={{fontSize:24,color:MUTED,letterSpacing:4}}>37LAB</span></div>;
 if(view==='combo'&&mobile)return new ImageResponse(<div style={{display:'flex',position:'relative',width:W,height:H,background:bg,fontFamily:'sans-serif'}}>
  <div style={{display:'flex',position:'absolute',left:90,top:80}}><Browser shot={desktop} width={1160}/></div>
  <div style={{display:'flex',position:'absolute',right:80,top:215}}><Phone shot={mobile} width={360}/></div>
  {caption}
 </div>,{width:W,height:H});
 return new ImageResponse(<div style={{display:'flex',position:'relative',width:W,height:H,background:bg,fontFamily:'sans-serif',justifyContent:'center'}}>
  <div style={{display:'flex',position:'absolute',top:80}}><Browser shot={desktop} width={1300}/></div>
  {caption}
 </div>,{width:W,height:H});
}
