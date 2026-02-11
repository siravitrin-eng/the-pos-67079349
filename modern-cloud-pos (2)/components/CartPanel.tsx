
import React from 'react';
import { CartItem } from '../types';

interface CartPanelProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onClear: () => void;
}

const CartPanel: React.FC<CartPanelProps> = ({ items, onUpdateQuantity, onClear }) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.07;
  const total = subtotal + tax;

  return (
    <aside className="w-80 md:w-96 bg-zinc-900 border-l border-zinc-800 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.5)] shrink-0 z-10">
      <div className="p-8 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Checkout</h2>
          <p className="text-[10px] text-emerald-500 uppercase font-black tracking-[0.2em] mt-1">Terminal Active</p>
        </div>
        {items.length > 0 && (
          <button 
            onClick={onClear}
            className="w-10 h-10 rounded-2xl bg-zinc-800 text-zinc-500 hover:bg-red-500/10 hover:text-red-500 border border-zinc-700 transition-all flex items-center justify-center active:scale-90"
            title="Clear Cart"
          >
            <i className="fas fa-trash-alt text-sm"></i>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-700 text-center">
            <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-cart-plus text-3xl opacity-20"></i>
            </div>
            <p className="font-black text-xs uppercase tracking-widest opacity-30">Cart Empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="group p-4 bg-zinc-800/50 rounded-3xl border border-zinc-700/50 hover:border-emerald-500/30 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-black text-white text-sm truncate uppercase tracking-tight">{item.title}</p>
                    <p className="text-[10px] text-emerald-500 font-bold">฿{item.price.toLocaleString()}</p>
                  </div>
                  <p className="font-black text-white text-sm">฿{(item.price * item.quantity).toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-700/50">
                  <div className="flex items-center space-x-3 bg-black/40 p-1.5 rounded-xl border border-zinc-800">
                    <button 
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-emerald-600 hover:text-black transition-all text-xs text-zinc-400"
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <span className="font-black text-white text-xs w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-emerald-600 hover:text-black transition-all text-xs text-zinc-400"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, -item.quantity)}
                    className="text-[10px] text-zinc-600 font-bold uppercase hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-8 bg-black/40 border-t border-zinc-800 space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider">
            <span>Subtotal</span>
            <span className="text-white">฿{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider">
            <span>VAT (7%)</span>
            <span className="text-white">฿{tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center pt-6 mt-6 border-t-2 border-dashed border-zinc-800">
            <span className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em]">Total</span>
            <span className="text-4xl font-black text-emerald-500 tracking-tighter shadow-emerald-500/10 drop-shadow-xl">
              ฿{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <button 
          disabled={items.length === 0}
          className="w-full bg-emerald-600 text-black py-5 rounded-[2rem] font-black text-xl shadow-[0_20px_40px_rgba(16,185,129,0.2)] hover:bg-emerald-500 hover:shadow-emerald-500/30 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale disabled:shadow-none uppercase tracking-[0.2em]"
        >
          Finalize Transaction
        </button>
        
        <div className="flex space-x-3 opacity-60 hover:opacity-100 transition-opacity">
          <button className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-400 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-700">Split Bill</button>
          <button className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-400 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-700">Coupon</button>
        </div>
      </div>
    </aside>
  );
};

export default CartPanel;
