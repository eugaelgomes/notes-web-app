import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProviderClient from "./contexts/AuthProviderClient";
import { NotesProvider } from "./contexts/NotesContext";
import Layout from "./components/layout/Layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodaWeb Notes",
  description: "Organize suas ideias e notas de forma simples e eficiente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProviderClient>
          <NotesProvider>
            <Layout>
              {children}
            </Layout>
          </NotesProvider>
        </AuthProviderClient>
      </body>
    </html>
  );
}
