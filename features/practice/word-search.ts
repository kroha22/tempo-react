import type { VocabularyWord } from "../content/vocabulary-model.ts";
export type SearchWord = VocabularyWord & { letters: string };
export type SearchBoard = { size: number; cells: readonly string[]; words: readonly SearchWord[]; placements: Readonly<Record<string, readonly number[]>> };
export function searchWords(words: readonly VocabularyWord[]): SearchWord[] {
  const seen = new Set<string>();
  return words.flatMap(word => {
    const bare = word.label.replace(/^(a|o|as|os) /i, "").normalize("NFC");
    if (!/^[\p{L}-]+$/u.test(bare)) return [];
    const letters = bare.replace(/-/g, "").toUpperCase();
    if (letters.length < 3 || letters.length > 12 || seen.has(letters)) return [];
    seen.add(letters); return [{ ...word, letters }];
  });
}
export function searchPath(size: number, start: number, end: number): number[] {
  if (start < 0 || end < 0 || start >= size * size || end >= size * size) return [];
  const r1=Math.floor(start/size),c1=start%size,r2=Math.floor(end/size),c2=end%size;
  const dr=r2-r1,dc=c2-c1;
  if (dr && dc && Math.abs(dr)!==Math.abs(dc)) return [];
  return Array.from({length:Math.max(Math.abs(dr),Math.abs(dc))+1},(_,i)=>(r1+Math.sign(dr)*i)*size+c1+Math.sign(dc)*i);
}
export function findSearchWord(board: SearchBoard, path: readonly number[]): SearchWord | undefined {
  if (!path.length || JSON.stringify(searchPath(board.size,path[0],path[path.length-1]))!==JSON.stringify(path)) return undefined;
  const text=path.map(index=>board.cells[index]).join("");
  return board.words.find(word=>word.letters===text||word.letters===[...text].reverse().join(""));
}
export function searchPathText(board: SearchBoard, path: readonly number[]): string {
  return path.map(index => board.cells[index] ?? "").join("");
}
export function extendSearchPath(size: number, current: readonly number[], next: number): readonly number[] {
  if (!current.length) return searchPath(size, next, next);
  const existingIndex = current.indexOf(next);
  if (existingIndex >= 0) return current.slice(0, existingIndex + 1);
  const extended = searchPath(size, current[0], next);
  if (!extended.length || extended.length <= current.length) return [];
  return current.every((index, position) => extended[position] === index) ? extended : [];
}
export function makeSearchBoard(words: readonly SearchWord[], seed: number): SearchBoard {
  if (!words.length || words.length>10) throw new Error("Word search requires 1–10 words");
  let state=seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/2**32;};
  const size=Math.max(10,...words.map(word=>word.letters.length));
  const directions=[[0,1],[1,0],[1,1]];
  for(let attempt=0;attempt<30;attempt++){
    const cells=Array<string>(size*size).fill("");const placements:Record<string,number[]>={};
    for(const word of [...words].sort((a,b)=>b.letters.length-a.letters.length)){
      for(let trial=0;trial<300;trial++){
        const [dr,dc]=directions[Math.floor(random()*directions.length)],row=Math.floor(random()*size),col=Math.floor(random()*size);
        const endRow=row+dr*(word.letters.length-1),endCol=col+dc*(word.letters.length-1);
        if(endRow>=size||endCol>=size)continue;
        const path=searchPath(size,row*size+col,endRow*size+endCol);
        if(path.some((index,i)=>cells[index]&&cells[index]!==word.letters[i]))continue;
        path.forEach((index,i)=>{cells[index]=word.letters[i];});placements[word.id]=path;break;
      }
    }
    if(Object.keys(placements).length!==words.length)continue;
    return {size,words,placements,cells:cells.map(letter=>letter||"ABCDEFGHIJKLMNOPRSTUV"[Math.floor(random()*21)])};
  }
  // Guaranteed bounded fallback: one word per row; no hidden unplaced targets.
  const cells=Array<string>(size*size).fill("A");const placements:Record<string,number[]>={};
  words.forEach((word,row)=>{placements[word.id]=[...word.letters].map((letter,col)=>{cells[row*size+col]=letter;return row*size+col;});});
  return {size,cells,words,placements};
}
