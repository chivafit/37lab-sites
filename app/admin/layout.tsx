import {ReactNode} from 'react';
import AdminGate from './AdminGate';
import './admin-editor-fix.css';

export default function AdminLayout({children}:{children:ReactNode}){
  return <AdminGate>{children}</AdminGate>;
}
