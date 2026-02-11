
import React, { useState, useMemo, useEffect } from 'react';
import { User, db } from '../firebase';
import { Product, CartItem, Category } from '../types';
import { CATEGORIES } from '../constants';
import Sidebar from './Sidebar';
import CartPanel from './CartPanel';
import ProductCard from './ProductCard';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';

interface POSInterfaceProps {
  user: User;
  onLogout: () => void;
  onToggleManage: () => void;
}

const POSInterface: React.FC<POSInterfaceProps> = ({ user, onLogout, onToggleManage }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.ALL);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        setProducts(items);
        setError(null);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError(err.code === 'permission-denied' ? "permission-denied" : "Error connecting database");
      }
    );
    return () => unsubscribe();
  }, []);

  const seedSampleData = async () => {
    setIsSeeding(true);
    const samples = [
      {
        title: 'Caramel Macchiato',
        price: 75,
        unit: 'แก้ว',
        detail: 'กาแฟเอสเพรสโซ่ผสมนมสดและคาราเมลหอมหวาน',
        image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=400&auto=format&fit=crop',
        category: Category.COFFEE,
        status: 'In Stock'
      },
      {
        title: 'Strawberry Shortcake',
        price: 95,
        unit: 'ชิ้น',
        detail: 'เค้กวานิลลาเนื้อนุ่มสลับชั้นกับครีมสดและสตรอว์เบอร์รี่สด',
        image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=400&auto=format&fit=crop',
        category: Category.DESSERT,
        status: 'In Stock'
      },
      {
        title: 'Matcha Green Tea',
        price: 65,
        unit: 'แก้ว',
        detail: 'มัทฉะแท้จากญี่ปุ่น ผสมนมสดรสชาติกลมกล่อม',
        image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=400&auto=format&fit=crop',
        category: Category.DRINK,
        status: 'In Stock'
      }
    ];

    try {
      for (const item of samples) {
        await addDoc(collection(db, 'products'), { ...item, createdAt: serverTimestamp() });
      }
    } catch (err: any) {
      alert("Error adding samples");
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === Category.ALL || p.category === selectedCategory;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && p.status === 'In Stock';
    });
  }, [selectedCategory, searchQuery, products]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const clearCart = () => { if (window.confirm("ล้างตะกร้าสินค้า?")) setCart([]); };

  const userName = user.isAnonymous ? "Guest User" : (user.displayName || user.email || "User");
  const userPhoto = user.photoURL || `https://ui-avatars.com/api/?name=${userName}&background=10b981&color=000`;

  if (error === "permission-denied") {
    return (
      <div className="flex h-screen bg-zinc-950 items-center justify-center p-6 text-white">
        <div className="bg-zinc-900 rounded-[3rem] p-12 max-w-2xl w-full shadow-2xl text-center border border-zinc-800">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
            <i className="fas fa-lock text-red-500 text-4xl"></i>
          </div>
          <h2 className="text-3xl font-black mb-4">Database Permission Required</h2>
          <p className="text-zinc-500 font-medium mb-8">Please check your Firestore rules to enable read/write access.</p>
          <pre className="bg-black/50 p-6 rounded-3xl text-emerald-400 font-mono text-xs text-left overflow-x-auto mb-8">
{`allow read: if true;
allow write: if request.auth != null;`}
          </pre>
          <a href="https://console.firebase.google.com/" target="_blank" className="bg-emerald-600 text-black px-8 py-3 rounded-2xl font-bold">Open Console</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden text-gray-100">
      {lightboxImage && (
        <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <span className="close-btn">&times;</span>
          <img src={lightboxImage} className="lightbox-content" alt="Preview" />
        </div>
      )}

      <Sidebar 
        categories={CATEGORIES} 
        activeCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
        user={user}
        onLogout={onLogout}
        onToggleManage={onToggleManage}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-zinc-900 border-b border-zinc-800 px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex-1 max-w-md relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"></i>
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-11 pr-4 py-3 bg-zinc-800 rounded-2xl border border-zinc-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none text-sm text-white placeholder:text-zinc-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden sm:block text-right">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Store</p>
              <p className="text-sm font-bold text-white">{userName}</p>
            </div>
            <img src={userPhoto} alt="Profile" className="w-11 h-11 rounded-2xl border-2 border-zinc-800 shadow-lg" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Collection <span className="text-emerald-500">/ {selectedCategory}</span>
            </h1>
            <div className="w-12 h-1.5 bg-emerald-500 rounded-full mt-3"></div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAdd={() => addToCart(product)} 
                onImageClick={setLightboxImage}
              />
            ))}
          </div>

          {products.length === 0 && !error && (
            <div className="h-full flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                <i className="fas fa-shopping-basket text-emerald-500 text-3xl"></i>
              </div>
              <p className="text-zinc-400 font-bold text-lg text-center mb-8">No items in database</p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={seedSampleData}
                  disabled={isSeeding}
                  className="bg-emerald-600 text-black px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-3"
                >
                  <i className={`fas ${isSeeding ? 'fa-spinner fa-spin' : 'fa-bolt'}`}></i>
                  <span>{isSeeding ? 'Generating...' : 'Seed Sample Data'}</span>
                </button>
                <button 
                  onClick={onToggleManage}
                  className="bg-zinc-800 text-white border border-zinc-700 px-8 py-4 rounded-2xl font-black hover:bg-zinc-700 transition-all active:scale-95"
                >
                  Go to Management
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <CartPanel items={cart} onUpdateQuantity={updateQuantity} onClear={clearCart} />
    </div>
  );
};

export default POSInterface;
