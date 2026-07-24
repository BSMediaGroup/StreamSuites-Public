import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const source = read("js/studioapp-extensions.js");
const directory = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);

const baseEntry = Object.freeze({
  id: "test.first",
  slug: "test-first",
  name: "Synthetic Test Dock",
  summary: "Synthetic test-only catalog record.",
  publisher_name: "Test Publisher",
  publisher_type: "first-party",
  extension_type: "dock",
  latest_version: "1.0.0-test",
  minimum_studioapp_version: "0.1.0-test",
  maximum_studioapp_version: null,
  verification_status: "verified",
  first_party: true,
  icon_path: "/assets/icons/packboxicon-plugin.webp",
  documentation_url: "https://docs.streamsuites.app/test-only",
  source_url: null,
  published_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-03-01T00:00:00Z",
  tags: ["synthetic", "dock"],
  supported_platforms: ["windows-x64"],
  availability_status: "planned",
});

const fixtureEntries = [
  baseEntry,
  {
    ...baseEntry,
    id: "test.second",
    slug: "test-second",
    name: "Community Test Tool",
    summary: "A second synthetic search fixture.",
    publisher_name: "Community Fixture",
    publisher_type: "community",
    extension_type: "tool",
    minimum_studioapp_version: null,
    verification_status: "pending",
    first_party: false,
    documentation_url: null,
    source_url: "https://example.com/source",
    published_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-02-01T00:00:00Z",
    tags: ["synthetic", "utility"],
  },
  {
    ...baseEntry,
    id: "test.third",
    slug: "test-third",
    name: "Unverified Audio Fixture",
    summary: "A third synthetic record for combined filters.",
    publisher_name: "Community Fixture",
    publisher_type: "community",
    extension_type: "dock",
    verification_status: "unverified",
    first_party: false,
    published_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    tags: ["audio", "synthetic"],
  },
];

function catalog(entries = fixtureEntries) {
  return {
    schema_version: 1,
    catalog_id: "studioapp-extensions",
    authoritative: false,
    authority: "StreamSuites Runtime/Auth or an authoritative generated export",
    generated_at: null,
    entries,
  };
}

const emptyQuery = Object.freeze({ q: "", type: "", publisher: "", compatibility: "", verification: "", sort: "name" });

test("production catalog is versioned, explicitly non-authoritative, and empty", () => {
  const production = JSON.parse(read("data/studioapp-extension-catalog.v1.json"));
  const validated = directory.validateCatalog(production);
  assert.equal(validated.schema_version, 1);
  assert.equal(validated.authoritative, false);
  assert.deepEqual(validated.entries, []);
  assert.match(production.authority, /Runtime\/Auth/);
});

test("strict catalog contract accepts bounded synthetic fixtures and rejects unsafe shapes", () => {
  const validated = directory.validateCatalog(catalog());
  assert.equal(validated.entries.length, 3);
  assert.equal(validated.entries[0].name, "Synthetic Test Dock");
  assert.equal(validated.entries[0].icon_path, "/assets/icons/packboxicon-plugin.webp");

  assert.throws(() => directory.validateCatalog(catalog([{ ...baseEntry, download_url: "https://example.com/file.exe" }])), /entry_shape_invalid/);
  assert.throws(() => directory.validateCatalog(catalog([{ ...baseEntry, documentation_url: "javascript:alert(1)" }])), /documentation_url_invalid/);
  assert.throws(() => directory.validateCatalog(catalog([{ ...baseEntry, icon_path: "/assets/../secret.svg" }])), /icon_path_invalid/);
  assert.throws(() => directory.validateCatalog(catalog([{ ...baseEntry, name: "x".repeat(101) }])), /name_invalid/);
  assert.throws(() => directory.validateCatalog(catalog([{ ...baseEntry, tags: Array.from({ length: 13 }, (_, index) => `tag${index}`) }])), /tags_invalid/);
  assert.throws(() => directory.validateCatalog({ ...catalog(), authoritative: true }), /catalog_authority_invalid/);
  assert.throws(() => directory.validateCatalog(catalog([baseEntry, { ...baseEntry, slug: "other" }])), /entry_identity_duplicate/);
});

test("Extensions page and catalog fixture keep the dedicated plugin-store artwork", () => {
  const html = read("downloads/studioapp/extensions/index.html");
  const production = JSON.parse(read("data/studioapp-extension-catalog.v1.json"));
  assert.match(html, /\/assets\/icons\/packboxicon-plugin\.webp/);
  assert.match(html, /alt=\"StreamSuites Plugin Store\"/);
  assert.doesNotMatch(html, /\/assets\/logos\/studiologo3\.webp\"[^>]*alt=\"StreamSuites Plugin Store\"/);
  assert.match(production.authority, /Runtime\/Auth/);
  assert.equal(production.authoritative, false);
  assert.equal(production.entries.length, 0);
});

test("catalog text is preserved as text and the renderer never uses raw HTML", () => {
  const unsafeText = "<img src=x onerror=alert(1)>";
  const validated = directory.validateCatalog(catalog([{ ...baseEntry, summary: unsafeText }]));
  assert.equal(validated.entries[0].summary, unsafeText);
  assert.match(source, /\.textContent\s*=/);
  assert.doesNotMatch(source, /\.innerHTML\s*=/);
});

test("search, individual filters, combined filters, and sorting operate on safe fields", () => {
  const entries = directory.validateCatalog(catalog()).entries;
  assert.deepEqual(directory.filterAndSortCatalog(entries, { ...emptyQuery, q: "audio" }).map((entry) => entry.id), ["test.third"]);
  assert.deepEqual(directory.filterAndSortCatalog(entries, { ...emptyQuery, q: "community fixture" }).map((entry) => entry.id), ["test.second", "test.third"]);
  assert.deepEqual(directory.filterAndSortCatalog(entries, { ...emptyQuery, type: "dock" }).map((entry) => entry.id), ["test.first", "test.third"]);
  assert.deepEqual(directory.filterAndSortCatalog(entries, { ...emptyQuery, publisher: "first-party" }).map((entry) => entry.id), ["test.first"]);
  assert.deepEqual(directory.filterAndSortCatalog(entries, { ...emptyQuery, compatibility: "unreported" }).map((entry) => entry.id), ["test.second"]);
  assert.deepEqual(directory.filterAndSortCatalog(entries, { ...emptyQuery, verification: "pending" }).map((entry) => entry.id), ["test.second"]);
  assert.deepEqual(directory.filterAndSortCatalog(entries, { ...emptyQuery, publisher: "community", type: "dock", verification: "unverified" }).map((entry) => entry.id), ["test.third"]);
  assert.deepEqual(directory.filterAndSortCatalog(entries, { ...emptyQuery, sort: "updated" }).map((entry) => entry.id), ["test.first", "test.second", "test.third"]);
  assert.deepEqual(directory.filterAndSortCatalog(entries, { ...emptyQuery, sort: "published" }).map((entry) => entry.id), ["test.third", "test.second", "test.first"]);
});

test("query parameters restore bounded state and clear to an empty query", () => {
  const parsed = directory.parseCatalogQuery("?q=audio&type=dock&publisher=community&compatibility=declared&verification=unverified&sort=updated");
  assert.deepEqual(parsed, { q: "audio", type: "dock", publisher: "community", compatibility: "declared", verification: "unverified", sort: "updated" });
  assert.equal(directory.serializeCatalogQuery(parsed), "q=audio&type=dock&publisher=community&compatibility=declared&verification=unverified&sort=updated");
  assert.equal(directory.serializeCatalogQuery(emptyQuery), "");
  assert.deepEqual(directory.parseCatalogQuery("?publisher=unsafe&verification=trusted&sort=random"), emptyQuery);
});

test("Extensions page exposes labelled controls, states, route aliases, and no production records", () => {
  const html = read("downloads/studioapp/extensions/index.html");
  const redirects = read("_redirects");
  for (const id of ["extensions-search", "extensions-type", "extensions-publisher", "extensions-compatibility", "extensions-verification", "extensions-sort"]) {
    assert.match(html, new RegExp(`<label for="${id}"`));
  }
  assert.match(html, /role="status" aria-live="polite"/);
  assert.match(html, /extensions-empty/);
  assert.match(html, /extensions-no-results/);
  assert.match(html, /extensions-unavailable/);
  assert.match(html, /extensions-error/);
  assert.match(html, /StudioApp remains functional without them/i);
  assert.doesNotMatch(html, /data-extension-id|extension-card[^-]/i);
  assert.match(redirects, /\/downloads\/studioapp\/extensions \/downloads\/studioapp\/extensions\/index\.html 200/);
});
