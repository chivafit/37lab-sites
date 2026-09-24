'use client';
import {useEffect,useState} from 'react';

type Pop={x:number;y:number;items:string[];row:HTMLElement|null}|null;

export default function PendingPopover(){
  const[pop,setPop]=useState<Pop>(null);
  useEffect(()=>{
    function click(e:MouseEvent){
      const el=(e.target as HTMLElement).closest('[title^="Falta completar:"]') as HTMLElement|null;
      if(!el){setPop(null);return}
      e.preventDefault();e.stopPropagation();
      const items=(el.getAttribute('title')||'').replace('Falta completar:','').split('·').map(x=>x.trim()).filter(Boolean);
      const r=el.getBoundingClientRect();
      setPop({x:Math.min(r.left,window.innerWidth-330),y:r.bottom+8,items,row:el.closest('.leadRow') as HTMLElement|null});
    }
    function key(e:KeyboardEvent){if(e.key==='Escape')setPop(null)}
    document.addEventListener('click',click);document.addEventListener('keydown',key);
    return()=>{document.removeEventListener('click',click);document.removeEventListener('keydown',key)};
  },[]);
  function go(item:string){
    const row=pop?.row;if(!row)return;
    const buttons=[...row.querySelectorAll('button')] as HTMLButtonElement[];
    if(item==='Foto profissional')buttons.find(b=>b.textContent?.trim().startsWith('Foto'))?.click();
    else buttons.find(b=>b.textContent?.trim()==='Editar')?.click();
    setPop(null);
  }
  if(!pop)return null;
  return <><div className="pendingBackdrop" onClick={()=>setPop(null)}/><aside className="pendingPopover" style={{left:pop.x,top:pop.y}} onClick={e=>e.stopPropagation()}><div className="pendingHead"><div><small>PENDÊNCIAS DA DEMO</small><strong>{pop.items.length} {pop.items.length===1?'item para revisar':'itens para revisar'}</strong></div><button onClick={()=>setPop(null)} aria-label="Fechar">×</button></div><div className="pendingItems">{pop.items.map(item=><button key={item} onClick={()=>go(item)}><span>○</span><div><b>{item}</b><small>{item==='Foto profissional'?'Selecionar ou confirmar foto real':item==='Contato'?'Adicionar telefone, WhatsApp ou Instagram':item==='Localização'?'Adicionar clínica ou endereço':'Revisar textos, serviços e perguntas frequentes'}</small></div><i>→</i></button>)}</div></aside><style jsx global>{`.pendingBackdrop{position:fixed;inset:0;z-index:80;background:transparent}.pendingPopover{position:fixed;z-index:81;width:min(310px,calc(100vw - 24px));background:#0d1418;border:1px solid #2a383f;border-radius:14px;box-shadow:0 22px 70px rgba(0,0,0,.55);padding:12px;color:#eef2f3}.pendingHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:4px 5px 11px;border-bottom:1px solid #202b31}.pendingHead small{display:block;color:#7b9089;font-size:8px;letter-spacing:.14em;margin-bottom:5px}.pendingHead strong{font-size:12px}.pendingHead>button{border:0;background:transparent;color:#87979e;font-size:20px;cursor:pointer;line-height:1}.pendingItems{display:grid;gap:5px;padding-top:8px}.pendingItems>button{display:grid;grid-template-columns:18px 1fr 15px;gap:8px;align-items:center;text-align:left;width:100%;border:1px solid transparent;background:transparent;color:#dfe6e8;border-radius:9px;padding:9px 8px;cursor:pointer}.pendingItems>button:hover{background:#131e23;border-color:#26353c}.pendingItems>button>span{color:#88a99e}.pendingItems b{display:block;font-size:11px;margin-bottom:3px}.pendingItems small{display:block;color:#7d8c93;font-size:9px;line-height:1.35}.pendingItems i{font-style:normal;color:#789087}@media(max-width:520px){.pendingPopover{left:12px!important;right:12px;top:auto!important;bottom:12px;width:auto}}`}</style></>;
}
