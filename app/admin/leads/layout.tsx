import type {ReactNode} from 'react';
import EnrichmentBar from './EnrichmentBar';
import ReviewDrawer from './ReviewDrawer';
export default function LeadsLayout({children}:{children:ReactNode}){return <><EnrichmentBar/><ReviewDrawer/>{children}</>}
