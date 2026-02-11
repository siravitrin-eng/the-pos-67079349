
import React, { useState, useEffect, useMemo } from 'react';
import { User, db } from '../firebase';
import { Product, Category } from '../types';
import Sidebar from './Sidebar';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, writeBatch } from 'firebase/firestore';

const CLOUDINARY_CLOUD_NAME = "dhwclsrir";
const CLOUDINARY_UPLOAD_PRESET = "unsigned_upload";

interface ManageProductsProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

type DeleteConfirmState = {
  isOpen: boolean;
  type: 'single' | 'bulk' | 'clear' | null;
  targetId?: string;
  count?: number;
};

const ManageProducts: React.FC<ManageProductsProps> = ({ user, onBack, onLogout }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({ isOpen: false, type: null });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [formData, setFormData] = useState({
    title: '', price: '', unit: 'Piece', detail: '', image: '', category: Category.COFFEE, status: 'In Stock' as 'In Stock' | 'Sold Out'
  });

  // Extract unique images from current products to populate history
  const imageHistory = useMemo(() => {
    const urls = products
      .map(p => p.image)
      .filter((url): url is string => !!url && url.startsWith('http'));
    return Array.from(new Set(urls)).slice(0, 12); // Keep last 12 unique images
  }, [products]);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      setProducts(items);
      setError(null);
    }, (err) => {
      setError(err.code === 'permission-denied' ? "permission-denied" : "Database error");
    });
    return () => unsubscribe();
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length && products.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const executeDelete = async () => {
    setIsProcessingDelete(true);
    try {
      const batch = writeBatch(db);
      if (deleteConfirm.type === 'single' && deleteConfirm.targetId) {
        await deleteDoc(doc(db, 'products', deleteConfirm.targetId));
      } else if (deleteConfirm.type === 'bulk') {
        selectedIds.forEach(id => batch.delete(doc(db, 'products', id)));
        await batch.commit();
        setSelectedIds(new Set());
      } else if (deleteConfirm.type === 'clear') {
        products.forEach(p => batch.delete(doc(db, 'products', p.id)));
        await batch.commit();
        setSelectedIds(new Set());
      }
      setDeleteConfirm({ isOpen: false, type: null });
      if (isModalOpen) setIsModalOpen(false);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setIsProcessingDelete(false);
    }
  };

  const openConfirmDelete = (type: 'single' | 'bulk' | 'clear', id?: string) => {
    setDeleteConfirm({
      isOpen: true,
      type,
      targetId: id,
      count: type === 'bulk' ? selectedIds.size : type === 'clear' ? products.length : 1
    });
  };

  const seedSampleData = async () => {
    setIsSeeding(true);
    const samples = [
      { title: 'Dark Espresso', price: 65, unit: 'Cup', detail: 'Intense flavor', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=400', category: Category.COFFEE, status: 'In Stock' },
      { title: 'Neon Muffin', price: 45, unit: 'Piece', detail: 'Bright blueberry', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=400', category: Category.BAKERY, status: 'In Stock' },
      { title: 'Matcha Latte', price: 80, unit: 'Glass', detail: 'Green tea bliss', image: 'https://images.unsplash.com/photo-1536496070726-444400fd9e80?q=80&w=400', category: Category.DRINK, status: 'In Stock' }
    ];
    try {
      for (const item of samples) { await addDoc(collection(db, 'products'), { ...item, createdAt: serverTimestamp() }); }
    } catch (err) { alert("Failed to seed"); } finally { setIsSeeding(false); }
  };

  const resetForm = () => {
    setFormData({ title: '', price: '', unit: 'Piece', detail: '', image: '', category: Category.COFFEE, status: 'In Stock' });
    setEditingProduct(null);
    setShowHistory(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ title: product.title, price: product.price.toString(), unit: product.unit, detail: product.detail, image: product.image, category: product.category as Category, status: product.status });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result as string }));
    reader.readAsDataURL(file);

    setIsUploading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: data });
      const fileRes = await res.json();
      if (fileRes.secure_url) {
        setFormData(prev => ({ ...prev, image: fileRes.secure_url }));
        setShowHistory(false);
      }
    } catch (err) { alert("Upload failed"); } finally { setIsUploading(false); }
  };

  const selectFromHistory = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }));
    setShowHistory(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = { ...formData, price: parseFloat(formData.price), createdAt: serverTimestamp() };
    try {
      if (editingProduct) await updateDoc(doc(db, 'products', editingProduct.id), productData);
      else await addDoc(collection(db, 'products'), productData);
      setIsModalOpen(false); resetForm();
    } catch (err) { alert("Save failed"); }
  };

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden text-gray-100">
      <Sidebar user={user} onLogout={onLogout} onToggleManage={onBack} isManageMode={true} />
      
      <main className="flex-1 overflow-y-auto p-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-white">Inventory <span className="text-emerald-500">Vault</span></h1>
            <p className="text-zinc-500 font-medium mt-2">Manage your catalog items and digital assets in real-time.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            {selectedIds.size > 0 && (
              <button 
                onClick={() => openConfirmDelete('bulk')}
                className="bg-red-500/10 text-red-500 border border-red-500/30 px-6 py-4 rounded-2xl font-black hover:bg-red-500/20 transition-all flex items-center space-x-3"
              >
                <i className="fas fa-trash-alt"></i>
                <span>Delete Selected ({selectedIds.size})</span>
              </button>
            )}
            <button 
              onClick={() => openConfirmDelete('clear')}
              disabled={products.length === 0}
              className="bg-zinc-900 text-zinc-400 border border-zinc-700 px-6 py-4 rounded-2xl font-black hover:bg-zinc-800 transition-all flex items-center space-x-3 disabled:opacity-20"
            >
              <i className="fas fa-eraser"></i>
              <span>Clear All</span>
            </button>
            <button 
              onClick={seedSampleData}
              disabled={isSeeding}
              className="bg-zinc-900 text-emerald-500 border border-emerald-500/30 px-8 py-4 rounded-2xl font-black hover:bg-emerald-500/10 transition-all flex items-center space-x-3"
            >
              <i className="fas fa-magic"></i>
              <span>{isSeeding ? 'Seeding...' : 'Seed Samples'}</span>
            </button>
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-emerald-600 text-black px-8 py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-all active:scale-95 flex items-center space-x-3"
            >
              <i className="fas fa-plus"></i>
              <span>Add New Item</span>
            </button>
          </div>
        </div>

        {error === "permission-denied" ? (
          <div className="bg-zinc-900 border border-red-500/20 rounded-[3rem] p-16 max-w-2xl mx-auto text-center shadow-2xl">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
              <i className="fas fa-shield-alt text-red-500 text-4xl"></i>
            </div>
            <h3 className="text-3xl font-black mb-6">Permission Denied</h3>
            <p className="text-zinc-500 font-medium mb-10 leading-relaxed">System is restricted. Please update your Firestore security protocols in the management console.</p>
            <button onClick={() => onBack()} className="bg-emerald-600 text-black px-12 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl">Back to Terminal</button>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-black/40 border-b border-zinc-800 text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em]">
                <tr>
                  <th className="px-8 py-6 w-12">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-emerald-500 rounded border-zinc-700 bg-zinc-800 cursor-pointer"
                      checked={products.length > 0 && selectedIds.size === products.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-8 py-6">Image</th>
                  <th className="px-8 py-6">Product Information</th>
                  <th className="px-8 py-6">Category</th>
                  <th className="px-8 py-6">Pricing</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {products.map(product => (
                  <tr key={product.id} className={`hover:bg-black/20 transition-colors group ${selectedIds.has(product.id) ? 'bg-emerald-500/5' : ''}`}>
                    <td className="px-8 py-6">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 accent-emerald-500 rounded border-zinc-700 bg-zinc-800 cursor-pointer"
                        checked={selectedIds.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                      />
                    </td>
                    <td className="px-8 py-6 cursor-pointer" onClick={() => handleEdit(product)}>
                      <img src={product.image} className="w-14 h-14 rounded-2xl object-cover bg-zinc-800 border border-zinc-700 shadow-sm" />
                    </td>
                    <td className="px-8 py-6 cursor-pointer" onClick={() => handleEdit(product)}>
                      <p className="font-black text-white text-base uppercase tracking-tight group-hover:text-emerald-400 transition-colors">{product.title}</p>
                      <p className="text-xs text-zinc-500 truncate max-w-[250px] italic">{product.detail}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="bg-emerald-500/5 text-emerald-500 border border-emerald-500/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-white text-base">฿{product.price.toLocaleString()}</p>
                      <p className="text-[10px] text-zinc-600 uppercase font-black">/ {product.unit}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        product.status === 'In Stock' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 'bg-red-500/5 text-red-400 border-red-500/20'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end space-x-3">
                        <button onClick={() => handleEdit(product)} className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all flex items-center justify-center"><i className="fas fa-edit"></i></button>
                        <button onClick={() => openConfirmDelete('single', product.id)} className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/50 transition-all flex items-center justify-center"><i className="fas fa-trash-alt"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && !error && (
              <div className="p-32 text-center text-zinc-700">
                <i className="fas fa-layer-group text-6xl mb-6 opacity-20 block"></i>
                <p className="font-black text-xs uppercase tracking-[0.5em] opacity-30">Archive Empty</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] w-full max-md p-10 text-center animate-in zoom-in duration-200 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
            </div>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Confirm Destruction</h2>
            <p className="text-zinc-500 font-medium mb-8 leading-relaxed">
              {deleteConfirm.type === 'single' ? 'Are you sure you want to permanently delete this product record?' : 
               deleteConfirm.type === 'bulk' ? `Permanently delete ${deleteConfirm.count} selected product records?` : 
               'WARNING: This will permanently wipe your entire product database. Proceed?'}
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => setDeleteConfirm({ isOpen: false, type: null })}
                className="flex-1 py-4 bg-zinc-800 text-zinc-400 rounded-2xl font-black uppercase tracking-widest border border-zinc-700 hover:bg-zinc-700 transition-all"
              >
                Abort
              </button>
              <button 
                onClick={executeDelete}
                disabled={isProcessingDelete}
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-red-600/20 hover:bg-red-500 transition-all disabled:opacity-50"
              >
                {isProcessingDelete ? 'Processing...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-emerald-500/10 animate-in zoom-in duration-300">
            <div className="p-10 border-b border-zinc-800 flex justify-between items-center bg-black/20">
              <h2 className="text-2xl font-black text-white uppercase tracking-widest">{editingProduct ? 'Edit Record' : 'Create Record'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-600 hover:text-emerald-500 transition-colors"><i className="fas fa-times text-2xl"></i></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 grid grid-cols-2 gap-8">
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4 ml-1">Asset Identity (Cloudinary Sync)</label>
                <div className="flex items-start space-x-6">
                  <div className="w-28 h-28 bg-zinc-800 rounded-[2rem] flex items-center justify-center overflow-hidden border border-zinc-700 relative group shrink-0">
                    {formData.image ? (
                      <img src={formData.image} className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-30' : 'opacity-100'}`} alt="Preview" />
                    ) : (
                      <i className="fas fa-camera text-zinc-600 text-3xl"></i>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <i className="fas fa-spinner fa-spin text-emerald-500 text-xl"></i>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3 relative">
                    <div className="flex items-center space-x-2">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                      <label htmlFor="image-upload" className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${isUploading ? 'bg-zinc-800 text-zinc-600' : 'bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700 shadow-lg'}`}>
                        {isUploading ? 'Uploading...' : 'Change Image'}
                      </label>
                      
                      {imageHistory.length > 0 && (
                        <button 
                          type="button"
                          onClick={() => setShowHistory(!showHistory)}
                          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${showHistory ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'}`}
                        >
                          Recently Used <i className={`fas fa-chevron-${showHistory ? 'up' : 'down'} ml-1`}></i>
                        </button>
                      )}
                    </div>
                    
                    {/* Recently Used Dropdown Panel */}
                    {showHistory && imageHistory.length > 0 && (
                      <div className="absolute top-12 left-0 w-full bg-zinc-800/95 backdrop-blur-md border border-zinc-700 rounded-2xl p-4 shadow-2xl z-20 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {imageHistory.map((url, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => selectFromHistory(url)}
                              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-110 ${formData.image === url ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-zinc-700 opacity-60 hover:opacity-100'}`}
                            >
                              <img src={url} className="w-full h-full object-cover" alt={`History ${idx}`} />
                            </button>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-zinc-700 flex justify-between items-center">
                          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Select an image to reuse</span>
                          <button onClick={() => setShowHistory(false)} className="text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:underline">Close</button>
                        </div>
                      </div>
                    )}

                    <p className="text-[9px] text-zinc-500 font-bold italic">Upload new assets or choose from synchronized library.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1">Product Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData(f => ({...f, title: e.target.value}))} className="w-full px-6 py-4 bg-zinc-800 rounded-2xl border border-zinc-700 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-white placeholder:text-zinc-700" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1">Pricing (฿)</label>
                <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData(f => ({...f, price: e.target.value}))} className="w-full px-6 py-4 bg-zinc-800 rounded-2xl border border-zinc-700 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-white placeholder:text-zinc-700" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1">Sales Unit</label>
                <input type="text" value={formData.unit} onChange={e => setFormData(f => ({...f, unit: e.target.value}))} className="w-full px-6 py-4 bg-zinc-800 rounded-2xl border border-zinc-700 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-white placeholder:text-zinc-700" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1">Classification</label>
                <select value={formData.category} onChange={e => setFormData(f => ({...f, category: e.target.value as Category}))} className="w-full px-6 py-4 bg-zinc-800 rounded-2xl border border-zinc-700 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-white appearance-none cursor-pointer">
                  {Object.values(Category).filter(c => c !== Category.ALL).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1">Metadata / Description</label>
                <textarea rows={2} value={formData.detail} onChange={e => setFormData(f => ({...f, detail: e.target.value}))} className="w-full px-6 py-4 bg-zinc-800 rounded-2xl border border-zinc-700 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-white resize-none" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1">Availability</label>
                <select value={formData.status} onChange={e => setFormData(f => ({...f, status: e.target.value as any}))} className="w-full px-6 py-4 bg-zinc-800 rounded-2xl border border-zinc-700 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-white appearance-none cursor-pointer">
                  <option value="In Stock">In Stock</option>
                  <option value="Sold Out">Sold Out</option>
                </select>
              </div>

              <div className="col-span-2 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-zinc-800">
                {editingProduct && (
                  <button 
                    type="button" 
                    onClick={() => openConfirmDelete('single', editingProduct.id)} 
                    className="sm:w-32 py-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-3xl font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center justify-center"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                )}
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-zinc-800 text-zinc-400 rounded-3xl font-black uppercase tracking-[0.2em] border border-zinc-700 hover:bg-zinc-700 transition-all">Cancel</button>
                <button type="submit" disabled={isUploading} className="flex-[2] py-5 bg-emerald-600 text-black rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-500 transition-all disabled:opacity-50">
                  {editingProduct ? 'Commit Changes' : 'Initialize Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
