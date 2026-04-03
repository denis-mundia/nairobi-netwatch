import React from 'react';
import { 
  LayoutDashboard, 
  Server, 
  ShieldCheck, 
  BarChart3, 
  Users, 
  Settings, 
  Bell, 
  Search,
  LogOut,
  Menu,
  X,
  HelpCircle,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView }) => {
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'devices', label: 'Network Inventory', icon: Server },
    { id: 'compliance', label: 'Security & Policy', icon: ShieldCheck },
    { id: 'alerts', label: 'Incident Feed', icon: Bell, badge: '4' },
    { id: 'reports', label: 'Analytical Reports', icon: BarChart3 },
    { id: 'users', label: 'User & Audit Logs', icon: Users },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <span className="font-extrabold tracking-tighter text-lg">I-NETWATCH</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-slate-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <div className="flex h-[calc(100vh-64px)] lg:h-screen overflow-hidden">
        {/* Sidebar - Desktop */}
        <motion.aside 
          initial={false}
          animate={{ width: isSidebarOpen ? 280 : 88 }}
          className="hidden lg:flex flex-col bg-white border-r border-slate-200 relative z-40 shadow-sm"
        >
          <div className="p-6 flex items-center justify-between">
            <AnimatePresence mode="wait">
              {isSidebarOpen && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <ShieldCheck className="text-white w-5 h-5" />
                  </div>
                  <span className="font-black tracking-tighter text-xl text-slate-900 uppercase">I-Netwatch</span>
                </motion.div>
              )}
            </AnimatePresence>
            {!isSidebarOpen && (
               <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-blue-200">
                <ShieldCheck className="text-white w-5 h-5" />
              </div>
            )}
          </div>

          <div className="flex-1 px-4 space-y-1 py-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative group",
                  activeView === item.id 
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon size={20} className={cn(
                  "flex-shrink-0",
                  activeView === item.id ? "text-blue-400" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {isSidebarOpen && (
                  <span className="font-bold text-sm tracking-tight">{item.label}</span>
                )}
                {item.badge && isSidebarOpen && (
                  <span className="ml-auto bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                    {item.badge}
                  </span>
                )}
                {!isSidebarOpen && (
                   <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {item.label}
                   </div>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 mt-auto border-t border-slate-100">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className={cn("transition-transform", !isSidebarOpen && "rotate-180 mx-auto")} size={20} />
              {isSidebarOpen && <span className="font-bold text-sm">Collapse Menu</span>}
            </button>
          </div>
        </motion.aside>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="fixed inset-0 z-[60] bg-white lg:hidden flex flex-col"
            >
              <div className="p-4 flex items-center justify-between border-b">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="text-white w-5 h-5" />
                  </div>
                  <span className="font-extrabold tracking-tighter text-lg">I-NETWATCH</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)}><X size={24} /></button>
              </div>
              <div className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-lg font-bold",
                      activeView === item.id ? "bg-blue-600 text-white shadow-lg" : "text-slate-600"
                    )}
                  >
                    <item.icon size={24} />
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] relative">
          <div className="max-w-7xl mx-auto px-4 lg:px-10 py-8 lg:py-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;