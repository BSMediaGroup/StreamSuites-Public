from pathlib import Path

p = Path(__file__).resolve().parents[1] / "tests" / "public-authority-wiring.test.mjs"
t = p.read_text(encoding="utf-8")
needle = '  assert.match(app, /variant: "item-code"/);\n'
insert = needle + """  assert.match(app, /labelText === "Item code" \\|\\| labelText === "Chat alias"/);
  assert.match(app, /addMeta\\("Item code", itemCode\\);[\\s\\S]*addMeta\\("Chat alias"/);
  assert.match(app, /addMeta\\("Chat alias", firstPresent\\(item\\.chat_alias[\\s\\S]*\\{ always: true \\}\\)/);
"""
if 'labelText === "Item code" \\|\\| labelText === "Chat alias"' not in t:
    t = t.replace(needle, insert, 1)
    p.write_text(t, encoding="utf-8")
print("public tests ok")