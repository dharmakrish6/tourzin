import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { SITE } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Tourzin — Tourist Vehicle Marketplace in Tamil Nadu", template: "%s | Tourzin" },
  description:
    "Find and compare Tempo Travellers, Urbanias, tourist coaches and tourist buses across Tamil Nadu. Contact operators directly by call or WhatsApp.",
  icons: { icon: "/favicon.png", apple: "/apple-touch-icon.png" },
  openGraph: { siteName: "Tourzin", type: "website", locale: "en_IN" },
};

export const viewport: Viewport = { themeColor: "#0B2744", width: "device-width", initialScale: 1 };

const GA = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        {GA && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
