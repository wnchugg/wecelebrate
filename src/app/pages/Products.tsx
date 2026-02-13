import { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { mockGifts } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { Filter } from 'lucide-react';

export function Products() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { shippingType } = useCart();

  const categories = ['all', ...Array.from(new Set(mockGifts.map(p => p.category)))];
  
  const filteredProducts = selectedCategory === 'all'
    ? mockGifts
    : mockGifts.filter(p => p.category === selectedCategory);

  // Map gifts to include inStock property for ProductCard compatibility
  const productsWithStock = filteredProducts.map(gift => ({
    ...gift,
    inStock: gift.status === 'active' && (gift.availableQuantity === undefined || gift.availableQuantity > 0)
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Gift Catalog</h1>
            {shippingType && (
              <p className="text-gray-600">
                Shipping to: <span className="font-semibold capitalize">{shippingType}</span>
              </p>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-gray-700">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filter:</span>
          </div>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category === 'all' ? 'All Products' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productsWithStock.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No products found in this category.</p>
        </div>
      )}
    </div>
  );
}