# ⚡ AI Hackathon Team Matcher

> **Build balanced teams. Find the right teammates. Start hacking.**

A clean, modern, and beginner-friendly web application designed for hackathon organizers to collect participant registrations and automatically create balanced, cross-functional hackathon squads using an intelligent local matching heuristic.

---

## 🌟 Highlights & Features

### 1. 📝 Participant Registration
- **Comprehensive Hacker Profile Form**:
  - Full Name
  - Email Address
  - Phone Number
  - Technical Skills (with clickable quick-suggestion chips)
  - Preferred Role (`Frontend`, `Backend`, `AI/ML`, `UI/UX`, `Full Stack`, `Mobile`, `DevOps/Cloud`, `Other`)
  - Experience Level (`Beginner`, `Intermediate`, `Advanced`)
  - Hackathon Track Interests (`AI / GenAI`, `FinTech`, `HealthTech`, `EdTech`, `ClimateTech`, `Open Innovation`)
- **Organizer Roster Management**:
  - ✏️ **Edit Participant**: Instant pre-filled form with smooth auto-scroll.
  - 🗑️ **Delete Participant**: Remove participants with confirmation.
  - 🧹 **Reset / Clear All**: Safe dialog to wipe roster and teams.
  - 🔍 **Live Search & Filter**: Filter participants by name, role, skills, or tracks.
  - 🔲/☰ **Dual View Modes**: Switch between Modern Card Grid and Compact Table View.
  - ✨ **1-Click Demo Loader**: Instantly populates 12 diverse, realistic participants for testing.

### 2. ⚙️ Flexible Team Settings
- Choose between two formation strategies:
  1. **Number of Teams**: Divide all participants evenly across $N$ squads.
  2. **Maximum Members per Team**: Cap squads at $K$ members and dynamically calculate required squads.
- Interactive range slider with real-time squad size projection.

### 3. 🤖 Simulated AI Team Matching Engine
- Runs **100% locally in JavaScript** without external AI APIs or paid keys.
- **Multi-Objective Heuristic Solver**:
  - **Core Role Anchoring**: Guarantees each squad gets complementary technical pillars (`AI/ML`, `Frontend`, `Backend`, `UI/UX`).
  - **Experience Equilibrium**: Balances senior veterans (`Advanced`) with learners (`Beginner` / `Intermediate`) for effective mentorship.
  - **Skill Synergy & Overlap**: Maximizes tech stack breadth across squads.
  - **Domain Track Affinity**: Groups participants interested in similar hackathon tracks (e.g., FinTech, HealthTech).
  - **AI Balance Score**: Generates a percentage score ($0-100\%$) indicating squad balance.

### 4. 🏆 Team Results & Export
- Beautiful team cards with unique neon theme accents (`TEAM ALPHA`, `TEAM NEBULA`, `TEAM CYBER`, `TEAM QUANTUM`, etc.).
- Clearly displays every member with avatars, roles, experience, skills, and direct contact info.
- **Export Actions**:
  - 📋 **Copy Team Details**: Copies formatted summary to clipboard with toast notification.
  - 💾 **Download Team Details**: Exports individual squad report as a `.txt` file.
  - 📁 **Download All Teams**: Exports a full hackathon roster report.
  - 📋 **Copy All Teams Summary**: Instant global clipboard export.

### 5. 📧 Personalized Email Generator (`mailto:`)
- Automatically formats an individualized team assignment email for each hacker:
  - **Subject**: `🎯 Your Hackathon Team Has Been Assigned!`
  - **Body**: Includes the hacker's name, assigned team name, list of teammates with roles & emails, and welcome instructions.
- **1-Click Native Mail Client (`mailto:`)**:
  - Clicking **"Send Email"** opens Gmail / Outlook / Apple Mail with recipient, subject, and body pre-populated.
  - No backend, no SMTP, no Gmail API, and no n8n required.
  - Also includes a **"Copy Email Text"** button for easy pasting into webmail.
- **Batch Email Dispatcher**:
  - Dedicated dashboard listing all participants and their assigned teams with individual 1-click **Send Email** buttons.

---

## 🚀 How to Run the Application

This is a pure frontend application with **zero build steps** and **zero dependencies**.

### Option 1: Double-Click (Direct Browser Launch)
1. Navigate to the project folder:
   ```
   ai-hackathon-team-matcher/
   ```
2. Double-click **`index.html`** to open it in your browser (Google Chrome, Microsoft Edge, Firefox, Brave, Safari, etc.).

### Option 2: Using VS Code Live Server / Local HTTP Server
If you prefer running with a local development server:
```bash
# Using Python:
python -m http.server 8000

# Or using Node.js npx:
npx serve .
```
Then visit: `http://localhost:8000`

---

## 📂 Project Structure

```
ai-hackathon-team-matcher/
├── index.html       # Semantic HTML5 markup, accessible forms, modals, templates
├── style.css        # Modern dark UI theme, glassmorphism, responsive styles
├── app.js           # Core state management, simulated AI algorithm, mailto generator
└── README.md        # Documentation and beginner student guide
```

---

## 💡 How the Simulated AI Algorithm Works (For Students)

Organizers often face a challenge: *How do you build balanced teams where no team is missing a critical skill or has only beginners?*

In `app.js`, the `runAiMatchingAlgorithm()` function works in 4 easy-to-understand stages:

1. **Team Sizing**: Determines the number of team buckets based on organizer settings.
2. **Core Role Distribution**: Groups participants into key categories (`AI/ML`, `Frontend`, `Backend`, `UI/UX`). It sorts each role by experience (Advanced first) and uses round-robin assignment so each team gets at least one specialized anchor.
3. **Experience & Synergy Fill**: Remaining participants (`Full Stack`, `Mobile`, `DevOps`) are distributed into teams that have lower total experience scores or share domain interests (e.g. FinTech).
4. **Scoring**: Computes a balance score based on role diversity, mentorship balance, and skill variety.

---

## 💾 Data Persistence

All participant profiles, settings, and generated teams are automatically stored in the browser's `localStorage`. Refreshing or closing the tab will not lose your data. To start fresh, simply click **"🗑️ Reset All"**.
