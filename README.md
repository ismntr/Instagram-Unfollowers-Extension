# Instagram Unfollow Core 🚀

A Proof of Concept (PoC) Google Chrome Extension (Manifest V3) that automates the process of unfollowing users on Instagram safely and efficiently using **Network Interception**.

## 🌟 Why this approach?

Traditional automation tools rely on DOM scraping (finding and clicking buttons on the screen). This is highly fragile on modern Single Page Applications (SPAs) like Instagram because class names change frequently, and Virtualized Lists only render a few items at a time.

This extension uses **Network Interception**:
1. It injects a script into the main execution world.
2. It monkey-patches `window.fetch` and `XMLHttpRequest`.
3. It silently listens to the JSON responses coming from Instagram's internal GraphQL/REST APIs when you open your "Following" list.
4. It extracts user IDs and adds them to a queue without ever touching the DOM.

## ✨ Features

- **Network Interception:** Captures user data directly from API responses.
- **CSV Target List Integration:** Automatically unfollows the exact users you specify in an uploaded CSV file.
- **Background Matching:** Upload your CSV, scroll through your Instagram "Following" list, and the extension instantly matches usernames to hidden internal IDs to queue them up.
- **Randomized Human-like Delays:** Waits between 5 and 15 seconds before each unfollow action to simulate human behavior and avoid detection.
- **Rate-Limit Handling:** Automatically pauses the queue for 15 minutes if Instagram returns a `429 Too Many Requests` status.
- **Manifest V3 Compliant:** Built using modern, secure Chrome extension standards.

## ⚠️ Disclaimer

**This project is for educational purposes and as a Proof of Concept only.** Automating actions on Instagram violates their Terms of Service. Use this at your own risk. The authors are not responsible for any account bans, suspensions, or restrictions that may occur from using this software.

## 🛠 Installation (Developer Mode)

Since this is an unpacked extension, you need to load it manually into Chrome:

1. Download or clone this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top right corner.
4. Click the **Load unpacked** button in the top left.
5. Select the folder containing this project (the directory with `manifest.json`).
6. The extension should now appear in your list of extensions. Pin it to your toolbar for easy access!

## 🚀 Usage

1. Log in to your Instagram account on Chrome.
2. Navigate to your profile and click on your **Following** list.
3. Scroll down the list slightly. As you scroll, the extension intercepts the network requests and silently builds a queue of users.
4. Click the **IG Unfollow Core** extension icon in your Chrome toolbar.
5. Click **Choose File** and upload your CSV whitelist. The format should have usernames in the first column (e.g., `username,full_name`).
6. The popup will update to show how many users have been queued from scrolling and how many are protected by the whitelist.
7. Click **Start Engine**.
8. Keep the Instagram tab open in the background. The extension will begin unfollowing users one by one with randomized delays.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
