import React, { useEffect, useState } from 'react';
import { 
  History, 
  TrendingUp, 
  Clock, 
  Calendar,
  Download,
  Search,
  ChevronRight,
  Loader2,
  Activity,
  Zap,
  ShieldCheck,
  Server,
  Database
} from 'lucide-react';
import { cn, exportToCSV, formatTimestamp } from '../lib/utils';
import { snmpService } from '../services/snmpService';
import { HistoricalTrend, SLAReport } from '../types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import { toast } from 'sonner';

export const HistoricalAnalytics: React.FC = () => {
  const [trends, setTrends] = useState<HistoricalTrend[]>([]);
  const [slaReports, setSlaReports] = useState<SLAReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<7 | 30>(7);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [trendData, slaData] = await Promise.all([
          snmpService.getHistoricalTrends(timeRange),
          snmpService.getSLAReport(timeRange === 7 ? 7 : 30)
        ]);
        setTrends(trendData);
        setSlaReports(slaData);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        toast.error('Sync failed');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const handleExport = () => {
    if (slaReports.length === 0) {
      toast.error('No historical data available for export');
      return;
    }
    exportToCSV(slaReports, `sla_report_${timeRange}d`);
    toast.success('Historical report exported (CSV)');
  };

  if (!loading && slaReports.length === 0) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Historical & SLA Insights</h2>
            <p className="text-slate-500">Auditing performance and availability metrics.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Database className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">No Historical Data</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-8">
            Long-term analytics are only available after the system has completed its initial discovery and monitoring cycles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Historical & SLA Insights</h2>
          <p className="text-slate-500">Auditing long-term performance and availability metrics.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
             <button 
              onClick={() => setTimeRange(7)} 
              className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all", timeRange === 7 ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}
             >
               7D
             </button>
             <button 
              onClick={() => setTimeRange(30)} 
              className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all", timeRange === 30 ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}
             >
               30D
             </button>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
          >
            <Download size={18} />
            Export PDF/CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-slate-900">Peak Usage Identification</h3>
              <p className="text-xs text-slate-500">Global bandwidth utilization peaks (Gbps)</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
               <Zap size={20} />
            </div>
          </div>
          <div className="h-[300px] w-full">
            {loading ? (
               <div className="h-full w-full flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="timestamp" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10}}
                    tickFormatter={(val) => {
                      if (!val) return '';
                      return new Date(val).toLocaleDateString([], { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10}}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="peakUsage" 
                    stroke="#2563eb" 
                    fillOpacity={1} 
                    fill="url(#colorPeak)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-slate-900">Historical Security Trends</h3>
              <p className="text-xs text-slate-500">Compliance score movement over time</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
               <ShieldCheck size={20} />
            </div>
          </div>
          <div className="h-[300px] w-full">
            {loading ? (
               <div className="h-full w-full flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="timestamp" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10}}
                    tickFormatter={(val) => {
                      if (!val) return '';
                      return new Date(val).toLocaleDateString([], { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10}}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar 
                    dataKey="securityScore" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-black text-slate-900">SLA Compliance Report</h3>
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Uptime Target: 99.9%</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-medium">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Device Node</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Uptime (%)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                 <tr>
                   <td colSpan={3} className="px-6 py-12 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td>
                 </tr>
              ) : slaReports.map(report => (
                <tr key={report.deviceId} className="hover:bg-slate-50 transition-all group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        <Server size={14} />
                      </div>
                      <p className="text-sm font-black text-slate-900">{report.deviceName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="flex-1 h-1.5 bg-slate-100 rounded-full w-24">
                          <div 
                            className={cn("h-full rounded-full transition-all", report.isCompliant ? "bg-green-500" : "bg-red-500")} 
                            style={{ width: `${report.uptimePercentage}%` }} 
                          />
                       </div>
                       <span className="text-xs font-black text-slate-900">{report.uptimePercentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      report.isCompliant ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                    )}>
                      {report.isCompliant ? 'Compliant' : 'SLA Breach'}
                    </span>
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