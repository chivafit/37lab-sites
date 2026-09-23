import {NextRequest,NextResponse} from 'next/server';

const PLATFORM_HOSTS=new Set(['37lab-sites.vercel.app','localhost','127.0.0.1']);
const DEMO_HOST='sites.37lab.com.br';

export function middleware(req:NextRequest){
  const host=(req.headers.get('host')||'').split(':')[0].toLowerCase();
  const url=req.nextUrl.clone();

  // URL comercial: sites.37lab.com.br/nome-do-profissional
  // Internamente continua usando a rota compartilhada /demo/[slug].
  if(host===DEMO_HOST){
    if(url.pathname.startsWith('/_next')||url.pathname.startsWith('/api')||url.pathname.startsWith('/admin')||url.pathname.includes('.')) return NextResponse.next();
    const parts=url.pathname.split('/').filter(Boolean);
    if(parts.length){
      const slug=parts[0];
      const rest=parts.slice(1).join('/');
      url.pathname=`/demo/${slug}${rest?`/${rest}`:''}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  if(PLATFORM_HOSTS.has(host)||host.endsWith('.vercel.app')||url.pathname.startsWith('/admin')||url.pathname.startsWith('/demo')||url.pathname.startsWith('/_next')||url.pathname.includes('.')) return NextResponse.next();

  // Domínios próprios de clientes continuam resolvidos pela tabela professional_domains.
  url.pathname=`/domain/${encodeURIComponent(host)}${url.pathname==='/'?'':url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config={matcher:['/((?!api).*)']};
