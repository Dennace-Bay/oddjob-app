import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
  title: {
    default: "OddJob Crews Calgary | Junk Removal & Student Workers",
    template: "%s | OddJob Crews Calgary",
  },
  description:
    "Affordable junk removal, yard work, moving help, and more in Calgary. Local student workers — same-week booking available. Call (403) 992-2526.",
  keywords: [
    "junk removal Calgary",
    "cheap junk removal Calgary",
    "student workers Calgary",
    "yard work Calgary",
    "moving help Calgary",
    "affordable junk removal",
    "same day junk removal Calgary",
    "OddJob Crews",
  ],
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: "OddJob Crews",
    title: "OddJob Crews Calgary | Junk Removal & Student Workers",
    description:
      "Affordable junk removal, yard work, moving help, and more in Calgary. Same-week booking available.",
  },
  robots: { index: true, follow: true },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "OddJob Crews",
  description:
    "Affordable student workers for junk removal, yard work, moving help, and more in Calgary, AB.",
  telephone: "+14039922526",
  email: "info@oddjobcrews.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Calgary",
    addressRegion: "AB",
    addressCountry: "CA",
  },
  areaServed: { "@type": "City", name: "Calgary" },
  priceRange: "$$",
  openingHours: "Mo-Su 07:00-21:00",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: "light" }}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
