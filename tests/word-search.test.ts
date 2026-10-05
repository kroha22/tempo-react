import test from "node:test";
import assert from "node:assert/strict";
import { extendSearchPath, searchPathText, type SearchBoard } from "../features/practice/word-search.ts";

const board: SearchBoard = {
  size: 4,
  cells: ["C", "A", "S", "A", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X", "X"],
  words: [],
  placements: {},
};

test("word search extends a straight path one clicked letter at a time", () => {
  let path: readonly number[] = [0];
  path = extendSearchPath(4, path, 1);
  path = extendSearchPath(4, path, 2);
  path = extendSearchPath(4, path, 3);
  assert.deepEqual(path, [0, 1, 2, 3]);
  assert.equal(searchPathText(board, path), "CASA");
});

test("word search accepts a direct endpoint and rejects a turn", () => {
  assert.deepEqual(extendSearchPath(4, [0], 3), [0, 1, 2, 3]);
  assert.deepEqual(extendSearchPath(4, [0, 1], 5), []);
});

test("word search lets a drag backtrack over its current path", () => {
  assert.deepEqual(extendSearchPath(4, [0, 1, 2, 3], 1), [0, 1]);
});
