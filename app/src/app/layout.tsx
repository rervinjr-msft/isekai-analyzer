import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Isekai Analyzer - Story Beat Flow Graph",
  description: "Analyze isekai anime story beats and visualize how different isekai beginnings diverge and converge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
