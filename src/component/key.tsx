import Settings from '@/app/settings';
import { useWordle } from '@/component/wordle-provider';
import '@/style/keys.css';
type KeyExtraProps = Exclude<React.HTMLAttributes<HTMLDivElement>, { 'className': '', 'id': ''; }>;

function SpecialKey({ svgSymbol, id, ...props }: { svgSymbol: React.ReactNode, id: string; } & KeyExtraProps)
{
    return (
        <div id={ `key-${id}` } className='key special-key' { ...props }>
            { svgSymbol }
        </div>
    );
}

export function Backspace({ ...props }: KeyExtraProps)
{
    const { liveGuess, gameOver } = useWordle();
    const keyIsDisabled = (liveGuess.length <= 0) || gameOver;

    return (
        <SpecialKey svgSymbol={
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                className='max-h-[3rem] h-[3rem]'
            >
                <path
                    fill="none"
                    stroke="#000"
                    strokeWidth="1.5"
                    d="M12 8h16v16H12l-8-8zm2.464 11.536 7.072-7.072m-7.072 0 7.072 7.072"
                ></path>
            </svg> }
            id='backspace'
            data-letter-is-burned={ keyIsDisabled }
            aria-disabled={ keyIsDisabled }
            { ...props }
        />
    );
}

export function Enter({ ...props }: KeyExtraProps)
{
    const { liveGuess, gameOver } = useWordle();
    const keyIsDisabled = (liveGuess.length !== Settings.WORD_LENGTH) || gameOver;

    return (
        <SpecialKey svgSymbol={
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className='max-h-[3rem] h-[3rem]'
                viewBox="0 0 32 32"
            >
                <path
                    fill="none"
                    stroke="#000"
                    strokeWidth="1.5"
                    d="M15 6v6H6v14h20V6z"
                ></path>
                <path fill="none" stroke="#000" strokeWidth="1.5" d="M11.571 19H20v-6"></path>
                <path
                    fill="none"
                    stroke="#000"
                    strokeWidth="1.5"
                    d="m14.25 22.5-3.5-3.5 3.5-3.5"
                ></path>
            </svg> }
            id='enter'
            data-letter-is-burned={ keyIsDisabled }
            aria-disabled={ keyIsDisabled }
            { ...props }
        />
    );
}

export default function Key({ letter }: { letter: string; })
{
    const { appendLetterToGuess, lettersBurned, gameOver } = useWordle();

    const letterIsBurned = lettersBurned.includes(letter);

    return (
        <div
            id={ `key-${letter}` }
            className="key"
            onClick={ (gameOver) ? () => { } : () => appendLetterToGuess(letter) }
            data-letter-is-burned={ letterIsBurned || gameOver }
            aria-disabled={ gameOver }
        >
            <div>
                { letter }
            </div>
        </div>
    );
}