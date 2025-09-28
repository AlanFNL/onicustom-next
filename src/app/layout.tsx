import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Onicaps - Diseños Personalizados para tu Setup | Mousepads y Keycaps",
  description: "Creá diseños únicos para tu setup gaming. Mousepads y keycaps personalizados de alta calidad. Diseños exclusivos para tu teclado y mousepad.",
  keywords: "mousepad personalizado, keycaps personalizados, setup gaming, diseño personalizado, onicaps, gaming argentina, periféricos gaming",
  authors: [{ name: "Onicaps" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    title: "Onicaps - Diseños Personalizados para tu Setup",
    description: "Creá diseños únicos para tu setup gaming. Mousepads y keycaps personalizados de alta calidad.",
    locale: "es_AR",
    siteName: "Onicaps",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Onicaps - Diseños Personalizados",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Onicaps - Diseños Personalizados para tu Setup",
    description: "Creá diseños únicos para tu setup gaming. Mousepads y keycaps personalizados de alta calidad.",
    images: ["/og-image.jpg"],
  },
  themeColor: "#7a4dff",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  other: {
    "msapplication-TileColor": "#7a4dff",
    "application-name": "Onicaps",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <head>
        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Onicaps",
              "url": "https://onicaps.online",
              "logo": "https://onicaps.online/logo.png",
              "sameAs": [
                "https://instagram.com/oni.caps",
                "https://tiktok.com/@oni.caps"
              ]
            })
          }}
        />
      </head>
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
