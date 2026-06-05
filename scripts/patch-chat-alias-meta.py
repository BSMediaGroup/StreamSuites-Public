from pathlib import Path

p = Path(__file__).resolve().parents[1] / "js" / "public-pages-app.js"
t = p.read_text(encoding="utf-8")

old_add_meta = """    const addMeta = (labelText, value, metaOptions = {}) => {
      const formatted = metaOptions.timestamp ? formatEconomyDetailTimestamp(value) : formatItemDetailValue(value);
      if (!formatted) return;
      if (labelText === "Item code") {
        meta.push({ label: labelText, value: formatted, rawValue: value, variant: "item-code" });
        return;
      }
      meta.push({ label: labelText, value: formatted, rawValue: value, currency: Boolean(metaOptions.currency) });
    };
    addMeta("Item code", itemCode);
    addMeta("Slug / ID", firstPresent(item.slug, item.id, item.asset_id, item.image_asset_id, item.image_asset_key));
    addMeta("Chat alias", firstPresent(item.chat_alias, definition.chat_alias, publicMetadata.chat_alias, item.alias, item.command_alias));"""

new_add_meta = """    const addMeta = (labelText, value, metaOptions = {}) => {
      const formatted = metaOptions.timestamp ? formatEconomyDetailTimestamp(value) : formatItemDetailValue(value);
      if (!formatted && !metaOptions.always) return;
      if (labelText === "Item code" || labelText === "Chat alias") {
        meta.push({ label: labelText, value: formatted || "—", rawValue: value, variant: "item-code" });
        return;
      }
      meta.push({ label: labelText, value: formatted, rawValue: value, currency: Boolean(metaOptions.currency) });
    };
    addMeta("Item code", itemCode);
    addMeta("Chat alias", firstPresent(item.chat_alias, definition.chat_alias, publicMetadata.chat_alias, item.command_alias), { always: true });
    addMeta("Slug / ID", firstPresent(item.slug, item.id, item.asset_id, item.image_asset_id, item.image_asset_key));"""

old_fallback = """    const formattedCode = formatItemDetailValue(itemCode);
    if (formattedCode) meta.push({ label: "Item code", value: formattedCode, variant: "item-code" });
    return {"""

new_fallback = """    const formattedCode = formatItemDetailValue(itemCode);
    if (formattedCode) meta.push({ label: "Item code", value: formattedCode, variant: "item-code" });
    const formattedChatAlias = formatItemDetailValue(firstPresent(item.chat_alias, definition.chat_alias, definition.public_metadata?.chat_alias, item.public_metadata?.chat_alias, item.command_alias));
    meta.push({ label: "Chat alias", value: formattedChatAlias || "—", variant: "item-code" });
    return {"""

if old_add_meta not in t:
    raise SystemExit("addMeta block missing")
t = t.replace(old_add_meta, new_add_meta, 1)
if old_fallback not in t:
    raise SystemExit("fallback block missing")
t = t.replace(old_fallback, new_fallback, 1)
p.write_text(t, encoding="utf-8")
print("public ok")