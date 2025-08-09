import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "ChatGPT Clone",
  description: "A modern mobile ChatGPT clone",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0f0f0f" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
