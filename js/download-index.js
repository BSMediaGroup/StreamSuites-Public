(() => {
  const form = document.getElementById("download-index-form");
  const search = document.getElementById("download-index-search");
  const count = document.getElementById("download-index-count");
  const empty = document.getElementById("download-index-empty");
  const cards = [...document.querySelectorAll("[data-download-card]")];
  if (!form || !search || !count || !empty || cards.length === 0) return;

  const normalize = (value) => String(value || "").trim().toLocaleLowerCase();
  const update = ({ writeUrl = true } = {}) => {
    const query = normalize(search.value);
    const terms = query.split(/\s+/).filter(Boolean);
    let visible = 0;

    cards.forEach((card) => {
      const searchable = normalize(card.dataset.search);
      const matches = terms.length === 0 || terms.every((term) => searchable.includes(term));
      card.hidden = !matches;
      if (matches) visible += 1;
    });

    count.textContent = `${visible} product surface${visible === 1 ? "" : "s"}`;
    empty.hidden = visible !== 0;

    if (writeUrl) {
      const url = new URL(window.location.href);
      if (query) url.searchParams.set("q", search.value.trim());
      else url.searchParams.delete("q");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
  };

  const initialQuery = new URL(window.location.href).searchParams.get("q") || "";
  search.value = initialQuery.slice(0, 100);
  update({ writeUrl: false });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    update();
  });
  search.addEventListener("input", () => update());
})();
