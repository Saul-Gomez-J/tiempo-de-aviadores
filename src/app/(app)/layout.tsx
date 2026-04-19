import type { Metadata } from "next";
import { Geist, Geist_Mono, Black_Ops_One } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const stencil = Black_Ops_One({
  variable: "--font-stencil",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tiempo de Aviadores",
  description: "Blog de aviacion - Historias, tecnica y pasion por volar",
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${stencil.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
