import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

test("public data hub consumes runtime public authority exports", () => {
  const source = read("js/public-data-hub.js");
  assert.match(source, /publicAuthorityIdentities:\s*\["\/shared\/state\/public_identities\.json", "\/runtime\/exports\/public_identities\.json"\]/);
  assert.match(source, /publicAuthorityArtifacts:\s*\["\/shared\/state\/public_artifacts\.json", "\/runtime\/exports\/public_artifacts\.json"\]/);
  assert.match(source, /buildPublicAuthorityIdentityMap/);
  assert.match(source, /authority:\s*\{/);
});

test("public app wires authority request submission and my-data history to the real endpoints", () => {
  const source = read("js/public-pages-app.js");
  assert.match(source, /AUTH_PUBLIC_AUTHORITY_REQUESTS_URL = `\$\{AUTH_API_BASE\}\/api\/public\/authority\/requests`/);
  assert.match(source, /AUTH_PUBLIC_AUTHORITY_REQUESTS_MINE_URL = `\$\{AUTH_API_BASE\}\/api\/public\/authority\/requests\/mine`/);
  assert.match(source, /submitPublicAuthorityRequest/);
  assert.match(source, /fetchMyPublicAuthorityRequests/);
  assert.match(source, /buildAuthorityRequestPanel/);
  assert.match(source, /resolveProfileAuthorityContext/);
  assert.match(source, /renderCommunityMyData/);
  assert.match(source, /Pending review/);
  assert.match(source, /openAuthModal:\s*ctx\.openAuthModal/);
});
