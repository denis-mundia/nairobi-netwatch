# I-NETWATCH Python Implementation

This directory contains the parallel Python-native implementation of the I-NETWATCH system, built for rapid data visualization and monitoring tasks.

## 🚀 Tech Stack

- **UI Framework**: **Streamlit**
- **Data Visualization**: **Plotly** (Interactive, enterprise-grade charts)
- **Monitoring Service**: **pysnmp** (SNMP v1/v2c/v3 support)
- **Data Processing**: **Pandas**
- **Styling**: Streamlit Custom CSS

## ✨ Features Implemented

- [x] **Dashboard Overview**: KPI cards and real-time status summary.
- [x] **Real-time Metrics**: Visualizing device performance metrics (CPU, Memory, Traffic).
- [x] **Device Inventory**: Searchable and filterable table of network devices.
- [x] **Sidebar Navigation**: Efficient multi-page layout.
- [x] **Themed UI**: Modern, professional interface matching the React version.
- [x] **Compliance Checklist**: Initial security auditing framework.
- [x] **User Management**: RBAC (Admin, Network Engineer, Auditor) control logic.

## 📁 Structure

```text
python_version/
├── app.py                # Main application entry and routing
├── services/
│   └── snmp_service.py   # SNMP data collection & processing service
├── requirements.txt      # Python dependencies
└── README.md             # This file
```

## 🛠 Installation & Running

1. **Prerequisites**: Python 3.10+
2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Run the application**:
   ```bash
   streamlit run app.py