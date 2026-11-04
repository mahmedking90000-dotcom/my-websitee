import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/theme-provider";
import AmbientControl from "@/components/ambient-control";
import InteractionSounds from "@/components/interaction-sounds";

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
      <body>
        <ThemeProvider>
          <div className="nova-ambient-layer" aria-hidden="true">
            <span className="nova-ambient-orb nova-ambient-orb-one" />
            <span className="nova-ambient-orb nova-ambient-orb-two" />
            <span className="nova-ambient-grain" />
          </div>
          <div className="nova-app-content">{children}</div>
          <AmbientControl />
          <InteractionSounds />
        </ThemeProvider>
      </body>
    </html>
  );
}
