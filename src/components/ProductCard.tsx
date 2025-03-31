import React from 'react';
import { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div
      className="cursor-pointer group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="aspect-w-1 aspect-h-1 overflow-hidden">
        <img
          src={product.images[0]?.image_url}
          alt={product.name}
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.jpg';
          }}
        />
        {product.featured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-sm">
            Destacado
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-serif font-medium text-gray-900">{product.name}</h3>
        {product.price && (
          <p className="text-[#2c2420] font-medium mt-1">
            ${product.price.toFixed(2)}
          </p>
        )}
        <p className="text-gray-600 mt-2 text-sm line-clamp-2">{product.description}</p>
      </div>
    </div>
  );
}