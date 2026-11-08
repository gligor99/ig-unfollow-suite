const fs = require("fs");
const path = require("path");

function fail(msg) {
  console.error("Error: " + msg);
  process.exit(1);
}

const DATA_DIR = "./data";
const FOLLOWERS = path.join(DATA_DIR, "followers_1.json");
const FOLLOWING = path.join(DATA_DIR, "following.json");
// Optional: one username per line. If present, ONLY these followers are kept.
const KEEP = path.join(DATA_DIR, "keep.txt");

const normalize = (u) =>
  String(u).toLowerCase().trim().replace(/^@/, "").replace(/\/+$/, "");

if (!fs.existsSync(FOLLOWERS)) fail("Missing data/followers_1.json");

// Parse followers
const followers = JSON.parse(fs.readFileSync(FOLLOWERS, "utf8"))
  .map((u) => u.string_list_data?.[0]?.value || u.title)
  .filter((u) => u)
  .map(normalize)
  .filter((u) => u.length > 0);

let keep;
let keepSource;

if (fs.existsSync(KEEP)) {
  keep = fs
    .readFileSync(KEEP, "utf8")
    .split(/\r?\n/)
    .map((line) => line.replace(/^https?:\/\/(www\.)?instagram\.com\//i, ""))
    .map(normalize)
    .filter((u) => u.length > 0);
  keepSource = "data/keep.txt";
} else {
  if (!fs.existsSync(FOLLOWING)) fail("Missing data/following.json");
  const followingRaw = JSON.parse(fs.readFileSync(FOLLOWING, "utf8"));
  keep = (followingRaw.relationships_following || followingRaw)
    .map((u) => u.title || u.string_list_data?.[0]?.value)
    .filter((u) => u)
    .map(normalize)
    .filter((u) => u.length > 0);
  keepSource = "data/following.json";
}

console.log(`Followers: ${followers.length}`);
console.log(`Keep list (${keepSource}): ${keep.length}`);

const keepSet = new Set(keep);
const notFollowing = [...new Set(followers.filter((u) => !keepSet.has(u)))];

const followerSet = new Set(followers);
const keepNotFollowers = keep.filter((u) => !followerSet.has(u));

console.log(`\nFollowers to remove: ${notFollowing.length}`);
console.log(`Followers kept: ${followers.length - notFollowing.length}`);
if (keepSource === "data/keep.txt" && keepNotFollowers.length > 0) {
  console.log(
    `Note: ${keepNotFollowers.length} names in keep.txt are not in your followers export (typo or they don't follow you).`
  );
}

if (notFollowing.length > 0) {
  console.log("\nFirst 10 examples:");
  notFollowing.slice(0, 10).forEach((u, i) => {
    console.log(`  ${i + 1}. ${u}`);
  });
}

// Save to files
fs.writeFileSync("not_following.txt", notFollowing.join("\n") + "\n");
fs.writeFileSync("not_following.json", JSON.stringify(notFollowing, null, 2));

console.log("\nDone. Files created: not_following.txt, not_following.json");
console.log(
  "Run 'cd playwright-unfollow && npm run remove -- <your_username>' to remove them."
);
