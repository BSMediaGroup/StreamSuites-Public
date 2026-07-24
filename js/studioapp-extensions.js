const CATALOG_URL = "/data/studioapp-extension-catalog.v1.json";
const CATALOG_SCHEMA_VERSION = 1;
const MAX_CATALOG_ENTRIES = 250;
const MAX_TAGS = 12;
const ALLOWED_CATALOG_KEYS = Object.freeze([
  "schema_version",
  "catalog_id",
  "authoritative",
  "authority",
  "generated_at",
  "entries",
]);
const ALLOWED_ENTRY_KEYS = Object.freeze([
  "id",
  "slug",
  "name",
  "summary",
  "publisher_name",
  "publisher_type",
  "extension_type",
  "latest_version",
  "minimum_studioapp_version",
  "maximum_studioapp_version",
  "verification_status",
  "first_party",
  "icon_path",
  "documentation_url",
  "source_url",
  "published_at",
  "updated_at",
  "tags",
  "supported_platforms",
  "availability_status",
]);
const ALLOWED_QUERY_VALUES = Object.freeze({
  publisher: new Set(["", "first-party", "community"]),
  compatibility: new Set(["", "declared", "unreported"]),
  verification: new Set(["", "verified", "pending", "unverified"]),
  sort: new Set(["name", "updated", "published"]),
});
const VERIFICATION_VALUES = new Set(["verified", "pending", "unverified"]);
const PUBLISHER_VALUES = new Set(["first-party", "community"]);
const AVAILABILITY_VALUES = new Set(["planned", "available", "unavailable"]);
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function hasOnlyKeys(value, allowed) {
  const allowlist = new Set(allowed);
  return Object.keys(value).every((key) => allowlist.has(key));
}

function boundedString(value, name, maximum, { nullable = false, pattern = null } = {}) {
  if (nullable && value === null) return null;
  if (typeof value !== "string") throw new Error(`${name}_invalid`);
  const normalized = value.trim();
  if (!normalized || normalized.length > maximum || (pattern && !pattern.test(normalized))) throw new Error(`${name}_invalid`);
  return normalized;
}

function boundedNullableDate(value, name) {
  if (value === null) return null;
  const text = boundedString(value, name, 40);
  if (Number.isNaN(Date.parse(text))) throw new Error(`${name}_invalid`);
  return text;
}

function safeHttpsUrl(value, name) {
  if (value === null) return null;
  const text = boundedString(value, name, 2048);
  let parsed;
  try {
    parsed = new URL(text);
  } catch {
    throw new Error(`${name}_invalid`);
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) throw new Error(`${name}_invalid`);
  return parsed.toString();
}

function safeIconPath(value) {
  if (value === null) return null;
  const path = boundedString(value, "icon_path", 240);
  if (!/^\/assets\/[A-Za-z0-9/_-]+\.(?:svg|png|webp|jpg|jpeg)$/i.test(path) || path.includes("..")) throw new Error("icon_path_invalid");
  return path;
}

function boundedStringArray(value, name, maximumItems, maximumLength) {
  if (!Array.isArray(value) || value.length > maximumItems) throw new Error(`${name}_invalid`);
  const output = [];
  const seen = new Set();
  value.forEach((item) => {
    const text = boundedString(item, name, maximumLength, { pattern: /^[A-Za-z0-9][A-Za-z0-9 ._+-]*$/ });
    const key = text.toLocaleLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      output.push(text);
    }
  });
  return Object.freeze(output);
}

function validateEntry(entry) {
  if (!isPlainObject(entry) || !hasOnlyKeys(entry, ALLOWED_ENTRY_KEYS)) throw new Error("entry_shape_invalid");
  const normalized = {
    id: boundedString(entry.id, "id", 80, { pattern: /^[a-z0-9][a-z0-9._-]*$/ }),
    slug: boundedString(entry.slug, "slug", 80, { pattern: /^[a-z0-9][a-z0-9-]*$/ }),
    name: boundedString(entry.name, "name", 100),
    summary: boundedString(entry.summary, "summary", 400),
    publisher_name: boundedString(entry.publisher_name, "publisher_name", 120),
    publisher_type: boundedString(entry.publisher_type, "publisher_type", 20),
    extension_type: boundedString(entry.extension_type, "extension_type", 48, { pattern: /^[A-Za-z0-9][A-Za-z0-9 ._-]*$/ }),
    latest_version: boundedString(entry.latest_version, "latest_version", 64),
    minimum_studioapp_version: boundedString(entry.minimum_studioapp_version, "minimum_studioapp_version", 64, { nullable: true }),
    maximum_studioapp_version: boundedString(entry.maximum_studioapp_version, "maximum_studioapp_version", 64, { nullable: true }),
    verification_status: boundedString(entry.verification_status, "verification_status", 20),
    first_party: entry.first_party,
    icon_path: safeIconPath(entry.icon_path),
    documentation_url: safeHttpsUrl(entry.documentation_url, "documentation_url"),
    source_url: safeHttpsUrl(entry.source_url, "source_url"),
    published_at: boundedNullableDate(entry.published_at, "published_at"),
    updated_at: boundedNullableDate(entry.updated_at, "updated_at"),
    tags: boundedStringArray(entry.tags, "tags", MAX_TAGS, 32),
    supported_platforms: boundedStringArray(entry.supported_platforms, "supported_platforms", 6, 32),
    availability_status: boundedString(entry.availability_status, "availability_status", 20),
  };
  if (!PUBLISHER_VALUES.has(normalized.publisher_type)) throw new Error("publisher_type_invalid");
  if (!VERIFICATION_VALUES.has(normalized.verification_status)) throw new Error("verification_status_invalid");
  if (!AVAILABILITY_VALUES.has(normalized.availability_status)) throw new Error("availability_status_invalid");
  if (typeof normalized.first_party !== "boolean") throw new Error("first_party_invalid");
  if ((normalized.publisher_type === "first-party") !== normalized.first_party) throw new Error("publisher_status_invalid");
  return Object.freeze(normalized);
}

export function validateCatalog(payload) {
  if (!isPlainObject(payload) || !hasOnlyKeys(payload, ALLOWED_CATALOG_KEYS)) throw new Error("catalog_shape_invalid");
  if (payload.schema_version !== CATALOG_SCHEMA_VERSION) throw new Error("schema_version_invalid");
  if (payload.catalog_id !== "studioapp-extensions") throw new Error("catalog_id_invalid");
  if (payload.authoritative !== false) throw new Error("catalog_authority_invalid");
  if (payload.authority !== "StreamSuites Runtime/Auth or an authoritative generated export") throw new Error("catalog_authority_invalid");
  if (payload.generated_at !== null && (typeof payload.generated_at !== "string" || Number.isNaN(Date.parse(payload.generated_at)))) throw new Error("generated_at_invalid");
  if (!Array.isArray(payload.entries) || payload.entries.length > MAX_CATALOG_ENTRIES) throw new Error("entries_invalid");
  const entries = payload.entries.map(validateEntry);
  const ids = new Set();
  const slugs = new Set();
  entries.forEach((entry) => {
    if (ids.has(entry.id) || slugs.has(entry.slug)) throw new Error("entry_identity_duplicate");
    ids.add(entry.id);
    slugs.add(entry.slug);
  });
  return Object.freeze({
    schema_version: CATALOG_SCHEMA_VERSION,
    authoritative: false,
    entries: Object.freeze(entries),
  });
}

export function parseCatalogQuery(search = "") {
  const params = new URLSearchParams(search);
  const query = {
    q: String(params.get("q") || "").trim().slice(0, 120),
    type: String(params.get("type") || "").trim().slice(0, 48),
    publisher: String(params.get("publisher") || ""),
    compatibility: String(params.get("compatibility") || ""),
    verification: String(params.get("verification") || ""),
    sort: String(params.get("sort") || "name"),
  };
  if (!/^[A-Za-z0-9 ._-]*$/.test(query.type)) query.type = "";
  Object.entries(ALLOWED_QUERY_VALUES).forEach(([key, values]) => {
    if (!values.has(query[key])) query[key] = key === "sort" ? "name" : "";
  });
  return query;
}

export function serializeCatalogQuery(query) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.type) params.set("type", query.type);
  if (query.publisher) params.set("publisher", query.publisher);
  if (query.compatibility) params.set("compatibility", query.compatibility);
  if (query.verification) params.set("verification", query.verification);
  if (query.sort && query.sort !== "name") params.set("sort", query.sort);
  return params.toString();
}

function searchableText(entry) {
  return [entry.name, entry.summary, entry.publisher_name, ...entry.tags].join(" ").toLocaleLowerCase();
}

export function filterAndSortCatalog(entries, query) {
  const needle = query.q.toLocaleLowerCase();
  const filtered = entries.filter((entry) => {
    if (needle && !searchableText(entry).includes(needle)) return false;
    if (query.type && entry.extension_type !== query.type) return false;
    if (query.publisher && entry.publisher_type !== query.publisher) return false;
    if (query.verification && entry.verification_status !== query.verification) return false;
    const compatibilityDeclared = Boolean(entry.minimum_studioapp_version || entry.maximum_studioapp_version);
    if (query.compatibility === "declared" && !compatibilityDeclared) return false;
    if (query.compatibility === "unreported" && compatibilityDeclared) return false;
    return true;
  });
  return [...filtered].sort((left, right) => {
    if (query.sort === "updated") return (Date.parse(right.updated_at || "") || 0) - (Date.parse(left.updated_at || "") || 0) || collator.compare(left.name, right.name);
    if (query.sort === "published") return (Date.parse(right.published_at || "") || 0) - (Date.parse(left.published_at || "") || 0) || collator.compare(left.name, right.name);
    return collator.compare(left.name, right.name);
  });
}

function createElement(tag, className = "", text = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function formatStatus(value) {
  return String(value).replace(/-/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function createExtensionCard(entry) {
  const card = createElement("article", "extensions-card");
  const header = createElement("div", "extensions-card__header");
  const icon = createElement("div", "extensions-card__icon");
  if (entry.icon_path) {
    const image = document.createElement("img");
    image.src = entry.icon_path;
    image.alt = "";
    icon.append(image);
  } else {
    icon.append(createElement("span", "", entry.name.slice(0, 1).toUpperCase()));
  }
  const titleGroup = createElement("div");
  titleGroup.append(
    createElement("h3", "", entry.name),
    createElement("p", "extensions-card__publisher", `By ${entry.publisher_name}`),
  );
  header.append(icon, titleGroup);

  const summary = createElement("p", "extensions-card__summary", entry.summary);
  const tags = createElement("div", "extensions-card__tags");
  entry.tags.forEach((tag) => tags.append(createElement("span", "", tag)));

  const footer = createElement("div", "extensions-card__footer");
  footer.append(createElement("span", "download-status-chip", `${formatStatus(entry.verification_status)} verification`));
  const linkUrl = entry.documentation_url || entry.source_url;
  if (linkUrl) {
    const link = createElement("a", "", "Learn more");
    link.href = linkUrl;
    link.rel = "noopener noreferrer";
    footer.append(link);
  } else {
    footer.append(createElement("span", "", `Version ${entry.latest_version}`));
  }
  card.append(header, summary, tags, footer);
  return card;
}

function initializeDirectory() {
  const shell = document.getElementById("extensions-catalog-shell");
  if (!shell) return;
  const form = document.getElementById("extensions-catalog-form");
  const search = document.getElementById("extensions-search");
  const type = document.getElementById("extensions-type");
  const publisher = document.getElementById("extensions-publisher");
  const compatibility = document.getElementById("extensions-compatibility");
  const verification = document.getElementById("extensions-verification");
  const sort = document.getElementById("extensions-sort");
  const clear = document.getElementById("extensions-clear");
  const count = document.getElementById("extensions-result-count");
  const loading = document.getElementById("extensions-loading");
  const grid = document.getElementById("extensions-card-grid");
  const states = {
    empty: document.getElementById("extensions-empty"),
    noResults: document.getElementById("extensions-no-results"),
    unavailable: document.getElementById("extensions-unavailable"),
    error: document.getElementById("extensions-error"),
  };
  let catalog = [];
  let loadState = "loading";
  let debounceTimer = 0;

  function hideAllResults() {
    loading.hidden = true;
    grid.hidden = true;
    Object.values(states).forEach((state) => { state.hidden = true; });
  }

  function readControls() {
    return parseCatalogQuery(serializeCatalogQuery({
      q: search.value.trim(),
      type: type.value,
      publisher: publisher.value,
      compatibility: compatibility.value,
      verification: verification.value,
      sort: sort.value,
    }));
  }

  function applyControls(query) {
    search.value = query.q;
    type.value = [...type.options].some((option) => option.value === query.type) ? query.type : "";
    publisher.value = query.publisher;
    compatibility.value = query.compatibility;
    verification.value = query.verification;
    sort.value = query.sort;
  }

  function updateUrl(query, mode = "push") {
    const serialized = serializeCatalogQuery(query);
    const next = `${window.location.pathname}${serialized ? `?${serialized}` : ""}`;
    const current = `${window.location.pathname}${window.location.search}`;
    if (next === current) return;
    window.history[mode === "replace" ? "replaceState" : "pushState"]({ catalogQuery: query }, "", next);
  }

  function render({ updateHistory = true } = {}) {
    const query = readControls();
    if (updateHistory) updateUrl(query);
    const hasFilters = Boolean(query.q || query.type || query.publisher || query.compatibility || query.verification || query.sort !== "name");
    clear.disabled = !hasFilters;
    hideAllResults();

    if (loadState === "loading") {
      loading.hidden = false;
      count.textContent = "Loading catalog…";
      return;
    }
    if (loadState === "unavailable") {
      states.unavailable.hidden = false;
      count.textContent = "Catalog unavailable";
      return;
    }
    if (loadState === "error") {
      states.error.hidden = false;
      count.textContent = "Catalog rejected";
      return;
    }

    const results = filterAndSortCatalog(catalog, query);
    count.textContent = `${results.length} ${results.length === 1 ? "extension" : "extensions"}`;
    if (!catalog.length) {
      states.empty.hidden = false;
      return;
    }
    if (!results.length) {
      states.noResults.hidden = false;
      return;
    }
    grid.replaceChildren(...results.map(createExtensionCard));
    grid.hidden = false;
  }

  function populateTypes(entries) {
    const values = [...new Set(entries.map((entry) => entry.extension_type))].sort(collator.compare);
    values.forEach((value) => {
      const option = createElement("option", "", value);
      option.value = value;
      type.append(option);
    });
  }

  async function loadCatalog() {
    render({ updateHistory: false });
    let response;
    try {
      response = await fetch(CATALOG_URL, { cache: "no-store", headers: { Accept: "application/json" } });
    } catch {
      loadState = "unavailable";
      shell.setAttribute("aria-busy", "false");
      render({ updateHistory: false });
      return;
    }
    if (!response.ok) {
      loadState = "unavailable";
      shell.setAttribute("aria-busy", "false");
      render({ updateHistory: false });
      return;
    }
    try {
      const validated = validateCatalog(await response.json());
      catalog = validated.entries;
      populateTypes(catalog);
      applyControls(parseCatalogQuery(window.location.search));
      loadState = "ready";
    } catch {
      loadState = "error";
    }
    shell.setAttribute("aria-busy", "false");
    render({ updateHistory: false });
  }

  form.addEventListener("submit", (event) => event.preventDefault());
  search.addEventListener("input", () => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => render(), 160);
  });
  [type, publisher, compatibility, verification, sort].forEach((control) => control.addEventListener("change", () => render()));
  clear.addEventListener("click", () => {
    applyControls({ q: "", type: "", publisher: "", compatibility: "", verification: "", sort: "name" });
    render();
    search.focus();
  });
  window.addEventListener("popstate", () => {
    applyControls(parseCatalogQuery(window.location.search));
    render({ updateHistory: false });
  });

  applyControls(parseCatalogQuery(window.location.search));
  loadCatalog();
}

if (typeof document !== "undefined") initializeDirectory();
