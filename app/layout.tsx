import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOVA — Digital Experiences",
  description: "نحوّل أفكارك إلى تجارب رقمية استثنائية. تصميم وتطوير المواقع والمتاجر والحلول الرقمية.",
  applicationName: "NOVA Digital Agency",
  openGraph: {
    title: "NOVA — Digital Experiences",
    description: "تصميم وتطوير المواقع والمتاجر والحلول الرقمية.",
    type: "website",
    locale: "ar_EG"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
