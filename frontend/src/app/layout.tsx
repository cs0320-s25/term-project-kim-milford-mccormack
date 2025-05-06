import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./components/globals.css";
import ThemeProviderWrapper from "./components/ThemeProviderWrapper";

const inter = Inter({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Lo-Fi",
    description: "Study Places Finder",
};

export default function RootLayout({children,}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={`${inter.variable} antialiased`}>
        <ThemeProviderWrapper>
            {children}
        </ThemeProviderWrapper>
        </body>
        </html>
    );
}
