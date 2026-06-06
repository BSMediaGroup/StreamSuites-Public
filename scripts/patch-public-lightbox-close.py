from pathlib import Path

root = Path(__file__).resolve().parents[1]
app = root / "js" / "public-pages-app.js"
css = root / "css" / "public-shell.css"
tests = root / "tests" / "public-authority-wiring.test.mjs"

t = app.read_text(encoding="utf-8")
old_js = """    const close = create("button", "market-item-lightbox-close", "Close");
    close.type = "button";
    close.setAttribute("aria-label", "Close item details");"""
new_js = """    const close = create("button", "market-item-lightbox-close");
    close.type = "button";
    close.setAttribute("aria-label", "Close item details");
    const closeIcon = create("span", "market-item-lightbox-close-icon");
    closeIcon.setAttribute("aria-hidden", "true");
    close.appendChild(closeIcon);"""
if old_js not in t:
    raise SystemExit("js close block missing")
app.write_text(t.replace(old_js, new_js, 1), encoding="utf-8")

c = css.read_text(encoding="utf-8")
old_css = """.market-item-lightbox-close {
  min-height: 30px;
  border: 1px solid rgba(225, 232, 244, 0.16);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.86);
  color: rgba(231, 239, 252, 0.86);
  font: inherit;
  font-size: 0.72rem;
  padding: 0 10px;
  cursor: pointer;
}

.market-item-lightbox-close:hover,
.market-item-lightbox-close:focus-visible {
  border-color: rgba(232, 238, 248, 0.42);
  color: #f8fbff;
  outline: none;
}"""
new_css = """.market-item-lightbox-close {
  flex: 0 0 auto;
  width: 40px;
  min-width: 40px;
  height: 40px;
  display: inline-grid;
  place-items: center;
  border: 1px solid rgba(132, 184, 255, 0.22);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  color: #edf5ff;
  padding: 0;
  cursor: pointer;
}

.market-item-lightbox-close-icon {
  width: 18px;
  height: 18px;
  display: block;
  background-color: currentColor;
  -webkit-mask-image: url("/assets/icons/ui/cross.svg");
  mask-image: url("/assets/icons/ui/cross.svg");
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: contain;
  mask-size: contain;
}

.market-item-lightbox-close:hover,
.market-item-lightbox-close:focus-visible {
  border-color: rgba(255, 210, 110, 0.52);
  background: rgba(255, 210, 110, 0.12);
  color: #ffffff;
  outline: none;
}

.market-item-lightbox-close:focus-visible {
  box-shadow: 0 0 0 3px rgba(98, 168, 255, 0.28);
}

.market-item-lightbox-close:active {
  transform: translateY(1px);
  background: rgba(255, 210, 110, 0.18);
}"""
if old_css not in c:
    raise SystemExit("css close block missing")
c = c.replace(old_css, new_css, 1)

old_mobile = """  .market-item-lightbox-nav,
  .market-item-lightbox-close {
    flex: 1 1 auto;
  }"""
new_mobile = """  .market-item-lightbox-nav {
    flex: 1 1 auto;
  }

  .market-item-lightbox-close {
    flex: 0 0 auto;
  }"""
if old_mobile not in c:
    raise SystemExit("css mobile close block missing")
c = c.replace(old_mobile, new_mobile, 1)
css.write_text(c, encoding="utf-8")

test_src = tests.read_text(encoding="utf-8")
needle = '  assert.match(css, /\\.market-item-lightbox-header\\s*\\{[\\s\\S]*grid-column:\\s*1 \\/ -1/);'
insert = """  assert.match(css, /\\.market-item-lightbox-close\\s*\\{[\\s\\S]*color:\\s*#edf5ff/);
  assert.match(css, /\\.market-item-lightbox-close-icon\\s*\\{[\\s\\S]*-webkit-mask-image:\\s*url\\("\\/assets\\/icons\\/ui\\/cross\\.svg"\\)/);
  assert.match(app, /market-item-lightbox-close-icon/);
  assert.match(css, /\\.market-item-lightbox-header\\s*\\{[\\s\\S]*grid-column:\\s*1 \\/ -1/);"""
if "market-item-lightbox-close-icon" not in test_src:
    if needle not in test_src:
        raise SystemExit("test insert point missing")
    tests.write_text(test_src.replace(needle, insert, 1), encoding="utf-8")

print("public lightbox close patched")