import { X, Edit, Package, DollarSign, Tag, Info } from 'lucide-react';
import { useGift } from '../../context/GiftContext';

interface GiftDetailModalProps {
  giftId: string;
  onClose: () => void;
  onEdit: (id: string) => void;
}

export function GiftDetailModal({ giftId, onClose, onEdit }: GiftDetailModalProps) {
  const { gifts } = useGift();
  const gift = gifts.find(g => g.id === giftId);

  if (!gift) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gift Details</h2>
            <p className="text-sm text-gray-600 mt-1 font-mono">{gift.sku}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(gift.id)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-medium"
            >
              <Edit className="w-4 h-4" />
              Edit Gift
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Images */}
            <div>
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={gift.image}
                    alt={gift.name}
                    className="w-full h-80 object-cover rounded-xl border border-gray-200"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusBadge(gift.status)}`}>
                      {(gift.status as string) === 'out_of_stock' ? 'Out of Stock' : gift.status}
                    </span>
                  </div>
                </div>

                {gift.images && gift.images.length > 1 && (
                  <div className="grid grid-cols-3 gap-3">
                    {gift.images.slice(1).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${gift.name} ${idx + 2}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:border-[#D91C81] transition-all"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{gift.name}</h1>
                <p className="text-gray-600 mb-4">{gift.description}</p>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-bold text-gray-900">${gift.price.toFixed(2)}</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {gift.category}
                  </span>
                </div>

                {gift.longDescription && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-gray-600" />
                      Detailed Description
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{gift.longDescription}</p>
                  </div>
                )}
              </div>

              {/* Inventory */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-600" />
                  Inventory Status
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total</p>
                    <p className="text-xl font-bold text-gray-900">{gift.inventory.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Available</p>
                    <p className={`text-xl font-bold ${
                      gift.inventory.available === 0 ? 'text-red-600' :
                      gift.inventory.available < 50 ? 'text-amber-600' :
                      'text-green-600'
                    }`}>
                      {gift.inventory.available}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Reserved</p>
                    <p className="text-xl font-bold text-blue-600">{gift.inventory.reserved}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        gift.inventory.available === 0 ? 'bg-red-500' :
                        gift.inventory.available < 50 ? 'bg-amber-500' :
                        'bg-green-500'
                      }`}
                      style={{
                        width: `${(gift.inventory.available / gift.inventory.total) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {((gift.inventory.available / gift.inventory.total) * 100).toFixed(1)}% available
                  </p>
                </div>
              </div>

              {/* Attributes */}
              {gift.attributes && Object.values(gift.attributes).some(v => v) && (
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Product Attributes</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {gift.attributes.brand && (
                      <div>
                        <p className="text-sm text-gray-600">Brand</p>
                        <p className="font-semibold text-gray-900">{gift.attributes.brand}</p>
                      </div>
                    )}
                    {gift.attributes.color && (
                      <div>
                        <p className="text-sm text-gray-600">Color</p>
                        <p className="font-semibold text-gray-900">{gift.attributes.color}</p>
                      </div>
                    )}
                    {gift.attributes.size && (
                      <div>
                        <p className="text-sm text-gray-600">Size</p>
                        <p className="font-semibold text-gray-900">{gift.attributes.size}</p>
                      </div>
                    )}
                    {gift.attributes.material && (
                      <div>
                        <p className="text-sm text-gray-600">Material</p>
                        <p className="font-semibold text-gray-900">{gift.attributes.material}</p>
                      </div>
                    )}
                    {gift.attributes.weight && (
                      <div>
                        <p className="text-sm text-gray-600">Weight</p>
                        <p className="font-semibold text-gray-900">{gift.attributes.weight}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {gift.tags && gift.tags.length > 0 && (
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-600" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {gift.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-pink-50 text-[#D91C81] px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Metadata</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900 font-medium">
                      {new Date(gift.createdAt).toLocaleDateString()} {new Date(gift.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="text-gray-900 font-medium">
                      {new Date(gift.updatedAt).toLocaleDateString()} {new Date(gift.updatedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all"
          >
            Close
          </button>
          <button
            onClick={() => onEdit(gift.id)}
            className="px-6 py-2 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#B71569] transition-all flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Gift
          </button>
        </div>
      </div>
    </div>
  );
}