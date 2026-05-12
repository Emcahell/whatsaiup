import type { Metadata } from "next";
import { Roboto_Flex } from "next/font/google";
import 'material-symbols';
import './globals.css';
import Providers from '../context/Providers';

const robotoFlex = Roboto_Flex({
  variable: "--font-roboto-flex",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Whatsaiup",
  description: "Conecta y chatea con tus inteligencias artificiales favoritas",
  other: {
    "google": "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${robotoFlex.variable} h-full antialiased notranslate`}
      translate="no"
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}