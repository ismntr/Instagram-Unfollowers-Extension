# Project Rules & Commands

**Stack:** Chrome Extension (Manifest V3), Vanilla JavaScript (ES6+), HTML/CSS.
**Build Command:** No bundler required for PoC. Vanilla JS loaded directly via manifest.json.
**Test Command:** Manual load unpacked extension in chrome://extensions.

## Style Guide

- **JavaScript Strict Mode:** Enabled
- **Structure:** Modular pattern separating injection scripts, content scripts, and background service workers.

## Workflow & Behavior

- **ALWAYS** read `activeContext.md` before answering.
- **ALWAYS** update `progress.md` when a task is finished.
- Think step-by-step.

## Core Philosophy

**KISS (Keep It Simple, Stupid).** Prove the core engine (Proof of Concept) before building ANY complex UI, settings pages, or background orchestration.

**Zero Feature Creep:** Do NOT add unrequested features, analytics, or complex state frameworks until the raw unfollow pipeline works flawlessly.

**Platform Awareness:** The target platform is a modern React SPA using Virtualized Lists. **YOU MUST NEVER** rely on naive DOM manipulation (e.g., `document.querySelectorAll('.unfollow-button')`) or mechanical scrolling. **You MUST** rely on Network Interception (monkey-patching `fetch` and `XMLHttpRequest` in the **MAIN** execution world) to capture API JSON responses containing user IDs.
