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
  assert.match(source, /AUTH_PUBLIC_PROGRESSION_ME_URL = `\$\{AUTH_API_BASE\}\/api\/public\/progression\/me`/);
  assert.match(source, /submitPublicAuthorityRequest/);
  assert.match(source, /fetchMyPublicAuthorityRequests/);
  assert.match(source, /fetchMyPublicProgression/);
  assert.match(source, /summary\.xp_total \?\? summary\.total_xp/);
  assert.match(source, /event\?\.source_domain/);
  assert.match(source, /buildAuthorityRequestPanel/);
  assert.match(source, /resolveProfileAuthorityContext/);
  assert.match(source, /renderCommunityMyData/);
  assert.match(source, /Public progression/);
  assert.match(source, /Recent XP events/);
  assert.match(source, /Pending review/);
  assert.match(source, /openAuthModal:\s*ctx\.openAuthModal/);
});

test("public leaderboards route hydrates from authoritative progression API", () => {
  const app = read("js/public-pages-app.js");
  const css = read("css/public-shell.css");
  assert.match(app, /AUTH_PUBLIC_PROGRESSION_LEADERBOARD_URL = `\$\{AUTH_API_BASE\}\/api\/public\/progression\/leaderboard`/);
  assert.match(app, /fetchPublicProgressionLeaderboard/);
  assert.match(app, /renderLeaderboards/);
  assert.doesNotMatch(app, /renderLeaderboardsPlaceholder/);
  assert.match(app, /Global public progression ranked from authoritative XP totals/);
  assert.match(app, /entry\?\.xp_total \?\? entry\?\.total_xp/);
  assert.match(css, /\.progression-leaderboard-row/);
});

test("public profile game section renders runtime progression without inventing economy data", () => {
  const app = read("js/public-pages-app.js");
  const profileSection = app.match(/function buildProfileGameCompetitionSection\(profile = null\) \{[\s\S]*?return details;\n  \}/)?.[0] || "";
  assert.ok(profileSection, "profile progression section should exist");
  assert.match(app, /payload\?\.progression && typeof payload\.progression === "object"/);
  assert.match(profileSection, /progression\.xp_total \?\? progression\.total_xp/);
  assert.match(profileSection, /XP and rank hydrate from the runtime public progression authority/);
  assert.match(profileSection, /Economy, inventory, and seasonal standings remain deferred/);
  assert.match(app, /buildProfileGameCompetitionSection\(profile\)/);
});
