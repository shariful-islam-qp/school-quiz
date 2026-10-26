import type { Metadata } from "next";
import { Fraunces, Noto_Sans_Bengali, Nunito } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
});

const bangla = Noto_Sans_Bengali({
  variable: "--font-bangla",
  subsets: ["bengali"],
  weight: ["400", "700", "800"],
});

export const metadata: Metadata = {
  title: "School Quiz",
  description:
    "Timed school quizzes for Math, English, and Bangla.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${bangla.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
