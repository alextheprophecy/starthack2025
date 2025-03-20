import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import FloatingNavbar from "./components/FloatingNavbar";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Virgin Initiatives",
  description: "Virgin group initiatives platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This will ensure server and client renders match without hydration errors
  // The actual hiding of navbar for /internal path will be handled in client components
  return (
    <html lang="en" className="force-gpu" style={{ backgroundColor: '#f9fafb', height: '100%', margin: 0, padding: 0 }}>
      <head>
        <style>{`
          html, body {
            background-color: #f9fafb !important;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            overscroll-behavior-y: none;
          }
          
          body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #f9fafb;
            z-index: -1;
          }
        `}</style>
      </head>
      <body className="font-sans antialiased bg-gray-50 min-h-screen overflow-x-hidden force-gpu" style={{ backgroundColor: '#f9fafb', margin: 0, padding: 0 }}>
        <AuthProvider>
          <FloatingNavbar />
          <main className="pt-24 w-full force-gpu" style={{ backgroundColor: '#f9fafb' }}>
            {children}
          </main>
        </AuthProvider>
        <Script id="fix-scroll-issues" strategy="beforeInteractive">
          {`
            // Prevent white/black space
            (function() {
              // Create background overlay
              function ensureBackgroundOverlay() {
                let overlay = document.getElementById('background-overlay');
                if (!overlay) {
                  overlay = document.createElement('div');
                  overlay.id = 'background-overlay';
                  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:#f9fafb;z-index:-9999;';
                  document.body.appendChild(overlay);
                }
              }
              
              // Apply immediately
              document.documentElement.style.backgroundColor = '#f9fafb';
              document.body.style.backgroundColor = '#f9fafb';
              
              // Set up event listeners
              window.addEventListener('DOMContentLoaded', function() {
                ensureBackgroundOverlay();
                
                // Fix all containers
                const containers = [
                  document.documentElement,
                  document.body,
                  document.querySelector('main'),
                  ...Array.from(document.querySelectorAll('.force-gpu'))
                ].filter(Boolean);
                
                containers.forEach(el => {
                  el.style.backgroundColor = '#f9fafb';
                });
              });
              
              // Handle scroll events, particularly bouncing
              window.addEventListener('scroll', function() {
                document.documentElement.style.backgroundColor = '#f9fafb';
                document.body.style.backgroundColor = '#f9fafb';
              }, { passive: true });
              
              // Handle viewport changes
              window.addEventListener('resize', ensureBackgroundOverlay);
              window.addEventListener('orientationchange', ensureBackgroundOverlay);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
