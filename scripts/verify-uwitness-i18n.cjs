const fs = require("fs");
const html = fs.readFileSync(
  "D:/Personal_Maxs_Projects/Personal_web/games/unseen-witness.html",
  "utf8"
);
const keys = [...html.matchAll(/data-i18n="([^"]+)"/g)].map((m) => m[1]);
const zh = JSON.parse(
  fs.readFileSync(
    "D:/Personal_Maxs_Projects/Personal_web/lang/unseen-witness.zh.json",
    "utf8"
  )
);
function get(o, p) {
  return p.split(".").reduce((a, k) => a?.[k], o);
}
const missing = keys.filter((k) => get(zh, k) == null || get(zh, k) === "");
console.log("keys", keys.length, "missing", missing.length);
if (missing.length) console.log(missing.join("\n"));
