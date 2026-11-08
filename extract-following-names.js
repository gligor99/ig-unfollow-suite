const fs = require("fs");
const path = require("path");

function fail(msg) {
  console.error("Error: " + msg);
  process.exit(1);
}

const DATA_DIR = "./data";
const FOLLOWING = path.join(DATA_DIR, "following.json");

if (!fs.existsSync(FOLLOWING)) fail("Missing data/following.json");

// Parse following and extract names
const followingRaw = JSON.parse(fs.readFileSync(FOLLOWING, "utf8"));
const names = (followingRaw.relationships_following || followingRaw)
  .map((u) => u.title)
  .filter((u) => u)
  .map((u) => String(u).trim())
  .filter((u) => u.length > 0);

// Output as JSON string array to file
const outputFile = "following-names.json";
fs.writeFileSync(outputFile, JSON.stringify(names, null, 2));

console.log(`Done. Extracted ${names.length} names to ${outputFile}`);
console.log(`Note: Instagram may show a different count (e.g., 353) due to deleted/deactivated accounts that are still in the export data.`);