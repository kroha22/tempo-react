import assert from "node:assert/strict";
import test from "node:test";

// Run against `npm run dev` or `npm start`: Cloudflare modules require Workers,
// so importing the worker bundle into a plain Node process is not a valid test.
const origin = process.env.TEMPO_TEST_URL ?? "http://localhost:3000";

for (const [path, expected] of [
  ["/", /Обучение/],
  ["/cards", /1000 глаголов/],
  ["/learning/practice", /Потренируем спряжение/],
  ["/ui", /Лаборатория интерфейса/],
]) {
  test(`renders Tempo at ${path}`, async () => {
    const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(30_000) });
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /text\/html/);
    const html = await response.text();
    assert.match(html, /<html[^>]*lang="ru"/);
    assert.match(html, /<title>Tempo/);
    assert.match(html, expected);
    assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton/);
    assert.doesNotMatch(html, /href="\/books(?:[/?"])/);
  });
}

test("unavailable area is not routed", async () => {
  const response = await fetch(new URL("/books", origin), { signal: AbortSignal.timeout(30_000) });
  assert.equal(response.status, 404);
});

test("progress API refuses anonymous reads and writes", async () => {
  for (const method of ["GET", "POST"]) {
    const response = await fetch(new URL("/api/progress", origin), { method, signal: AbortSignal.timeout(30_000) });
    assert.equal(response.status, 401);
  }
});
