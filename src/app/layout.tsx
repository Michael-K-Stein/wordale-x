import type { Metadata } from "next";
import "@/style/globals.css";
import '@/style/popup.css';
import '@/style/grid.css';
import '@/style/keyboard.css';
import '@/style/keys.css';

export const metadata: Metadata = {
    title: "וורדל'ה",
    description: "על ידי מיכאל, בהשראת עיתון הארץ",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>)
{
    return (
        <html lang="he" dir="rtl">
            { children }
        </html>
    );
}
