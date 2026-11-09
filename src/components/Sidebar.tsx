import React from 'react';
import { 
  LayoutDashboard, 
  GitCompare, 
  History, 
  Settings, 
  User,
  FileText
} from 'lucide-react';
import { AppView } from '../types/comparison';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  analyzedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  analyzedCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as AppView,
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'new-comparison' as AppView,
      label: 'New Comparison',
      icon: GitCompare,
    },
    {
      id: 'history' as AppView,
      label: 'History',
      icon: History,
    },
    {
      id: 'profile' as AppView,
      label: 'Profile',
      icon: User,
      badge: analyzedCount > 0 ? `${analyzedCount * 2} docs` : undefined,
    },
    {
      id: 'settings' as AppView,
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleItemClick = (view: AppView) => {
    onNavigate(view);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-60 bg-white border-r border-[#E9EAF1] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#E9EAF1]">
          <div 
            onClick={() => handleItemClick('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#6558E8] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-[#171A2B]">
              DocuCheck <span className="text-[#6558E8]">AI</span>
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === 'new-comparison' && currentView === 'results');

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#F0EDFF] text-[#6558E8] font-semibold'
                    : 'text-[#777D91] hover:text-[#171A2B] hover:bg-[#F8F9FC]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#6558E8]' : 'text-[#777D91]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-[#6558E8]' : 'bg-[#F8F9FC] text-[#777D91]'
                  }`}>
                    {item.badge}
                  </span>
                ) : isActive ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#6558E8]" />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* User Mini Profile in Sidebar Footer */}
        <div 
          onClick={() => handleItemClick('profile')}
          className="p-3 border-t border-[#E9EAF1] cursor-pointer hover:bg-[#F8F9FC] transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#F0EDFF] text-[#6558E8] flex items-center justify-center font-bold text-xs shrink-0">
                TG
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-[#171A2B] truncate block">Tanya Garg</span>
                <span className="text-[10px] text-[#777D91] block truncate font-mono">
                  {analyzedCount * 2} docs analyzed
                </span>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-[#15966B] shrink-0" title="Online" />
          </div>
        </div>
      </aside>
    </>
  );
};
