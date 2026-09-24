import type {ReactNode} from 'react';
import EnrichmentBar from './EnrichmentBar';

export default function LeadsLayout({children}:{children:ReactNode}){
  return <><EnrichmentBar/>{children}</>;
}
