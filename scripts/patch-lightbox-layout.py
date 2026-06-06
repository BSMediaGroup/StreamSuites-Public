from pathlib import Path

root = Path(__file__).resolve().parents[1]
css = root / "css" / "public-shell.css"
t = css.read_text(encoding="utf-8")

replacements = [
    (
        ".market-item-lightbox-backdrop {\n  position: fixed;\n  inset: 0;\n  z-index: 260;\n  display: grid;\n  place-items: center;\n  padding: 24px;",
        ".market-item-lightbox-backdrop {\n  position: fixed;\n  inset: 0;\n  z-index: 260;\n  display: grid;\n  place-items: center;\n  padding: 16px;",
    ),
    (
        """.market-item-lightbox {
  position: relative;
  width: min(980px, calc(100vw - 48px));
  max-height: calc(100vh - 48px);
  display: grid;
  grid-template-columns: minmax(260px, 0.92fr) minmax(0, 1.08fr);
  gap: 22px;
  overflow: auto;
  border: 1px solid rgba(154, 209, 255, 0.26);
  border-radius: 8px;
  background:
    linear-gradient(140deg, rgba(24, 35, 54, 0.98), rgba(8, 13, 23, 0.98)),
    rgba(8, 13, 23, 0.98);
  box-shadow: 0 34px 110px rgba(0, 0, 0, 0.62);
  padding: 18px 24px 24px;
}""",
        """.market-item-lightbox {
  position: relative;
  width: min(1360px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  display: grid;
  grid-template-columns: minmax(300px, 0.8fr) minmax(0, 1.2fr);
  gap: 24px;
  overflow: auto;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: var(--ps-scrollbar-thumb) var(--ps-scrollbar-track);
  border: 1px solid rgba(154, 209, 255, 0.26);
  border-radius: 8px;
  background:
    linear-gradient(140deg, rgba(24, 35, 54, 0.98), rgba(8, 13, 23, 0.98)),
    rgba(8, 13, 23, 0.98);
  box-shadow: 0 34px 110px rgba(0, 0, 0, 0.62);
  padding: 18px 24px 24px;
}

.market-item-lightbox::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.market-item-lightbox::-webkit-scrollbar-track {
  background: var(--ps-scrollbar-track);
  border-radius: 999px;
}

.market-item-lightbox::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: var(--ps-scrollbar-thumb);
}

.market-item-lightbox::-webkit-scrollbar-thumb:hover {
  background: var(--ps-scrollbar-thumb-hover);
}""",
    ),
]

for old, new in replacements:
    if old not in t:
        raise SystemExit(f"missing public block: {old[:60]}")
    t = t.replace(old, new, 1)

css.write_text(t, encoding="utf-8")
print("public css ok")