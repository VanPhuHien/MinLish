import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "MinLish",
  description: "Học tiếng Anh với MinLish",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
