import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from '@/components/AuthProvider';
import { Toaster } from 'react-hot-toast';
import FirebaseErrorBoundary from '@/components/FirebaseErrorBoundary';
import FirebaseInitializer from '@/components/FirebaseInitializer';
import Navbar from '@/components/Navbar';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "VoxAI - Assistant Vocal Intelligent",
  description: "Assistant vocal alimenté par l'IA pour vos appels",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <FirebaseErrorBoundary>
          <AuthProvider>
            <FirebaseInitializer />
            <Navbar />
            <main>
              {children}
            </main>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                },
              }}
            />
          </AuthProvider>
        </FirebaseErrorBoundary>
      </body>
    </html>
  );
}
