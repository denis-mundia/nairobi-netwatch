import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  MoreVertical, 
  History, 
  Activity, 
  Clock, 
  Search, 
  Filter, 
  Mail, 
  Lock, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Eye,
  Terminal,
  Server,
  ArrowRight
} from 'lucide-react';
import { cn, formatTimestamp } from '../lib/utils';
import { snmpService } from '../services/snmpService';
import { User, ActivityLog, UserRole } from '../types';
import { toast } from 'sonner';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [u, l] = await Promise.all([
          snmpService.getUsers(),
          snmpService.getActivityLogs()
        ]);
        setUsers(u);
        setLogs(l);
      } catch (error) {
        toast.error('Failed to load user management data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin': return <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border border-red-100 flex items-center gap-1.5"><ShieldAlert className="w-3 h-3" /> Admin</span>;
      case 'engineer': return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border border-blue-100 flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Engineer</span>;
      case 'auditor': return <span className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border border-slate-100 flex items-center gap-1.5"><Eye className="w-3 h-3" /> Auditor</span>;
      default: return null;
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = logs.filter(l => 
    l.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" />
            Control access and track system activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold transition-all shadow-sm">
            <History className="w-4 h-4" />
            Policy Editor
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-200">
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 px-8 items-center justify-between">
          <div className="flex">
            <button 
              onClick={() => setActiveTab('users')}
              className={cn(
                "py-4 px-6 text-sm font-bold transition-all relative",
                activeTab === 'users' ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Active Users
              {activeTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={cn(
                "py-4 px-6 text-sm font-bold transition-all relative",
                activeTab === 'logs' ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Audit & Activity Logs
              {activeTab === 'logs' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
            </button>
          </div>
          <div className="relative max-w-xs w-full hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-lg py-1.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium">Loading security credentials...</p>
            </div>
          ) : activeTab === 'users' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Identity</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role & Permissions</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Last Active</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-600 font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-8 py-5 text-sm font-medium text-slate-600">
                        {formatTimestamp(user.lastLogin)}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-white border border-slate-100 rounded-lg shadow-sm">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white border border-slate-100 rounded-lg shadow-sm">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
              {filteredLogs.map((log) => (
                <div key={log.id} className="px-8 py-5 hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{log.userName}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{log.action}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatTimestamp(log.timestamp)}</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        Performed action on <span className="font-bold text-slate-800">{log.target || 'System'}</span>
                      </p>
                      {log.details && (
                        <p className="text-xs text-slate-400 mt-1 font-mono">{log.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-slate-50/50 border-t border-slate-100 px-8 py-4 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing {activeTab === 'users' ? filteredUsers.length : filteredLogs.length} total entries</p>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 cursor-not-allowed"><ArrowRight className="w-4 h-4 rotate-180" /></button>
            <button className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"><ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;