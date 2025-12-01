import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Byggarportalen – Projektportal för mindre byggföretag",
  description:
    "Byggarportalen samlar tidsplan, projektinfo och chatt för mindre hantverks- och byggföretag i Sverige.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <head>
        <script
          defer
          data-domain="byggarportalen.se"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
