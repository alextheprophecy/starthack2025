import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import FloatingNavbar from "./components/FloatingNavbar";

export const metadata: Metadata = {
  title: "Virgin Initiatives",
  description: "Virgin group initiatives platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="font-sans antialiased bg-white">
        <AuthProvider>
          <FloatingNavbar />
          <main className="pt-16">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
