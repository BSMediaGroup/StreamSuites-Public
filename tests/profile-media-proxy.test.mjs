import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../functions/profile-media/[[path]].js", import.meta.url), "utf8");
const { onRequest } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);

const IMAGE_URL = "https://streamsuites.app/profile-media/u/ABC1234/avatar/v2.webp";
const VIDEO_URL = "https://streamsuites.app/profile-media/u/ABC1234/about-video/0123456789abcdef0123456789abcdef.mp4";

async function withFetch(replacement, run) {
  const original = globalThis.fetch;
  globalThis.fetch = replacement;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
}

test("profile media proxy accepts only immutable canonical GET/HEAD paths", async () => {
  let calls = 0;
  await withFetch(async () => {
    calls += 1;
    return new Response();
  }, async () => {
    for (const [url, method, status] of [
      ["https://streamsuites.app/profile-media/u/ABC1234/avatar/latest.webp", "GET", 404],
      [`${IMAGE_URL}?v=2`, "GET", 404],
      ["https://streamsuites.app/profile-media/u/ABC1234/avatar/../../secret.webp", "GET", 404],
      [IMAGE_URL, "POST", 405],
    ]) {
      const response = await onRequest({ request: new Request(url, { method }), env: {} });
      assert.equal(response.status, status);
    }
  });
  assert.equal(calls, 0);
});

test("profile image proxy strips browser credentials/fingerprints and returns exact WebP bytes", async () => {
  const body = Uint8Array.from([82, 73, 70, 70, 1, 2, 3, 4, 87, 69, 66, 80]);
  await withFetch(async (url, init) => {
    assert.equal(url, "https://api.streamsuites.app/u/ABC1234/avatar/v2.webp");
    assert.equal(init.method, "GET");
    assert.equal(init.headers.get("Accept"), "image/webp");
    for (const name of ["Cookie", "Authorization", "Referer", "User-Agent", "Sec-Fetch-Dest"]) {
      assert.equal(init.headers.get(name), null, `${name} must not reach the media authority`);
    }
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(body.length),
        ETag: '"avatar-v2"',
      },
    });
  }, async () => {
    const request = new Request(IMAGE_URL, {
      headers: {
        Cookie: "session=private",
        Authorization: "Bearer private",
        Referer: "https://example.invalid/",
        "User-Agent": "Desktop Browser",
        "Sec-Fetch-Dest": "image",
      },
    });
    const response = await onRequest({ request, env: {} });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Content-Type"), "image/webp");
    assert.equal(response.headers.get("Cache-Control"), "public, max-age=31536000, immutable");
    assert.equal(response.headers.get("Cross-Origin-Resource-Policy"), "same-site");
    assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
    assert.deepEqual(new Uint8Array(await response.arrayBuffer()), body);
  });
});

test("profile video proxy preserves one bounded byte range and rejects challenge or MIME HTML", async () => {
  await withFetch(async (url, init) => {
    assert.equal(url, "https://api.streamsuites.app/u/ABC1234/about-video/0123456789abcdef0123456789abcdef.mp4");
    assert.equal(init.headers.get("Range"), "bytes=0-15");
    return new Response(Uint8Array.from([0, 0, 0, 12, 102, 116, 121, 112]), {
      status: 206,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Range": "bytes 0-7/64",
        "Accept-Ranges": "bytes",
      },
    });
  }, async () => {
    const response = await onRequest({ request: new Request(VIDEO_URL, { headers: { Range: "bytes=0-15" } }), env: {} });
    assert.equal(response.status, 206);
    assert.equal(response.headers.get("Content-Type"), "video/mp4");
    assert.equal(response.headers.get("Content-Range"), "bytes 0-7/64");
    assert.equal(response.headers.get("Accept-Ranges"), "bytes");
  });

  for (const upstream of [
    new Response("403 Forbidden cloudflare", { status: 403, headers: { "Content-Type": "text/html" } }),
    new Response("not an image", { status: 200, headers: { "Content-Type": "text/html" } }),
  ]) {
    await withFetch(async () => upstream, async () => {
      const response = await onRequest({ request: new Request(IMAGE_URL), env: {} });
      assert.equal(response.status, 502);
      assert.equal(await response.text(), "");
      assert.equal(response.headers.get("Cache-Control"), "no-store");
    });
  }
});
