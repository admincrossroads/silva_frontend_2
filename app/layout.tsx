import type { Metadata } from "next";
import { QueryProvider } from "@/lib/query-provider";
import { SiteChrome } from "@/components/marketing/site-chrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coffee Field OS",
  description:
    "Multi-tenant coffee estate field operations — asset owners govern, program managers operate, vendors execute",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('cfos-theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})();`,
          }}
        />
        {/* Browser-loaded fonts — avoids next/font/google blocking compile when Google is unreachable */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <QueryProvider>
          {children}
          <SiteChrome />
        </QueryProvider>
      </body>
    </html>
  );
}
