'use client';
import "@/style/globals.css";
import '@/style/popup.css';
import '@/style/grid.css';
import '@/style/keyboard.css';
import '@/style/keys.css';
import Keyboard from "@/component/keyboard";
import LetterGrid from "@/component/letter-grid";
import { WordleProvider } from "@/component/wordle-provider";

export default function Home()
{
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <WordleProvider>
        <LetterGrid />
        <div style={ { height: '3rem' } } />
        <Keyboard />
      </WordleProvider>
    </div>
  );
}
