import type { Metadata, Viewport } from "next";
import { Fredoka, Noto_Sans_Bengali, Nunito } from "next/font/google";
import { InstallApp } from "@/components/InstallApp";
import "./globals.css";

// One weight each keeps font memory/download much smaller
const display = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

const body = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

const bangla = Noto_Sans_Bengali({
  variable: "--font-bangla",
  subsets: ["bengali"],
  weight: "700",
  display: "swap",
});

const APP_NAME = "Quiz Time";
const APP_DESCRIPTION =
  "Colorful timed school quizzes for Math, English, and Bangla.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#ff7a59",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${bangla.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <InstallApp />
      </body>
    </html>
  );
}
