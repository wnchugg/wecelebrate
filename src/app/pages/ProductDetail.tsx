import { useParams, useNavigate, Link } from 'react-router';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { ArrowLeft, Check, ShoppingCart, Truck, Package, Shield } from 'lucide-react';
import { CurrencyDisplay } from '../components/CurrencyDisplay';
import { useLanguage } from '../context/LanguageContext';
import { useCurrencyFormat } from '../hooks/useCurrencyFormat';
import { useNumberFormat } from '../hooks/useNumberFormat';
import { useUnits } from '../hooks/useUnits';
import { translateWithParams } from '../utils/translationHelpers';

/**
 * ProductDetail Component
 * Cache-bust: v2-cart-provider-context
 */
export function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const { formatPrice } = useCurrencyFormat();
  const { formatInteger } = useNumberFormat();
  const { formatWeight, formatLength } = useUnits();

  const product = products.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link to="/products" className="text-blue-600 hover:text-blue-700">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(t('notification.success.addedToCart'));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
              {product.category}
            </span>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-gray-600 text-lg">{product.description}</p>
          </div>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Key Features:</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Specifications */}
          {(product.weight || product.dimensions) && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Specifications:</h3>
              <div className="space-y-2">
                {product.weight && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Weight:</span>
                    <span className="text-gray-900 font-medium">{formatWeight(product.weight)}</span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Dimensions:</span>
                    <span className="text-gray-900 font-medium">
                      {formatLength(product.dimensions.length)} × {formatLength(product.dimensions.width)} × {formatLength(product.dimensions.height)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-bold text-gray-900">
                <CurrencyDisplay amount={product.price} />
              </span>
              {product.points && (
                <span className="text-lg text-gray-600">or {formatInteger(product.points)} points</span>
              )}
            </div>
            <p className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
            <button
              onClick={() => {
                handleAddToCart();
                navigate('/checkout');
              }}
              disabled={!product.inStock}
              className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
          </div>

          {/* Benefits */}
          <div className="space-y-3 border-t border-gray-200 pt-6">
            <div className="flex items-center gap-3 text-gray-700">
              <Truck className="w-5 h-5 text-blue-600" />
              <span>{translateWithParams(t, 'shipping.freeShippingThreshold', { amount: formatPrice(100) })}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Package className="w-5 h-5 text-blue-600" />
              <span>Premium gift packaging included</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>1-year warranty included</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}