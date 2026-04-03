import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Trash2, 
  Search,
  Filter,
  Check,
  Loader2,
  ChevronRight,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { snmpService } from '../services/snmpService';
import { Alert } from '../types';

export const AlertCenter: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const data = await snmpService.getAlerts();
        setAlerts(data);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
    toast.success('Incident dismissed from active monitoring');
  };

  const acknowledgeAll = () => {
    setAlerts(alerts.map(a => ({ ...a, acknowledged: true })));
    toast.success('Global acknowledgement synchronized');
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = a.message.toLowerCase().includes(search.toLowerCase()) ||
                          a.source.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || a.severity === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Operational Incident Feed</h2>
          <p className="text-slate-500">Enterprise alerting infrastructure and real-time response.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={acknowledgeAll}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-all"
          >
            <Check size={18} />
            Acknowledge All
          </button>
          <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95">
            Incident Controls
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by node IP, message or source..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border-transparent rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-xl">
          {['all', 'critical', 'high', 'medium'].map((level) => (
            <button 
              key={level}
              onClick={() => setFilter(level)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                level === filter ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Syncing Incident Stream...</p>
          </div>
        ) : filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div key={alert.id} className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6 hover:border-blue-300 transition-all relative overflow-hidden">
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1.5",
                alert.severity === 'critical' ? "bg-red-600" :
                alert.severity === 'high' ? "bg-orange-500" :
                alert.severity === 'medium' ? "bg-blue-500" : "bg-slate-300"
              )} />
              
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 shadow-inner",
                alert.severity === 'critical' ? "bg-red-50 text-red-600" :
                alert.severity === 'high' ? "bg-orange-50 text-orange-600" :
                alert.severity === 'medium' ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-600"
              )}>
                {alert.severity === 'critical' ? <ShieldAlert size={28} /> :
                 alert.severity === 'high' ? <Zap size={28} /> :
                 alert.severity === 'medium' ? <Bell size={28} /> : <Info size={28} />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border",
                    alert.severity === 'critical' ? "bg-red-50 text-red-700 border-red-200" :
                    alert.severity === 'high' ? "bg-orange-50 text-orange-700 border-orange-200" :
                    alert.severity === 'medium' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-700 border-slate-200"
                  )}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sync ID: #{alert.id.slice(0, 6)}</span>
                </div>
                <h4 className="font-black text-slate-900 text-lg leading-tight truncate">{alert.message}</h4>
                <div className="flex items-center gap-4 mt-2">
                   <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-slate-300" />
                      Origin: {alert.source}
                   </p>
                   <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-slate-300" />
                      Timestamp: {alert.timestamp}
                   </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toast.info('Maintenance ticket created in JIRA')}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Deploy Engineer
                </button>
                <button 
                  onClick={() => removeAlert(alert.id)}
                  className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-32 text-center bg-white rounded-2xl border border-slate-200 shadow-inner">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Optimal System State</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">No incidents detected by the global network sensor array at this moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};