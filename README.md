# 🛡️ Octodef

**Next-Gen Multi-Agent AI Cybersecurity Defense Platform**

Octodef is a cutting-edge security orchestration platform that leverages a "distributed nervous system" of 8 specialized AI agents to detect, analyze, and neutralize cyber threats in real-time. Inspired by the decentralized intelligence of an octopus, Octodef provides comprehensive protection across URLs, IPs, Emails, Hashes, and Network Logs.

![Octodef Dashboard](/public/og-image.png)

---

## 🧠 Core Architecture: The 8 Agents

Octodef isn't just a scanner; it's an orchestration engine. Our system deploys 8 autonomous agents that work in parallel:

1.  **🕵️ Scout**: Performs initial reconnaissance and data gathering.
2.  **🛡️ Sentinel**: Handles perimeter defense and signature-based checks.
3.  **🔬 Analyst**: Conducts deep heuristic analysis and malicious pattern detection.
4.  **🚧 Isolator**: Identifies threat containment strategies (Sandboxing).
5.  **💊 Remediator**: Generates automated response and recovery steps.
6.  **🎓 Learner**: Utilizes ML models to identify anomalies and zero-day patterns.
7.  **📢 Alerter**: Manages real-time notifications and severity escalation.
8.  **🕹️ Orchestrator**: The central brain that coordinates all agents and aggregates findings.

---

## ✨ Key Features

-   **📡 Real-Time Streaming**: Watch agents work in real-time as they stream analysis results directly to your dashboard.
-   **🕵️ Multi-Vector Defense**: Analyze diverse data types:
    -   **URLs**: Heuristic analysis, TLD checks, and Phishing detection.
    -   **IPs**: Geo-location, Reputation, and Abuse tracking.
    -   **Emails**: Header analysis, SPF/DKIM verification, and Spam scoring.
    -   **Logs**: Anomaly detection in network/system logs using ML.
    -   **Hashes**: File integrity and malware signature cross-referencing.
-   **🎮 3D Attack Simulation**: Visualize threat vectors in an interactive 3D viewport.
-   **⚡ High Performance**: Built on Next.js 15 for lightning-fast responsiveness.
-   **🔒 Secure by Design**: Robust rate-limiting and optional authentication for both guest and power users.

---

## 🚀 Tech Stack

-   **Frontend**: [Next.js 15](https://nextjs.org/), [Framer Motion](https://www.framer.com/motion/), [Tailwind CSS](https://tailwindcss.com/)
-   **Visualization**: [Three.js](https://threejs.org/) (3D Simulations)
-   **Backend**: Next.js API Routes (Edge-ready)
-   **Database**: [MongoDB](https://www.mongodb.com/)
-   **Auth**: [NextAuth.js](https://next-auth.js.org/)
-   **Intelligence**: Integration with VirusTotal, AbuseIPDB, Google Safe Browsing, and custom ML models.

---

## 🛠️ Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18+)
-   [pnpm](https://pnpm.io/) (v9+)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/iampraiez/Octodef.git
    cd Octodef
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Setup Environment Variables:**
    Create a `.env` file in the root directory and add the following:
    ```env
    # App Config
    NEXTAUTH_SECRET=your_secret
    NEXTAUTH_URL=http://localhost:3000

    # Auth Providers
    AUTH_GOOGLE_ID=...
    AUTH_GOOGLE_SECRET=...
    AUTH_GITHUB_ID=...
    AUTH_GITHUB_SECRET=...

    # Database
    MONGODB_URI=...

    # Security APIs
    VIRUSTOTAL_API_KEY=...
    ABUSEIPDB_API_KEY=...
    GOOGLE_SAFE_BROWSING_API_KEY=...
    HYBRID_ANALYSIS_API_KEY=...
    MALSHARE_API_KEY=...
    ```

4.  **Run Development Server:**
    ```bash
    pnpm dev
    ```

---

## 📂 Project Structure

```text
src/
├── app/          # Next.js App Router (Pages & API)
├── components/   # UI Components (Shadcn/UI based)
├── hooks/        # Custom React hooks (Queries & Mutations)
├── lib/          # Core Logic, DB, Auth & Defense Agents
│   ├── defense/  # Individual agent implementations
│   └── ...       # Utilities (Rate limiting, ML models)
└── types/        # TypeScript Interfaces
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🔗 Links

-   **GitHub Repository**: [https://github.com/iampraiez/Octodef](https://github.com/iampraiez/Octodef)
-   **Creator**: [iampraiez.vercel.app](https://iampraiez.vercel.app)

---

<p align="center">
  Made with ❤️ by <a href="https://iampraiez.vercel.app">iampraiez</a>
</p>
