const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const LIST_FILE = path.join(__dirname, "../not_following.txt");
const JSON_FILE = path.join(__dirname, "../not_following.json");
const DONE_FILE = path.join(__dirname, "../removed_followers.txt");

// Your own username: `npm run remove -- myusername` or IG_USERNAME=myusername
const ME = (process.argv[2] || process.env.IG_USERNAME || "")
  .trim()
  .replace(/^@/, "");

// Keep this LOW. Instagram rate-limits follower removal aggressively.
const LIMIT = 25;
const DELAY_BETWEEN_MS = [20000, 35000]; // random delay between removals
const MAX_FAILS_IN_ROW = 5; // stop if something is clearly wrong (block / UI change)

if (!ME) {
  console.error(
    "Usage: npm run remove -- <your_instagram_username>\n   or: IG_USERNAME=<username> npm run remove"
  );
  process.exit(1);
}

if (!fs.existsSync(LIST_FILE)) {
  console.error("Missing not_following.txt - run 'node find-not-following.js' first.");
  process.exit(1);
}

let users = fs
  .readFileSync(LIST_FILE, "utf8")
  .split(/\r?\n/)
  .map((u) => u.trim())
  .filter(Boolean);

function saveList(updatedUsers) {
  fs.writeFileSync(LIST_FILE, updatedUsers.join("\n") + (updatedUsers.length ? "\n" : ""));
  fs.writeFileSync(JSON_FILE, JSON.stringify(updatedUsers, null, 2));
}

function logDone(u, status) {
  fs.appendFileSync(DONE_FILE, `${new Date().toISOString()}\t${status}\t${u}\n`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const randomBetween = ([min, max]) => min + Math.floor(Math.random() * (max - min));

async function openFollowersDialog(page) {
  await page.goto(`https://www.instagram.com/${ME}/followers/`);
  const dialog = page.getByRole("dialog").first();
  await dialog.waitFor({ state: "visible", timeout: 15000 });
  const search = dialog.locator('input[type="text"], input[placeholder*="Search" i]').first();
  await search.waitFor({ state: "visible", timeout: 10000 });
  return { dialog, search };
}

/**
 * Returns "removed" | "not_found" | "failed"
 */
async function removeFollower(page, u) {
  const { dialog, search } = await openFollowersDialog(page);

  await search.click();
  await search.fill("");
  await search.type(u, { delay: 80 });
  await sleep(3500);

  const userLink = dialog.locator(`a[href="/${u}/"]`).first();
  try {
    await userLink.waitFor({ state: "visible", timeout: 6000 });
  } catch {
    return "not_found";
  }

  // Innermost element that contains both this user's link and a "Remove" button = the row
  const removeBtnInRow = page
    .getByRole("dialog")
    .locator("div")
    .filter({ has: page.locator(`a[href="/${u}/"]`) })
    .filter({ has: page.getByRole("button", { name: /^Remove$/i }) })
    .last()
    .getByRole("button", { name: /^Remove$/i })
    .first();

  try {
    await removeBtnInRow.waitFor({ state: "visible", timeout: 5000 });
  } catch {
    console.log(`  No "Remove" button in row for ${u}`);
    return "failed";
  }

  await removeBtnInRow.click();
  await sleep(1500);

  // Confirmation dialog ("Remove follower?") is the newest dialog
  const confirmBtn = page
    .getByRole("dialog")
    .last()
    .getByRole("button", { name: /^Remove$/i })
    .first();

  try {
    await confirmBtn.waitFor({ state: "visible", timeout: 5000 });
    await confirmBtn.click();
  } catch {
    console.log(`  Confirm "Remove" not found for ${u}`);
    return "failed";
  }

  await sleep(2500);

  // Instagram shows a "Try again later" / action-blocked dialog when rate-limited
  const blocked = await page
    .getByText(/try again later|action blocked|we restrict certain activity/i)
    .first()
    .isVisible()
    .catch(() => false);
  if (blocked) return "blocked";

  return "removed";
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://www.instagram.com/accounts/login/");
  console.log("Login manually, then wait...");
  console.log(`Account: ${ME}`);
  console.log(`Starting with ${users.length} followers to remove (limit this run: ${LIMIT})`);

  while (page.url().includes("login")) {
    await sleep(2000);
  }
  await sleep(4000);

  let removed = 0;
  let notFound = 0;
  let failsInRow = 0;
  let attempts = 0;
  const maxAttempts = LIMIT * 3;

  while (users.length > 0 && removed < LIMIT && attempts < maxAttempts) {
    const u = users[0];
    attempts++;

    let result;
    try {
      result = await removeFollower(page, u);
    } catch (error) {
      console.log("Error for", u, "-", error.message);
      result = "failed";
    }

    if (result === "blocked") {
      console.log("\n⚠️  Instagram blocked the action (rate limit). STOPPING.");
      console.log("Wait at least 24-48h before running again.");
      break;
    }

    if (result === "removed") {
      console.log(`Removed ${u}  (${removed + 1}/${LIMIT})`);
      users.shift();
      saveList(users);
      logDone(u, "removed");
      removed++;
      failsInRow = 0;
      await sleep(randomBetween(DELAY_BETWEEN_MS));
    } else if (result === "not_found") {
      // Already not following you (unfollowed, deactivated or renamed)
      console.log(`Not in followers anymore: ${u} - dropping from list`);
      users.shift();
      saveList(users);
      logDone(u, "not_found");
      notFound++;
      failsInRow = 0;
      await sleep(3000);
    } else {
      console.log("Keeping", u, "in list for retry");
      users.push(users.shift());
      saveList(users);
      failsInRow++;
      if (failsInRow >= MAX_FAILS_IN_ROW) {
        console.log(
          `\n${MAX_FAILS_IN_ROW} failures in a row - Instagram UI may have changed or you're restricted. STOPPING.`
        );
        break;
      }
      await sleep(5000);
    }
  }

  await browser.close();
  console.log(`\nFinished. Removed ${removed} followers, ${notFound} were already gone.`);
  console.log(`Remaining in list: ${users.length}`);
  console.log("Log: removed_followers.txt");
})();
