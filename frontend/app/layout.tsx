import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { VideoChatProvider } from "@/context/VideoChatStore";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VideoChat",
  description: "Chat with YouTube videos — timestamped answers, instant seeks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <VideoChatProvider>{children}</VideoChatProvider>
      </body>
    </html>
  );
}
