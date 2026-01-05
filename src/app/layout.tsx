import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/providers/Web3Provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgentPay - Autonomous AI Payments with MNEE",
  description: "Enable AI agents to transact autonomously using MNEE stablecoin. Built for the MNEE Hackathon: Programmable Money for Agents, Commerce, and Automated Finance.",
  keywords: ["AI agents", "MNEE", "stablecoin", "Ethereum", "payments", "autonomous", "web3"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#030712] text-gray-100 min-h-screen flex flex-col`}
      >
        <Web3Provider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Web3Provider>
      </body>
    </html>
  );
}
