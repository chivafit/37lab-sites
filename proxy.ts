import { NextRequest, NextResponse } from 'next/server';
import { getProfessionalByDomain } from './lib/professionals';

export function proxy(request:NextRequest){
  const hostname=request.headers.get('host')||'';
  const professional=getProfessionalByDomain(hostname);

  if(!professional || professional.status!=='active') return NextResponse.next();

  const {pathname}=request.nextUrl;

  // Não reescreve arquivos internos/estáticos nem chamadas de API.
  if(pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')){
    return NextResponse.next();
  }

  // O domínio do cliente enxerga o site na raiz, mantendo a implementação
  // compartilhada internamente em /demo/[slug]. Âncoras e demais paths continuam válidos.
  const url=request.nextUrl.clone();
  url.pathname=`/demo/${professional.slug}${pathname==='/'?'':pathname}`;
  return NextResponse.rewrite(url);
}

export const config={
  matcher:['/((?!_next/static|_next/image|favicon.ico).*)']
};
