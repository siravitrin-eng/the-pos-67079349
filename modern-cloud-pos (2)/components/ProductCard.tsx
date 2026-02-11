
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAdd: () => void;
  onImageClick: (url: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, onImageClick }) => {
  return (
    <div className="product-card-custom rounded-3xl overflow-hidden shadow-lg flex flex-col group text-left h-full border border-zinc-800">
      <div className="aspect-square w-full relative overflow-hidden bg-zinc-800">
        <img 
          src={product.image || 'https://via.placeholder.com/200?text=No+Image'} 
          alt={product.title} 
          onClick={(e) => {
            e.stopPropagation();
            onImageClick(product.image);
          }}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-zoom-in opacity-80 group-hover:opacity-100"
        />
        <div 
          onClick={onAdd}
          className="absolute bottom-3 right-3 bg-emerald-500 text-black w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 active:scale-90"
        >
          <i className="fas fa-plus font-black"></i>
        </div>
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-500/20">
          {product.category}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col bg-zinc-900" onClick={onAdd}>
        <h3 
          className="my-tooltip text-white font-black text-base mb-2 line-clamp-1 group-hover:text-emerald-400 transition-colors" 
          data-desc={`Click to order ${product.title}`}
        >
          {product.title}
        </h3>
        <p className="text-zinc-500 text-xs line-clamp-1 mb-4 italic">{product.detail || 'No description'}</p>
        <div className="mt-auto flex items-end justify-between">
          <div>
            <span className="text-2xl font-black text-emerald-500">฿{product.price.toLocaleString()}</span>
            {product.unit && <span className="text-[10px] text-zinc-500 ml-1">/ {product.unit}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
