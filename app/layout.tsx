import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workout Competition App",
  description: "A web app for managing workout competitions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
