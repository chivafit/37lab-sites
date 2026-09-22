export type Professional = {
  slug: string; name: string; shortName: string; profession: string; specialty: string;
  registration?: string; clinic?: string; address?: string; phone?: string;
  whatsapp?: string; instagram?: string; bio?: string; services: {title:string; description:string}[];
  template: 'medical-01' | 'care-01' | 'dental-01'; status: 'demo' | 'active';
};

export const professionals: Professional[] = [
  {
    slug:'lucas-camargos', name:'Dr. Lucas Camargos Silva Felix', shortName:'Dr. Lucas Camargos', profession:'Médico',
    specialty:'Clínica Geral e Atenção Primária', registration:'CRM-MG 107326', clinic:'Clínica Mais Saúde GMS',
    address:'Rua Padre Abel, 191/194, Centro — Piumhi/MG', phone:'(37) 99935-8585', whatsapp:'5537999358585',
    bio:'Atendimento médico com foco em prevenção, acompanhamento e cuidado integral em todas as fases da vida.',
    services:[
      {title:'Consulta Clínica Geral',description:'Avaliação completa e acompanhamento individualizado.'},
      {title:'Atenção Primária',description:'Cuidado contínuo, prevenção e promoção da saúde.'},
      {title:'Check-up e Prevenção',description:'Orientações e acompanhamento preventivo.'},
      {title:'Acompanhamento',description:'Monitoramento clínico e continuidade do cuidado.'}
    ], template:'medical-01', status:'demo'
  }
];

export function getProfessional(slug:string){ return professionals.find(p=>p.slug===slug); }