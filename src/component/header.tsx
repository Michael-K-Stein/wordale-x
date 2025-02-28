import '@/style/globals.css';
import { Box, Typography } from "@mui/material";
import Image from "next/image";

export default function Header()
{
    return (
        <div className="absolute w-full flex flex-col items-start content-center justify-center p-4 top-0 right-0">
            <div className="relative flex flex-row items-end justify-start top-0">
                <Image src={ '/wordale.png' } alt='' width={ 128 } height={ 128 } />
                <Box sx={ { width: '0.5rem' } } />
                <div className='flex flex-col items-start justify-start'>
                    <Typography variant="h1" fontFamily={ 'Assistant' } fontWeight={ 800 }>וורדל&apos;ה</Typography>
                    <Typography variant="h4" fontFamily={ 'Assistant' } fontWeight={ 300 }>ניחשתם את המילה?</Typography>
                </div>
            </div>
        </div>
    );
}