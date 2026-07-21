import test from "node:test";
import assert from "node:assert/strict";

process.env.CLIENT_ORIGINS = "http://localhost:5173";
process.env.ADMIN_PASSWORD = "integration-test-password";
process.env.ADMIN_JWT_SECRET = "integration-test-secret-that-is-long-enough";

const { default: app } = await import("../app.js");

async function withServer(run) {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test("health endpoint responds and unknown routes return JSON 404", async () => {
  await withServer(async (baseUrl) => {
    const health = await fetch(`${baseUrl}/api/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: "ok" });

    const missing = await fetch(`${baseUrl}/api/not-real`);
    assert.equal(missing.status, 404);
    assert.match((await missing.json()).message, /not found/i);
  });
});

test("admin sessions are server-issued and write routes reject anonymous users", async () => {
  await withServer(async (baseUrl) => {
    const badLogin = await fetch(`${baseUrl}/api/admin/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "wrong" }),
    });
    assert.equal(badLogin.status, 401);

    const login = await fetch(`${baseUrl}/api/admin/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "integration-test-password" }),
    });
    assert.equal(login.status, 200);
    assert.ok((await login.json()).token);

    const anonymousWrite = await fetch(`${baseUrl}/api/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team: "Anonymous Team" }),
    });
    assert.equal(anonymousWrite.status, 401);
  });
});
