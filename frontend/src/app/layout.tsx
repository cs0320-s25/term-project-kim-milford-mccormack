"use client";

import React, { useRef, useEffect } from "react";
import "./components/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import ThemeProviderWrapper from "./components/ThemeProviderWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1️⃣ grab a ref to the main content
  const mainRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    // 2️⃣ when route changes, move focus into <main>
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, [pathname]);

  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {/* Skip-to-main link — hidden until focused */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          <ThemeProviderWrapper>
            {/* Make main programmatically focusable with tabIndex */}
            <main
              id="main-content"
              ref={mainRef}
              tabIndex={1}
              role="region"
              aria-label="Main content"
            >
              {children}
            </main>
          </ThemeProviderWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
