import type { Metadata } from "next";
import { Roboto_Flex } from "next/font/google";
import 'material-symbols';
import './globals.css';

const robotoFlex = Roboto_Flex({
  variable: "--font-roboto-flex",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Whatsaiup",
  description: "Conecta y chatea con tus inteligencias artificiales favoritas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${robotoFlex.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
