
import React from 'react';
import { Category } from '../types';
import { User } from '../firebase';

interface SidebarProps {
  categories?: Category[];
  activeCategory?: Category;
  onSelectCategory?: (c: Category) => void;
  user: User;
  onLogout: () => void;
  onToggleManage: () => void;
  isManageMode?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  categories, 
  activeCategory, 
  onSelectCategory, 
  user, 
  onLogout, 
  onToggleManage,
  isManageMode = false
}) => {
  const getIcon = (category: Category) => {
    switch (category) {
      case Category.ALL: return 'fas fa-th-large';
      case Category.COFFEE: return 'fas fa-coffee';
      case Category.BAKERY: return 'fas fa-bread-slice';
      case Category.DESSERT: return 'fas fa-ice-cream';
      case Category.DRINK: return 'fas fa-wine-glass-alt';
      default: return 'fas fa-tag';
    }
  };

  return (
    <aside className="w-24 md:w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">
      <div className="p-8 flex items-center space-x-4 mb-6">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]">
          <i className="fas fa-terminal"></i>
        </div>
        <span className="font-black text-2xl hidden md:block text-white tracking-tighter">SPARK<span className="text-emerald-500">POS</span></span>
      </div>

      <nav className="flex-1 px-4 space-y-3 overflow-y-auto">
        {!isManageMode && categories && onSelectCategory && categories.map(cat => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all ${
              activeCategory === cat 
                ? 'bg-emerald-600 text-black shadow-[0_10px_20px_rgba(16,185,129,0.2)] scale-105' 
                : 'text-zinc-500 hover:bg-zinc-800 hover:text-emerald-400'
            }`}
          >
            <i className={`${getIcon(cat)} text-lg w-6 text-center`}></i>
            <span className="font-black text-sm hidden md:block uppercase tracking-wider">{cat}</span>
          </button>
        ))}

        <div className="pt-6 mt-6 border-t border-zinc-800">
          <button
            onClick={onToggleManage}
            className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all border ${
              isManageMode 
                ? 'bg-emerald-600 border-emerald-500 text-black shadow-lg scale-105' 
                : 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10'
            }`}
          >
            <i className={`fas ${isManageMode ? 'fa-shopping-cart' : 'fa-box-open'} text-lg w-6 text-center`}></i>
            <span className="font-black text-sm hidden md:block uppercase tracking-wider">{isManageMode ? 'Back' : 'Settings'}</span>
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-zinc-800 mt-auto">
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-4 p-4 text-zinc-500 hover:bg-red-500/10 hover:text-red-400 rounded-2xl transition-all"
        >
          <i className="fas fa-sign-out-alt text-lg w-6 text-center"></i>
          <span className="font-black text-sm hidden md:block uppercase tracking-wider">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
