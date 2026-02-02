import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "IdeaSense AI",
    description: "Chat Interface",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="h-full" suppressHydrationWarning>
            <body
                className="min-h-screen"
                style={{
                    backgroundImage: "url('/bg1_greenblue.png')",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "center top",
                }}
                suppressHydrationWarning
            >
                {children}
            </body>
        </html>
    );
}
