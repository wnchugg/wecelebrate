import { Link } from 'react-router';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { CurrencyDisplay } from './CurrencyDisplay';
import { useNumberFormat } from '../hooks/useNumberFormat';
import { useUnits } from '../hooks/useUnits';

export interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { formatInteger } = useNumberFormat();
  const { formatWeight } = useUnits();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          {!product.inStock && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full whitespace-nowrap">
              Out of Stock
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        {product.weight && (
          <p className="text-gray-500 text-xs mb-2">Weight: {formatWeight(product.weight)}</p>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              <CurrencyDisplay amount={product.price} />
            </p>
            {product.points && (
              <p className="text-sm text-gray-500">{formatInteger(product.points)} points</p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Link>
  );
}