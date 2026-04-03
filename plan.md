# Plan: Remove Mock Data and Ensure System-Only Telemetry

This plan outlines the steps to remove hardcoded mock data and ensure that all displayed information originates from the system's collection mechanisms (SNMP discovery/polling).

## 1. Update SNMP Service (`src/services/snmpService.ts`)
- Add `getTopology()` to dynamically generate network topology based on discovered devices.
- Refine `getSystemStats()`, `getHistoricalTrends()`, and `getSLAReport()` to ensure they only return data derived from `collectedDevices`.
- Remove default "99.9%" values when no data is present.
- Ensure initial states of all data arrays are strictly empty.

## 2. Refactor Network Topology (`src/components/NetworkTopology.tsx`)
- Remove hardcoded `nodes` and `connections` constants.
- Implement data fetching from `snmpService.getTopology()`.
- Add a "No Topology Data" empty state with a "Run Discovery" trigger, similar to the Dashboard.

## 3. Clean up Dashboard (`src/components/Dashboard.tsx`)
- Remove fallback strings like `"99.9%"` from StatCards.
- Ensure `complianceData` correctly reflects the empty state.
- Verify that the "No Telemetry Collected" state covers all scenarios where discovery hasn't run.

## 4. Fix Hardcoded Compliance Posture (`src/components/Compliance.tsx`)
- Replace hardcoded "Met" security posture items with dynamic data derived from the compliance audit results.
- Ensure the "Security Posture" summary section accurately reflects the system state.

## 5. Refine Reports & Analytics (`src/components/Reports.tsx`)
- Update summary cards to use actual data (e.g., real alert counts) instead of ternary mock logic.
- Ensure charts show "No data" instead of empty axes when no trends exist.

## 6. General Verification
- Audit all components for `|| "some value"` patterns that provide fake data.
- Ensure loading spinners and empty states are used consistently while waiting for real telemetry.
