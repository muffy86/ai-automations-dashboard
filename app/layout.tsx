import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Automations Dashboard',
  description: 'Daily briefings, slide generator, crypto tracker',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
