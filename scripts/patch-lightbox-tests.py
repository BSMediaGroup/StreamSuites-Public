from pathlib import Path

p = Path(__file__).resolve().parents[1] / "tests" / "public-authority-wiring.test.mjs"
t = p.read_text(encoding="utf-8")
t = t.replace(
    '  assert.match(css, /\\.market-item-lightbox\\s*\\{[\\s\\S]*grid-template-columns:\\s*minmax\\(260px, 0\\.92fr\\) minmax\\(0, 1\\.08fr\\)/);',
    '  assert.match(css, /\\.market-item-lightbox\\s*\\{[\\s\\S]*width:\\s*min\\(1360px, calc\\(100vw - 32px\\)\\)/);\n  assert.match(css, /\\.market-item-lightbox\\s*\\{[\\s\\S]*grid-template-columns:\\s*minmax\\(300px, 0\\.8fr\\) minmax\\(0, 1\\.2fr\\)/);\n  assert.match(css, /\\.market-item-lightbox\\s*\\{[\\s\\S]*scrollbar-width:\\s*thin/);\n  assert.match(css, /\\.market-item-lightbox::-webkit-scrollbar-thumb\\s*\\{/);',
    1,
)
p.write_text(t, encoding="utf-8")
print("public tests ok")