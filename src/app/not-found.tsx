import Header from '@/component/header';
import Link from 'next/link';

export default function NotFound()
{
    return (
        <body dir='rtl' className='w-full h-full flex flex-row content-center justify-center items-center'>
            <div className='w-full h-full flex flex-row content-center justify-center items-center pt-10'>
                <Header />
                <div className='flex flex-col content-center justify-center items-center text-5xl' style={ { fontWeight: 600 } }>
                    <h1>העמוד לא קיים</h1>
                    <Link href="/" className='text-3xl'>חזרה לעמוד הבית</Link>
                </div>
            </div>
        </body>
    );
}
