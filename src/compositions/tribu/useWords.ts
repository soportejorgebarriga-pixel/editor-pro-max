import {useEffect, useState} from "react";
import {cancelRender, continueRender, delayRender, staticFile} from "remotion";

export type Word = {text: string; startMs: number; endMs: number};

export const useWords = (file: string): Word[] => {
  const [words, setWords] = useState<Word[]>([]);
  const [handle] = useState(() => delayRender(`Loading ${file}`));
  useEffect(() => {
    fetch(staticFile(file))
      .then((r) => r.json())
      .then((w: Word[]) => {
        setWords(w);
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [file, handle]);
  return words;
};
