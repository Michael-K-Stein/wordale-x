'use client';

import Header from "@/component/header";
import { PopupProvider } from "@/component/popup-provider";
import "@/style/globals.css";
import '@/style/grid.css';
import '@/style/keyboard.css';
import '@/style/keys.css';
import '@/style/popup.css';
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { SnackbarProvider } from "notistack";


const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
    typography: {
        fontFamily: [
            'Assistant',
        ].join(','),
    },
});
export default function ClientRootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>)
{
    return (
        <body>
            <Header />
            <SnackbarProvider
                anchorOrigin={ {
                    vertical: 'bottom',
                    horizontal: 'right',
                } }>
                <ThemeProvider theme={ darkTheme }>
                    <CssBaseline />
                    <PopupProvider>
                        { children }
                    </PopupProvider>
                </ThemeProvider>
            </SnackbarProvider>
        </body>
    );
}
