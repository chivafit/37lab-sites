import './globals.css';
import './mobile-refinements.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '37LAB Sites', robots: { index: false, follow: false } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}