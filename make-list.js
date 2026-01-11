const fs = require("fs");
const path = require("path");

function fail(msg) {
  console.error("Error: " + msg);
  process.exit(1);
}

const DATA_DIR = "./data";
const FOLLOWERS = path.join(DATA_DIR, "followers_1.json");
const FOLLOWING = path.join(DATA_DIR, "following.json");

if (!fs.existsSync(FOLLOWERS)) fail("Missing data/followers_1.json");
if (!fs.existsSync(FOLLOWING)) fail("Missing data/following.json");

// Parse followers
const followers = JSON.parse(fs.readFileSync(FOLLOWERS, "utf8"))
  .map((u) => u.string_list_data?.[0]?.value)
  .filter((u) => u)
  .map((u) => String(u).toLowerCase().trim())
  .filter((u) => u.length > 0);

// Parse following
const followingRaw = JSON.parse(fs.readFileSync(FOLLOWING, "utf8"));
const following = (followingRaw.relationships_following || followingRaw)
  .map((u) => u.title)
  .filter((u) => u)
  .map((u) => String(u).toLowerCase().trim())
  .filter((u) => u.length > 0);

console.log(`Followers: ${followers.length}`);
console.log(`Following: ${following.length}`);

const followerSet = new Set(followers);
const notFollowingBack = following.filter((u) => !followerSet.has(u));

console.log(`Not following back: ${notFollowingBack.length}`);

if (notFollowingBack.length > 0) {
  console.log("\nFirst 5 examples:");
  notFollowingBack.slice(0, 5).forEach((u, i) => {
    console.log(`  ${i + 1}. ${u}`);
  });
}

fs.writeFileSync("not_following_back.txt", notFollowingBack.join("\n"));
fs.writeFileSync(
  "not_following_back.json",
  JSON.stringify(notFollowingBack, null, 2)
);

console.log(
  "\nDone. Files created: not_following_back.txt, not_following_back.json"
);
