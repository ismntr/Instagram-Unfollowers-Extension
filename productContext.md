# Product Context

## Core Purpose

A Chrome Extension (Manifest V3) that automates the process of unfollowing users on a specific social graph. It bypasses fragile DOM scraping by intercepting native network requests to extract following lists, compares them against a hardcoded CSV whitelist, and executes rate-limited POST requests to the native unfollow endpoint using the user's active session.

## User Stories

- **As a user,** I want the extension to automatically capture the list of people I follow when I open my "Following" list on the web interface.
- **As a user,** I want the extension to parse a hardcoded whitelist (from `igtracker_dont_follow_back_2026-07-13.csv`) to prevent unfollowing specific usernames (e.g., `sol_cansu`, `ceydabayrkk`, `idildv`).
- **As a user,** I want the extension to execute unfollow actions with human-like, randomized delays (5-15 seconds) to prevent my account from being rate-limited or banned.
