# IG Unfollow Suite (FULL AUTO)

An automated tool to help you unfollow IG accounts that don't follow you back. This suite consists of two parts: a list generator that analyzes your IG export data, and an automated unfollow script using Playwright.

## ⚠️ Important Disclaimer

**USE AT YOUR OWN RISK. THIS TOOL VIOLATES IG'S TERMS OF SERVICE.**

This tool is for **educational purposes only**. Using automation tools on IG can result in:

- Temporary account restrictions
- Permanent account suspension
- Loss of access to your account
- Legal consequences (in some jurisdictions)

**The developers are NOT responsible for any account restrictions, bans, or other consequences resulting from the use of this tool.**

By using this tool, you acknowledge that:

- You understand the risks involved
- You are using it at your own discretion
- You will not hold the developers liable for any consequences
- You are responsible for your own actions

**Recommended:** Limit unfollows to 10-30 per day to minimize risk. Start with even smaller numbers (5-10) to test.

## 📋 Features

- 🔍 Automatically identifies accounts that don't follow you back
- 🤖 Automated unfollowing using Playwright browser automation
- 📊 Progress tracking with persistent list management
- 🔄 Automatic retry for failed unfollows
- 💾 Saves progress - can resume if interrupted

## 📦 Prerequisites

- Node.js (v14 or higher)
- IG account with exported data
- npm or yarn

## 🚀 Installation

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd ig-unfollow-suite-v2
   ```

2. **Install dependencies:**
   ```bash
   cd playwright-unfollow
   npm install
   npm run install  # Installs Playwright Chromium browser
   ```

## 📥 Getting Your IG Data

1. Go to the platform's Download Your Information page (search for "download your data" in your account settings)
2. Select "Download or transfer your information"
3. Choose "Specific types of information"
4. Select "Followers and following"
5. Choose JSON format
6. Request download and wait for email
7. Extract the downloaded ZIP file
8. Find `followers_1.json` and `following.json` in the extracted files

## 🎯 Usage

### Step 1: Add Your IG Export Files

Place your IG export files in the `data/` directory:

```
data/
  ├── followers_1.json
  └── following.json
```

### Step 2: Generate the Unfollow List

Run the list generator to identify accounts that don't follow you back:

```bash
node make-list.js
```

This will:

- Parse your followers and following data
- Identify accounts you follow who don't follow you back
- Create `not_following_back.txt` and `not_following_back.json` files

**Output example:**

```
📊 Followers: 1500
📊 Following: 2000
📊 Not following back: 500

📋 First 5 examples:
  1. username1
  2. username2
  3. username3
  4. username4
  5. username5

✅ DONE
📁 Files created: not_following_back.txt, not_following_back.json
```

### Step 3: Run the Automated Unfollow Script

```bash
cd playwright-unfollow
npm start
```

**What happens:**

1. A browser window will open
2. You'll be prompted to log in manually
3. Once logged in, the script will automatically:
   - Visit each account from your list
   - Click "Following" button
   - Click "Unfollow" button
   - Remove successfully unfollowed accounts from the list
   - Retry failed unfollows later

**Features:**

- Default limit: 120 unfollows per run (configurable in `unfollow.js`) - **WARNING: This is very high risk! Reduce to 10-30 for safety**
- 12-second delay between unfollows (consider increasing to 20-30 seconds)
- Progress is saved automatically - you can stop and resume anytime
- Failed unfollows are moved to the end of the list for retry

**⚠️ IMPORTANT:** The default limit of 120 is **extremely risky**. Start with 5-10 unfollows to test, then gradually increase. Never exceed 30 per day.

## ⚙️ Configuration

### Change the Unfollow Limit

Edit `playwright-unfollow/unfollow.js`:

```javascript
const LIMIT = 120; // Change this to your desired limit
```

### Adjust Delays

Edit the sleep durations in `playwright-unfollow/unfollow.js`:

```javascript
await sleep(12000); // 12 seconds between unfollows (line 91)
await sleep(4000); // 4 seconds after visiting profile (line 38)
```

## 🔒 Privacy & Security

- **Never commit your personal data files to git** - they are automatically excluded via `.gitignore`
- Your credentials are never stored or logged
- All processing happens locally on your machine

## 🛠️ Troubleshooting

### "Missing data/followers_1.json" or "Missing data/following.json"

- Make sure you've placed the JSON files in the `data/` directory
- Verify the file names match exactly (case-sensitive)

### "Could not find Unfollow button"

- The platform may have changed their UI
- The account might already be unfollowed
- Try running the script again - failed accounts are retried automatically

### Browser doesn't open / Playwright errors

- Run `npm run install` in the `playwright-unfollow` directory
- Make sure you have Node.js v14 or higher

### Rate limiting / Account restrictions

**If you see any warnings or restrictions:**

- **STOP USING THE TOOL IMMEDIATELY**
- Reduce the `LIMIT` in `unfollow.js` to 5-10
- Increase delays between actions to 30+ seconds
- Wait at least 48-72 hours before running again
- Use the platform normally (like, comment, post) to appear more human
- Consider unfollowing manually only going forward
- If restrictions persist, contact platform support

**Signs you're being rate-limited:**

- "Action blocked" messages
- Can't unfollow even manually
- Account feels "restricted"
- Reduced engagement on your posts

## 📁 Project Structure

```
ig-unfollow-suite-v2/
├── data/                    # Place your IG export files here
│   ├── followers_1.json    # (not committed to git)
│   └── following.json      # (not committed to git)
├── playwright-unfollow/     # Automation script
│   ├── unfollow.js         # Main unfollow automation
│   ├── package.json        # Dependencies
│   └── node_modules/       # (not committed to git)
├── make-list.js            # List generator script
├── not_following_back.txt  # Generated list (not committed to git)
├── not_following_back.json # Generated list (not committed to git)
├── .gitignore             # Git exclusions
└── README.md              # This file
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is provided as-is for educational purposes only.

**No warranty is provided.** The authors and contributors are not responsible for any damages, account restrictions, bans, or legal issues that may arise from using this software.

**By using this software, you agree to:**

- Use it at your own risk
- Not hold the developers liable for any consequences
- Comply with all applicable terms of service and laws
- Understand that automation may violate platform policies

Use at your own risk.

## ⚠️ Safety Recommendations & Risk Mitigation

### Before Using:

1. **Backup important data** - Export your followers/following lists before starting
2. **Use a test account first** - Never use on business or important personal accounts
3. **Understand the risks** - Read all warnings and disclaimers carefully
4. **Check your account status** - Don't use if your account already has restrictions

### While Using:

1. **Start very small:** Test with 5-10 unfollows first, wait 24 hours, then gradually increase
2. **Never exceed 30 per day** - Even 30 is risky, 10-20 is safer
3. **One session per day maximum** - Don't run multiple times in the same day
4. **Increase delays:** Change the 12-second delay to 20-30 seconds for extra safety
5. **Monitor constantly:** Watch for any warnings, popups, or error messages
6. **Stop immediately** if you see any warnings from the platform

### After Using:

1. **Wait 24-48 hours** before running again
2. **Mix with manual actions** - Do some unfollows manually to appear more human
3. **Monitor your account** for the next few days for any restrictions

### How IG Detects Automation:

- **Too many actions in short time** - Unnatural speed
- **Perfect timing patterns** - Exact same delays between actions
- **No human behavior** - Missing random pauses, scrolling, etc.
- **Browser fingerprinting** - Automated browsers can be detected
- **Account behavior analysis** - Sudden changes in activity patterns

### Possible Consequences:

1. **Temporary restrictions:**

   - Can't unfollow for 24-48 hours
   - Reduced daily action limits
   - "Action blocked" messages

2. **Account limitations:**

   - Shadowban (reduced reach)
   - Cannot use certain features
   - Account flagged for review

3. **Account suspension:**

   - Temporary ban (days to weeks)
   - Permanent ban (rare but possible)
   - Loss of all content and followers

4. **Legal issues:**
   - Violation of Terms of Service
   - Potential legal action (in extreme cases)

### Best Practices:

- **Never use on business accounts**
- **Don't use if you have a large following** (higher risk)
- **Respect the platform** - They provide a free service
- **Consider manual unfollowing** - It's slower but 100% safe
- **Use sparingly** - Only when absolutely necessary

### If You Get Restricted:

1. **Stop using the tool immediately**
2. **Wait at least 7 days** before any automation
3. **Use the platform normally** - Like posts, comment, etc.
4. **Contact support** if restrictions don't lift (be honest)
5. **Consider manual unfollowing only** going forward

---

## 📜 Legal Notice

This software is provided "as-is" without any warranties. The use of automation tools may violate the platform's Terms of Service. Users are solely responsible for their actions and any consequences that may arise from using this tool.

**The code itself is legal to create and share.** However, **using it may violate platform policies**. You are responsible for understanding and complying with all applicable terms of service and laws in your jurisdiction.

**Remember:** Creating and sharing code is legal. Using automation tools on platforms that prohibit them may violate their Terms of Service and could result in account penalties. Use responsibly and at your own risk.
