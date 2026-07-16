# Instagram Unfollower Extension 🚀

A Proof of Concept (PoC) Google Chrome Extension (Manifest V3) that reads a CSV of Instagram usernames and sequentially unfollows them using direct API integration and randomized delays.

## 🌟 How it works

This extension works in two phases: first you generate a CSV of users you don't want to follow anymore, and then this extension processes that list.

1. **Prerequisite (Generating the CSV):** Use the [IG Tracker - Followers & Unfollowers](https://chromewebstore.google.com/detail/ig-tracker-%E2%80%93-followers-un/gpnpbncjakifkeechdhlajmpmliablmc) Chrome extension to find out who is not following you back, and export that list as a CSV file.
2. **Execution:** You upload that CSV to this extension.
3. The extension queries Instagram's `web_profile_info` API to resolve the username into a numeric User ID.
4. It sends a direct, authenticated `POST` request to Instagram's unfollow endpoint.
5. It sleeps for a random duration (15-30 seconds) to simulate human behavior and avoid rate limits, then moves to the next user.

## ✨ Features

- **Direct ID Resolution:** Finds the hidden internal ID for any Instagram username automatically.
- **CSV Processing:** Just drop your CSV (username in the first column) and let it run.
- **Randomized Human-like Delays:** Waits between 5 and 15 seconds before each unfollow action.
- **Rate-Limit Handling:** Automatically pauses the queue for 15 minutes if Instagram returns a `429 Too Many Requests` status.

## ⚠️ Disclaimer

**This project is for educational purposes and as a Proof of Concept only.** Automating actions on Instagram violates their Terms of Service. Use this at your own risk. The authors are not responsible for any account bans, suspensions, or restrictions that may occur from using this software.

## 🛠 Installation (Developer Mode)

1. Download or clone this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top right corner.
4. Click the **Load unpacked** button in the top left.
5. Select the folder containing this project.

## 🚀 Usage

### Step 1: Get Your Unfollow List
1. Install [IG Tracker - Followers & Unfollowers](https://chromewebstore.google.com/detail/ig-tracker-%E2%80%93-followers-un/gpnpbncjakifkeechdhlajmpmliablmc) from the Chrome Web Store.
2. Run IG Tracker on your Instagram profile to find users who don't follow you back.
3. Export this list as a CSV file.

### Step 2: Run the Unfollower
1. Log in to your Instagram account on Chrome and stay on any Instagram page.
2. Click this extension's icon in your Chrome toolbar.
3. Click **Choose File** and upload the CSV you exported in Step 1.
4. Click **Start Engine**.
5. Keep the Instagram tab open in the background. The extension will begin finding IDs and unfollowing users safely one by one.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
