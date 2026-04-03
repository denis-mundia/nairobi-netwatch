import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Calendar, 
  Download, 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Filter, 
  ChevronDown,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Server,
  FileSearch
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  ComposedChart
} from 'recharts';
import { cn, exportToCSV, exportToPDF, formatTimestamp } from '../lib/utils';
import { snmpService } from '../services/snmpService';
import { HistoricalTrend, SLAReport, Device, Alert } from '../types';
import { toast } from 'sonner';

const Reports: React.FC = () => {
  const [trends, setTrends] = useState<HistoricalTrend[]>([]);
  const [slaReports, setSlaReports] = useState<SLAReport[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [t, s, d, a] = await Promise.all([
          snmpService.getHistoricalTrends(timeRange === '7d' ? 7 : 30),
          snmpService.getSLAReport(timeRange === '7d' ? 7 : 30),
          snmpService.getDevices(),
          snmpService.getAlerts()
        ]);
        setTrends(t);
        setSlaReports(s);
        setDevices(d);
        setAlerts(a);
      } catch (error) {
        toast.error('Failed to load analytical data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  const handleExportCSV = () => {
    if (slaReports.length === 0) {
      toast.error('No performance data to export');
      return;
    }
    const data = slaReports.map(report => ({
      Device: report.deviceName,
      'Uptime %': report.uptimePercentage,
      'Downtime': report.totalDowntime,
      'SLA Target %': report.slaTarget,
      Compliant: report.isCompliant ? 'YES' : 'NO'
    }));
    exportToCSV(data, `SLA_Report_${timeRange}`);
    toast.success('SLA Report exported as CSV');
  };

  const handleExportPDF = () => {
    if (slaReports.length === 0) {
      toast.error('No performance data to export');
      return;
    }
    const data = slaReports.map(report => ({
      Device: report.deviceName,
      'Uptime %': report.uptimePercentage,
      'SLA Target %': report.slaTarget,
      Compliant: report.isCompliant ? 'YES' : 'NO'
    }));
    exportToPDF(data, `Network Performance Report (${timeRange})`, `NetPulse_Report_${timeRange}`);
    toast.success('Performance Report exported as PDF');
  };

  const avgUptime = slaReports.length > 0 
    ? slaReports.reduce((acc, curr) => acc + curr.uptimePercentage, 0) / (slaReports.length || 1)
    : 0;
  const peakTraffic = trends.length > 0 ? Math.max(...trends.map(t => t.traffic)) : 0;

  if (!loading && devices.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reports & Analytics</h1>
            <p className="text-slate-500 mt-1 font-medium">Historical performance and SLA compliance</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <FileSearch className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">No Analytical Data</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-8">
            The performance database is currently empty. 
            Once devices are discovered and monitored, historical reports will be generated here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-500" />
            Historical performance and SLA compliance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex gap-1 shadow-sm">
            <button 
              onClick={() => setTimeRange('7d')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                timeRange === '7d' ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              7 Days
            </button>
            <button 
              onClick={() => setTimeRange('30d')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                timeRange === '30d' ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              30 Days
            </button>
          </div>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-200"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Avg Network Uptime', value: `${avgUptime.toFixed(2)}%`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Peak Usage', value: `${peakTraffic.toFixed(0)} Mbps`, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'SLA Compliant Devices', value: `${slaReports.filter(s => s.isCompliant).length}/${slaReports.length}`, icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Active Alerts', value: alerts.length.toString(), icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className={cn("p-2 rounded-xl inline-flex mb-4", stat.bg, stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-extrabold text-slate-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Infrastructure Performance Trends</h3>
              <p className="text-sm text-slate-500">Correlation between uptime and response time</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span> Uptime %
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span> Latency (ms)
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="timestamp" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(val) => new Date(val).toLocaleDateString()}
                />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} domain={[95, 100]} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  labelFormatter={(val) => formatTimestamp(val)}
                />
                <Area yAxisId="left" type="monotone" dataKey="uptime" fill="#3b82f6" fillOpacity={0.05} stroke="#3b82f6" strokeWidth={3} />
                <Line yAxisId="right" type="monotone" dataKey="avgResponseTime" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Peak Usage Analysis</h3>
          <p className="text-sm text-slate-500 mb-8">Identification of high-load intervals</p>
          
          <div className="flex-1 space-y-6">
            {trends.length > 0 ? trends.slice(-5).reverse().map((t, i) => (
              <div key={i} className="relative pl-6 pb-6 border-l-2 border-slate-100 last:pb-0 last:border-0">
                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-purple-500"></div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">{new Date(t.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded uppercase">Peak Load</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">{t.peakUsage.toFixed(0)} Mbps at 14:30 PM</h4>
                <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(t.peakUsage / 1000) * 100}%` }}></div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-slate-400 italic">No usage data</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Device SLA Reporting</h3>
            <p className="text-sm text-slate-500 mt-1">Detailed uptime metrics against organizational targets</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Device Name</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Uptime Percentage</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">SLA Target</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {slaReports.map((report) => (
                <tr key={report.deviceId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Server className="w-4 h-4 text-slate-500" />
                      </div>
                      <span className="text-sm font-bold text-slate-900">{report.deviceName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            report.uptimePercentage >= report.slaTarget ? "bg-green-500" : "bg-red-500"
                          )}
                          style={{ width: `${report.uptimePercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-extrabold text-slate-700">{report.uptimePercentage.toFixed(2)}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-500">{report.slaTarget}%</td>
                  <td className="px-8 py-6">
                    {report.isCompliant ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-green-600 uppercase bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                        <CheckCircle2 className="w-3 h-3" /> Met
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-red-600 uppercase bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                        <XCircle className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;