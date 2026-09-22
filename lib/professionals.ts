export type Service = { title:string; description:string; icon?:'heart'|'shield'|'user'|'plus' };
export type FAQ = { question:string; answer:string };
export type Theme = {
  primary?:string;
  secondary?:string;
  background?:string;
  surface?:string;
};
export type SEO = {
  title?:string;
  description?:string;
};
export type Professional = {
  slug:string; name:string; shortName:string; profession:string; specialty:string;
  registration?:string; clinic?:string; address?:string; phone?:string;
  whatsapp?:string; instagram?:string; bio:string; services:Service[];
  template:'medical-01'|'care-01'|'dental-01'; status:'demo'|'active';
  city?:string; state?:string; eyebrow?:string; heroTitle?:string; heroEmphasis?:string;
  aboutTitle?:string; aboutText?:string; quote?:string; careLabel?:string;
  clinicImage?:string; professionalImage?:string; instagramLabel?:string;
  faqs?:FAQ[];
  theme?:Theme;
  seo?:SEO;
};

/*
  37LAB — catálogo de clientes

  Para criar um novo site Medical 01, duplique apenas um objeto abaixo e altere
  os dados do profissional. O componente visual em app/demo/[slug]/page.tsx
  permanece compartilhado entre todos os clientes.

  Imagens podem ser adicionadas em /public/clients/<slug>/ e referenciadas como:
  professionalImage: '/clients/<slug>/professional.jpg'
  clinicImage: '/clients/<slug>/clinic.jpg'
*/
export const professionals: Professional[] = [
  {
    slug:'lucas-camargos',
    name:'Dr. Lucas Camargos Silva Felix',
    shortName:'Dr. Lucas Camargos',
    profession:'Médico',
    specialty:'Clínica Geral e Atenção Primária',
    registration:'CRM-MG 107326',
    clinic:'Clínica Mais Saúde GMS',
    address:'Rua Padre Abel, 191/194, Centro — Piumhi/MG',
    phone:'(37) 99935-8585',
    whatsapp:'5537999358585',
    city:'Piumhi',
    state:'MG',

    eyebrow:'SAÚDE • ESCUTA • PREVENÇÃO',
    heroTitle:'Cuidado próximo.',
    heroEmphasis:'Saúde por inteiro.',
    bio:'Atendimento médico com foco em prevenção, acompanhamento e cuidado integral em todas as fases da vida.',
    aboutTitle:'Medicina com escuta, ciência e humanidade.',
    aboutText:'A proposta é construir uma relação de confiança, com atenção à prevenção, ao acompanhamento e às necessidades individuais de cada paciente.',
    quote:'Cuidar da saúde também é acompanhar, orientar e prevenir.',
    careLabel:'cuidado centrado em cada paciente',

    services:[
      {title:'Consulta Clínica Geral',description:'Avaliação completa e acompanhamento individualizado.',icon:'plus'},
      {title:'Atenção Primária',description:'Cuidado contínuo, prevenção e promoção da saúde.',icon:'heart'},
      {title:'Check-up e Prevenção',description:'Orientações e acompanhamento preventivo.',icon:'shield'},
      {title:'Acompanhamento',description:'Monitoramento clínico e continuidade do cuidado.',icon:'heart'}
    ],

    faqs:[
      {question:'Como faço para agendar?',answer:'Entre em contato pelo WhatsApp e consulte os horários disponíveis.'},
      {question:'Onde acontece o atendimento?',answer:'O atendimento acontece na Clínica Mais Saúde GMS — Rua Padre Abel, 191/194, Centro — Piumhi/MG.'},
      {question:'Atende por convênio?',answer:'Consulte diretamente a equipe para confirmar convênios e modalidades de atendimento.'},
      {question:'Como funciona a primeira consulta?',answer:'As orientações específicas são fornecidas no momento do agendamento.'}
    ],

    theme:{
      primary:'#155846',
      secondary:'#6f9187',
      background:'#f7f9f5',
      surface:'#ffffff'
    },
    seo:{
      title:'Dr. Lucas Camargos | Clínica Geral e Atenção Primária em Piumhi',
      description:'Atendimento médico com foco em prevenção, acompanhamento e cuidado integral em Piumhi, MG.'
    },
    template:'medical-01',
    status:'demo'
  }
];

export function getProfessional(slug:string){
  return professionals.find(p=>p.slug===slug);
}