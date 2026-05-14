import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
    title: "Buddy — Social feed",
    description: "Share posts, comments, and reactions with your circle.",
    icons: { icon: "/assets/images/logo-copy.svg" },
};
export default function RootLayout({ children, }: Readonly<{
    children: React.ReactNode;
}>) {
    return (<html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>);
}
