import type { VocabularySet, VocabularyWord } from "../content/vocabulary-model.ts";
export type PairWord = VocabularyWord;
export type PairBlock = VocabularySet & { group?: string };
export type PairBoard = { left: readonly (string | null)[]; right: readonly (string | null)[]; queue: readonly string[]; completed: number };

export function shufflePairWords<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
export function makePairBoard(order: readonly string[]): PairBoard {
  const first = order.slice(0, 7);
  return { left: first, right: [...first.slice(3), ...first.slice(0, 3)], queue: order.slice(7), completed: 0 };
}
export function matchPair(board: PairBoard, left: string, right: string, positionSample = 0): PairBoard {
  if (left !== right || !board.left.includes(left) || !board.right.includes(right)) return board;
  const next = board.queue[0] ?? null;
  const updatedRight = board.right.map(id => id === right ? next : id);
  if (next && board.right.length > 1) {
    const oldIndex = board.right.indexOf(right);
    const positions = board.right.map((_, index) => index).filter(index => index !== oldIndex);
    const insertion = positions[Math.min(positions.length - 1, Math.max(0, Math.floor(positionSample * positions.length)))];
    updatedRight.splice(oldIndex, 1);
    updatedRight.splice(insertion, 0, next);
  }
  return { left: board.left.map(id => id === left ? next : id), right: updatedRight, queue: board.queue.slice(1), completed: board.completed + 1 };
}
