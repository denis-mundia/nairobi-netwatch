import React, { useEffect, useState } from 'react';
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  Server, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Loader2,
  Download,
  Share2,
  RefreshCw,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, exportToCSV } from '../lib/utils';
import { RealTimeMetrics } from './RealTimeMetrics';
import { snmpService } from '../services/snmpService';
import { Alert, HistoricalTrend } from '../types';
import { toast } from 'sonner';

const StatCard = ({ title, value, subValue, icon: Icon, color, trend, loading }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        {loading ? (
          <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" />
        ) : (
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        )}
        <div className="flex items-center gap-1 mt-2">
          {!loading && trend !== undefined && trend !== 0 && (
            <>
              {trend > 0 ? (
                <span className="text-green-600 text-xs font-bold flex items-center">
                  <ArrowUpRight size={14} /> +{trend}%
                </span>
              ) : (
                <span className="text-red-600 text-xs font-bold flex items-center">
                  <ArrowDownRight size={14} /> {trend}%
                </span>
              )}
              <span className="text-slate-400 text-xs font-medium px-1">{subValue}</span>
            </>
          )}
          {!loading && trend === 0 && subValue && (
            <span className="text-slate-400 text-xs font-medium">{subValue}</span>
          )}
        </div>
      </div>
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </motion.div>
);

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<HistoricalTrend[]>([]);
  const [recentEvents, setRecentEvents] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sysStats, historicalTrends, alerts] = await Promise.all([
        snmpService.getSystemStats(),
        snmpService.getHistoricalTrends(30),
        snmpService.getAlerts()
      ]);
      setStats(sysStats);
      setTrends(historicalTrends);
      setRecentEvents(alerts.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('System data unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDiscover = async () => {
    setDiscovering(true);
    try {
      await snmpService.discoverDevices('192.168.1.0/24');
      toast.success('Network discovery complete. Systems identified.');
      await fetchData();
    } catch (error) {
      toast.error('Discovery failed');
    } finally {
      setDiscovering(false);
    }
  };

  const handleExport = () => {
    if (trends.length > 0) {
      exportToCSV(trends, 'network_dashboard_trends');
      toast.success('Dashboard report exported successfully');
    }
  };

  const complianceData = stats?.totalDevices > 0 ? [
    { name: 'Compliant', value: stats.avgSecurityScore ?? 0, color: '#10b981' },
    { name: 'Critical', value: 100 - (stats.avgSecurityScore ?? 0), color: '#ef4444' },
  ] : [];

  if (!loading && stats?.totalDevices === 0) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">System Intelligence</h2>
            <p className="text-slate-500">Network monitoring & security posture.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">No Telemetry Collected</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-8">
            The system has not yet identified any devices on the network. 
            Start a discovery scan to begin collecting real-time telemetry.
          </p>
          <button 
            onClick={handleDiscover}
            disabled={discovering}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <RefreshCw className={cn("w-5 h-5", discovering && "animate-spin")} />
            {discovering ? 'Scanning Subnet...' : 'Run Network Discovery'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">System Intelligence</h2>
          <p className="text-slate-500">Enterprise-grade network monitoring & security posture.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Download size={16} />
            Export PDF/CSV
          </button>
          <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95">
            System Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Devices"
          value={stats?.totalDevices || 0}
          subValue={stats?.totalDevices > 0 ? `${stats?.onlineDevices || 0} Online` : "No assets"}
          icon={Server}
          color="bg-blue-600"
          trend={0}
          loading={loading}
        />
        <StatCard 
          title="Uptime (30D)"
          value={stats?.uptime || "0%"}
          subValue={stats?.totalDevices > 0 ? "99.9% Target" : "N/A"}
          icon={Activity}
          color="bg-emerald-600"
          trend={0}
          loading={loading}
        />
        <StatCard 
          title="Avg Security Score"
          value={`${stats?.avgSecurityScore || 0}/100`}
          subValue={stats?.totalDevices > 0 ? "Across all nodes" : "No data"}
          icon={ShieldCheck}
          color="bg-indigo-600"
          trend={0}
          loading={loading}
        />
        <StatCard 
          title="Active Alerts"
          value={(stats?.criticalAlerts ?? 0).toString().padStart(2, '0')}
          subValue="Critical issues"
          icon={AlertTriangle}
          color="bg-rose-600"
          trend={0}
          loading={loading}
        />
      </div>

      <div className="pt-4">
        <RealTimeMetrics />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-slate-900">Response Time History</h3>
              <p className="text-xs text-slate-500">Network latency across critical infrastructure (ms)</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-slate-100 text-slate-900 px-3 py-1 rounded-md text-xs font-bold">7D</button>
              <button className="bg-white text-slate-400 px-3 py-1 rounded-md text-xs font-bold hover:text-slate-600">30D</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
            ) : trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                    unit="ms"
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avgResponseTime" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorRes)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center"><p className="text-slate-400 text-sm italic">No data collected</p></div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-8">
            <h3 className="font-bold text-slate-900">Security Distribution</h3>
            <p className="text-xs text-slate-500">Compliance health per device category</p>
          </div>
          <div className="h-[250px] w-full flex items-center justify-center">
            {loading ? (
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            ) : complianceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complianceData}
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {complianceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-sm italic">No data</p>
            )}
          </div>
          {!loading && complianceData.length > 0 && (
            <div className="space-y-4 mt-4">
              {complianceData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-semibold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-900">Critical Incident Feed</h3>
          <button className="text-blue-600 text-xs font-bold uppercase tracking-wider hover:underline">View All Logs</button>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? (
             <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 text-slate-300 animate-spin" /></div>
          ) : recentEvents.length > 0 ? (
            recentEvents.map((event) => (
              <div key={event.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                    event.severity === 'critical' ? "bg-red-50 text-red-600" : 
                    event.severity === 'high' ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                  )}>
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{event.message}</p>
                    <p className="text-xs text-slate-500">{event.source} \u2022 {event.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    event.severity === 'critical' ? "bg-red-600" : 
                    event.severity === 'high' ? "bg-orange-500" : "bg-blue-500"
                  )}>
                    {event.severity}
                  </span>
                  <Share2 size={14} className="text-slate-300 hover:text-slate-500" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-400 text-sm">Quiet night. No active critical incidents.</div>
          )}
        </div>
      </div>
    </div>
  );
};