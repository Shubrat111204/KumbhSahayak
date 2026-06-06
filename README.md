# KumbhSahayak 🕉️
### Smart Volunteer Deployment & Workforce Optimization Platform

**KumbhSahayak** is a state-of-the-art, high-fidelity operations dashboard designed to manage, route, and optimize volunteer workforces in real-time during the massive **Mahakumbh** congregation. 

Built with a premium glassmorphic dark-theme design, the application provides command center operators with instant tactical maps, automated heuristic matching, and a live dispatch simulation.

---

## 🌟 Key Features

*   **Interactive Tactical Command Map**: A custom-drawn responsive SVG map representing Mahakumbh sectors (Sangam, Railway Hub, Pilgrim Camps, Pontoon Bridges) with live crowd density alerts (Low, Moderate, Surge).
*   **AI-Match Heuristic Engine**: Instantly ranks standby volunteers based on a 3-factor fitness percentage:
    *   **Proximity (40%)**: Calculates coordinate-based Euclidean distance converted to mock meters.
    *   **Skill Set Fit (40%)**: Matches specialized roles (First Aid, Crowd Control, Disaster Mgmt) to incoming incidents.
    *   **Language Compatibility (20%)**: Matches regional pilgrim languages (Hindi, Telugu, Tamil, Bengali, English) for effective communication.
*   **Real-time Dispatch Simulation**: Visualizes volunteer dispatch on the map by drawing dynamically calculated vector routes and animating volunteer markers walking to incident coordinates.
*   **Tactical Communications Log**: A live command center console logging system boots, alerts, SMS broadcasts, dispatches, and emergency mitigations.
*   **Operator Control Panel**: Allows administrators to trigger preset emergency scenarios (Crowd Surges, Medical alerts, Lost pilgrim cases) or manually register new incidents and volunteers.

---

## 🛠️ Technology Stack

Designed to be lightweight, high-performance, and self-contained to operate in local web environments without package manager overhead or server-side CORS limitations:

*   **Core Structure**: HTML5 (Semantic Layout)
*   **Styling & Design System**: CSS3 (Vanilla Variables, Grid/Flexbox layouts, Glassmorphism, Pulse/Dash keyframe animations)
*   **Simulation Logic & State Management**: JavaScript ES6 (Custom interpolation tick loops, Heuristic matching algorithm)
*   **Graphics**: Scalable Vector Graphics (SVG) with dynamic layer rendering

---

## 🚀 Quick Setup & Execution

Since the project has **zero external server dependencies**, you can run it locally in seconds:

1.  Clone this repository or download the source files.
2.  Double-click `index.html` to open it in any modern web browser (Chrome, Edge, Firefox, or Safari).
3.  *Alternative (if you want to run a local server)*:
    ```bash
    # If Python is installed, run:
    python -m http.server 8000
    ```
    Then visit `http://localhost:8000` in your browser.

---

## 🧭 How to Test the Simulator

1.  **Check Open Alerts**: On page load, the system automatically spawns a medical alert at the Pontoon Bridge.
2.  **Select & Analyze**: Click on the alert card in the **Alerts Feed** (Right Column). The AI Workforce Console will slide open showing the top 3 matching volunteers with detailed percentage scores.
3.  **Dispatch**: Click **Deploy** on the top match. You will see:
    *   An SMS notification logged in the system log.
    *   A dashed route line drawn on the map.
    *   The volunteer dot moving across the map in real-time.
4.  **Resolve**: Once the volunteer reaches the incident, they spend 4 seconds mitigating the issue, after which the incident updates to "Resolved" and the volunteer returns to "Standby".

---

## 👨‍💻 Author

Developed with 🧡 by **SHUBRAT MISHRA** (Registration Number: `23BCE10340`) for the hackathon challenge. Expert Hire <> VIT Bhopal - Mahakumbh MP Hackathon

