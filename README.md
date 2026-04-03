# I-NETWATCH: Enterprise Network Monitoring & Compliance System

A comprehensive network management and security auditing platform designed for enterprise network infrastructure (e.g., Nairobi County Government). This system provides real-time monitoring, security compliance checks, and detailed reporting to ensure network integrity and performance.

## 🚀 Tech Stack

- **Frontend**: React 19 (Vite), TypeScript
- **Styling**: Tailwind CSS
- **Components**: Shadcn/UI, Lucide React (Icons), Framer Motion (Animations)
- **Data Visualization**: Recharts (via Shadcn Chart)
- **Monitoring**: SNMP v2c/v3 Service Integration
- **Backend/Auth**: Supabase (Auth, Database)

## ✨ Key Implemented Features

- **I-NETWATCH Dashboard**: Central hub with real-time health status, critical alerts, and compliance summaries.
- **Network Device Discovery & Inventory**: Automatic discovery and cataloging of devices with status, basic info, and real-time health monitoring (Ping, HTTP, HTTPS, DNS, SSH).
- **Real-time Performance Metrics**: Live CPU, Memory, and Traffic charts powered by SNMP data.
- **Security Compliance Checks**: 
    - Open port scanning and default password detection.
    - Outdated software detection and security scoring (0-100%).
    - Compliance status indicators and visual scoring.
- **Advanced Reporting**: 
    - Summary cards and uptime trends.
    - Response time history and security score distribution.
    - PDF/CSV data export for auditing.
- **User Management & RBAC**: Role-based access control with distinct views for Admin, Network Engineer, and Auditor.
- **Historical Data & Analytics**: Performance trends (7/30 days), SLA reporting, and peak usage identification.
- **SNMP Configuration**: Interface for managing SNMP settings (v2c/v3), interface utilization, and device health metrics.
- **Network Topology**: Visual representation of network mapping and device connectivity.

## 📁 Project Structure

```text
.
├── src/
│   ├── components/           # Core feature components
│   │   ├── ui/               # Reusable Shadcn/UI base components
│   │   ├── Alerts.tsx        # System-wide critical alerts and notifications
│   │   ├── Compliance.tsx    # Security audit and compliance scoring
│   │   ├── Dashboard.tsx     # Central overview and network health summary
│   │   ├── Devices.tsx       # Device inventory and status monitoring
│   │   ├── HistoricalAnalytics.tsx # Performance trends and SLA reporting
│   │   ├── Layout.tsx        # Main application shell (sidebar, navigation)
│   │   ├── NetworkTopology.tsx # Visual network mapping (topology)
│   │   ├── RealTimeMetrics.tsx # Live CPU, Memory, and Traffic visualization
│   │   ├── Reports.tsx       # PDF/CSV data export and summary reports
│   │   └── UserManagement.tsx # RBAC control
│   ├── services/             # API and external integrations
│   │   └── snmpService.ts    # SNMP data collection and metric processing
│   ├── types/                # TypeScript interface definitions
│   │   └── index.ts          # Global types for devices, metrics, and logs
│   ├── App.tsx               # Root component and navigation state
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles and Tailwind directives
├── python_version/           # Parallel Python implementation (Streamlit)
├── package.json              # Project dependencies and scripts
└── vite.config.ts            # Vite build and plugin configuration
```

## 🛠 Available Scripts

- `npm run dev`: Starts the development server at `http://localhost:3000`.
- `npm run build`: Compiles the application for production.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run typecheck`: Runs the TypeScript compiler to check for type errors.