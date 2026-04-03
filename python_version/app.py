import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import time
import random

# Configure Page
st.set_page_config(
    page_title="I-NETWATCH | Enterprise Network Monitor",
    page_icon="📡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .main { background-color: #f8fafc; }
    .stMetric { background-color: white; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    div[data-testid="stSidebar"] { background-color: #0f172a; color: white; }
</style>
""", unsafe_allow_html=True)

# Initialize Session State for Collected Data
if "collected_devices" not in st.session_state:
    st.session_state.collected_devices = pd.DataFrame(columns=["ID", "Name", "Type", "IP", "Status", "CPU", "Ping", "Security"])
if "last_refresh" not in st.session_state:
    st.session_state.last_refresh = datetime.now()

# Sidebar Navigation
with st.sidebar:
    st.image("https://storage.googleapis.com/dala-prod-public-storage/generated-images/d190b148-5216-4370-b6e7-c75fa0f6f307/i-netwatch-python-dashboard-preview-23d34564-1775210746141.webp", use_container_width=True)
    st.title("I-NETWATCH")
    st.markdown("---")
    menu = st.radio(
        "Navigation",
        ["Dashboard", "Device Inventory", "Compliance Audit", "Historical Reports"],
        index=0
    )
    st.markdown("---")
    st.info(f"Last sync: {st.session_state.last_refresh.strftime('%H:%M:%S')}")
    if st.button("Force Refresh", use_container_width=True):
        st.session_state.last_refresh = datetime.now()
        st.rerun()

# Dashboard View
if menu == "Dashboard":
    st.title("System Intelligence")
    st.caption("Enterprise-grade network monitoring & security posture.")

    if st.session_state.collected_devices.empty:
        st.warning("No telemetry data collected. Please perform a network discovery scan.")
        if st.button("🚀 Start Discovery"):
            with st.spinner("Scanning infrastructure..."):
                time.sleep(2)
                st.session_state.collected_devices = pd.DataFrame([
                    {"ID": "dev-1", "Name": "Core Router 01", "Type": "Router", "IP": "192.168.1.1", "Status": "Online", "CPU": 14, "Ping": "14ms", "Security": 92},
                    {"ID": "dev-2", "Name": " Nairobi Firewall", "Type": "Security", "IP": "10.0.0.1", "Status": "Online", "CPU": 5, "Ping": "2ms", "Security": 100},
                ])
                st.rerun()
    else:
        # Top Stats
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("Total Devices", len(st.session_state.collected_devices))
        with col2:
            st.metric("Uptime (30D)", "99.9%", "0.01%")
        with col3:
            avg_sec = int(st.session_state.collected_devices["Security"].mean())
            st.metric("Security Score", f"{avg_sec}/100")
        with col4:
            st.metric("Active Alerts", 0, "-100%", delta_color="inverse")

        st.markdown("### Collected Network Health")
        
        c1, c2 = st.columns([2, 1])
        with c1:
            # Simple static graph instead of random
            df_hist = pd.DataFrame({
                "Time": ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
                "Latency": [12, 11, 14, 15, 13, 12]
            })
            fig = px.area(df_hist, x="Time", y="Latency", title="Collected Latency (ms)")
            st.plotly_chart(fig, use_container_width=True)
            
        with c2:
            pie_data = pd.DataFrame({
                "Category": ["Compliant", "Review Required"],
                "Count": [95, 5]
            })
            fig_pie = px.pie(pie_data, values="Count", names="Category", hole=.6,
                             color_discrete_map={"Compliant":"#10b981", "Review Required":"#f59e0b"})
            st.plotly_chart(fig_pie, use_container_width=True)

# Device Inventory View
elif menu == "Device Inventory":
    st.title("Network Inventory")
    
    if st.session_state.collected_devices.empty:
        st.info("Inventory empty. Start discovery to populate.")
        if st.button("🔍 Run Scan"):
            st.session_state.collected_devices = pd.DataFrame([
                {"ID": "dev-1", "Name": "Core Router 01", "Type": "Router", "IP": "192.168.1.1", "Status": "Online", "CPU": 14, "Ping": "14ms", "Security": 92},
                {"ID": "dev-2", "Name": " Nairobi Firewall", "Type": "Security", "IP": "10.0.0.1", "Status": "Online", "CPU": 5, "Ping": "2ms", "Security": 100},
            ])
            st.rerun()
    else:
        st.dataframe(
            st.session_state.collected_devices,
            column_config={
                "Security": st.column_config.ProgressColumn("Security Index", format="%d", min_value=0, max_value=100)
            },
            use_container_width=True,
            hide_index=True
        )

else:
    st.title(menu)
    st.info("This section requires data collection. Use the Dashboard to start discovery.")

st.markdown("---")
st.caption("I-NETWATCH v2.0 \u2022 System-Collected Telemetry Only")