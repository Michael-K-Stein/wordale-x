import "@/style/globals.css";
import '@/style/keyboard.css';
import Key, { Backspace, Enter } from "@/component/key";
import { useWordle } from "@/component/wordle-provider";

export default function Keyboard()
{
    const { enterGuessClickCallback, removeLetterFromGuess } = useWordle();

    return (
        <div id="keyboard">

            <div className="letter-row">
                <Backspace onClick={ removeLetterFromGuess } />
                <Key letter={ 'פ' } />
                <Key letter={ 'ו' } />
                <Key letter={ 'ט' } />
                <Key letter={ 'א' } />
                <Key letter={ 'ר' } />
                <Key letter={ 'ק' } />
            </div>

            <div className="letter-row">
                <div style={ { width: '3rem', margin: '0.3rem' } } />
                <Key letter={ 'ל' } />
                <Key letter={ 'ח' } />
                <Key letter={ 'י' } />
                <Key letter={ 'ע' } />
                <Key letter={ 'כ' } />
                <Key letter={ 'ג' } />
                <Key letter={ 'ד' } />
                <Key letter={ 'ש' } />
            </div>

            <div className="letter-row">
                <Enter onClick={ enterGuessClickCallback } />
                <Key letter={ 'ת' } />
                <Key letter={ 'צ' } />
                <Key letter={ 'מ' } />
                <Key letter={ 'נ' } />
                <Key letter={ 'ה' } />
                <Key letter={ 'ב' } />
                <Key letter={ 'ס' } />
                <Key letter={ 'ז' } />
            </div>

        </div>
    );
}