import { supabase } from './supabase';
import { getProfessional, type Professional, type TemplateId } from './professionals';

type DbProfessional = {
  id:string; slug:string; status:string; template_key:string; category:string; name:string;
  professional_title:string|null; registration_label:string|null; registration_number:string|null;
  specialty:string|null; city:string|null; state:string|null; whatsapp:string|null; phone:string|null;
  address:string|null; hero_title:string|null; hero_emphasis:string|null; hero_description:string|null;
  about_title:string|null; about_body:string|null; quote:string|null; clinic_name:string|null;
  seo_title:string|null; seo_description:string|null; content:Record<string,unknown>|null;
};

export async function getProfessionalRecord(slug:string):Promise<Professional|undefined>{
  const client=supabase;
  if(!client) return getProfessional(slug);
  const {data,error}=await client.from('professionals').select('*, professional_services(*), professional_faqs(*), professional_images(*)').eq('slug',slug).maybeSingle();
  if(error||!data) return getProfessional(slug);
  const p=data as DbProfessional & {professional_services:any[];professional_faqs:any[];professional_images:any[]};
  const content=(p.content||{}) as Record<string,any>;
  const images=[...(p.professional_images||[])].sort((a,b)=>(a.position||0)-(b.position||0));
  const imageUrl=(kind:string)=>{const row=images.find(x=>x.kind===kind);return row?.storage_path?client.storage.from('professional-images').getPublicUrl(row.storage_path).data.publicUrl:undefined};
  const registration=[p.registration_label,p.registration_number].filter(Boolean).join(' ');
  return {
    slug:p.slug,name:p.name,shortName:content.shortName||p.name,profession:p.professional_title||content.profession||'',specialty:p.specialty||'',registration:registration||undefined,
    clinic:p.clinic_name||undefined,address:p.address||undefined,phone:p.phone||undefined,whatsapp:p.whatsapp||undefined,instagram:content.instagram,
    bio:p.hero_description||content.bio||'',services:[...(p.professional_services||[])].sort((a,b)=>a.position-b.position).map(s=>({title:s.title,description:s.description||'',icon:s.icon||undefined})),
    template:p.template_key as TemplateId,status:p.status==='published'?'active':'demo',city:p.city||undefined,state:p.state||undefined,
    eyebrow:content.eyebrow,heroTitle:p.hero_title||undefined,heroEmphasis:p.hero_emphasis||undefined,aboutTitle:p.about_title||undefined,aboutText:p.about_body||undefined,quote:p.quote||undefined,careLabel:content.careLabel,
    professionalImage:imageUrl('profile')||imageUrl('hero'),clinicImage:imageUrl('clinic'),faqs:[...(p.professional_faqs||[])].sort((a,b)=>a.position-b.position).map(f=>({question:f.question,answer:f.answer})),
    theme:content.theme||undefined,seo:{title:p.seo_title||undefined,description:p.seo_description||undefined}
  };
}
