const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const LIST_FILE = path.join(__dirname, "../not_following_back.txt");
const JSON_FILE = path.join(__dirname, "../not_following_back.json");

let users = fs.readFileSync(LIST_FILE, "utf8").split(/\r?\n/).filter(Boolean);

const LIMIT = 120;

function saveList(updatedUsers) {
  fs.writeFileSync(LIST_FILE, updatedUsers.join("\n") + "\n");
  fs.writeFileSync(JSON_FILE, JSON.stringify(updatedUsers, null, 2));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://www.instagram.com/accounts/login/");
  console.log("Login manually, then wait...");
  console.log(`Starting with ${users.length} users in list`);

  while (page.url().includes("login")) {
    await sleep(2000);
  }

  let count = 0;
  while (users.length > 0 && count < LIMIT) {
    const u = users[0];

    await page.goto(`https://www.instagram.com/${u}/`);
    await sleep(4000);

    try {
      const followingButton = page
        .getByRole("button", { name: /Following/i })
        .first();
      await followingButton.waitFor({ state: "visible", timeout: 5000 });
      await followingButton.click();
      await sleep(2000);

      let unfollowClicked = false;

      try {
        const unfollowBtn = page
          .getByRole("button", { name: /^Unfollow$/i })
          .first();
        await unfollowBtn.waitFor({ state: "visible", timeout: 3000 });
        await unfollowBtn.click();
        unfollowClicked = true;
      } catch (e1) {
        try {
          const unfollowBtn = page
            .locator("button")
            .filter({ hasText: /^Unfollow$/i })
            .first();
          await unfollowBtn.waitFor({ state: "visible", timeout: 3000 });
          await unfollowBtn.click();
          unfollowClicked = true;
        } catch (e2) {
          try {
            await page.waitForSelector('button:has-text("Unfollow")', {
              timeout: 3000,
            });
            await page.click('button:has-text("Unfollow")');
            unfollowClicked = true;
          } catch (e3) {
            console.log("Could not find Unfollow button for", u);
          }
        }
      }

      if (unfollowClicked) {
        console.log("Unfollowed", u);
        users.shift();
        saveList(users);
        count++;
        await sleep(12000);
      } else {
        console.log("Keeping", u, "in list for retry");
        const skipped = users.shift();
        users.push(skipped);
      }
    } catch (error) {
      console.log("Skip", u, "-", error.message);
      const skipped = users.shift();
      users.push(skipped);
    }
  }

  await browser.close();
  console.log(`\nFinished. Unfollowed ${count} users.`);
  console.log(`Remaining users in list: ${users.length}`);
})();
