import { useState } from 'react';
import { X, Upload, Image as ImageIcon, DollarSign, Tag, Package, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { showSuccessToast, showErrorToast } from '../../utils/errorHandling';
import { apiRequest } from '../../utils/api';
import { GIFT_CATEGORIES } from '../../context/GiftContext';
import { getErrorMessage } from '../../utils/errorUtils';
import { logger } from '../../utils/logger';
import type { CreateGiftFormData } from '../../../types';

interface CreateGiftModalProps {
  giftId?: string | null;
  onClose: () => void;
}

export function CreateGiftModal({ giftId, onClose }: CreateGiftModalProps) {
  const [formData, setFormData] = useState<CreateGiftFormData>({
    name: '',
    description: '',
    category: '',
    sku: '',
    price: '',
    status: 'active',
    tags: [],
    brand: '',
  });

  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const giftData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      sku: formData.sku,
      price: parseFloat(String(formData.price)),
      status: formData.status,
      attributes: {
        brand: formData.brand || undefined,
      },
      tags: formData.tags,
    };

    if (giftId) {
      // Update existing gift
      apiRequest(`/gifts/${giftId}`, {
        method: 'PUT',
        body: JSON.stringify(giftData)
      })
        .then(() => {
          showSuccessToast('Gift updated successfully!');
          onClose();
        })
        .catch((error) => {
          const errorMessage = getErrorMessage(error);
          showErrorToast('Failed to update gift', errorMessage);
          logger.error('Failed to update gift:', error);
        });
    } else {
      // Add new gift to global catalog
      apiRequest('/gifts', {
        method: 'POST',
        body: JSON.stringify(giftData)
      })
        .then(() => {
          showSuccessToast('Gift created successfully!');
          onClose();
        })
        .catch((error) => {
          const errorMessage = getErrorMessage(error);
          showErrorToast('Failed to create gift', errorMessage);
          logger.error('Failed to create gift:', error);
        });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // TODO: Implement actual image upload to storage
        showErrorToast('Image upload not yet implemented', 'Please use image URL for now');
      } catch (error) {
        showErrorToast('Failed to upload image', getErrorMessage(error));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {giftId ? 'Edit Gift' : 'Add New Gift'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#D91C81]" />
                Basic Information
              </h3>

              <div className="space-y-4">
                <div>
                  <Label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gift Name *
                  </Label>
                  <Input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Wireless Noise-Cancelling Headphones"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-2">
                      SKU *
                    </Label>
                    <Input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="e.g., TECH-WH-001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price *
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-semibold text-gray-700 mb-2">
                    Short Description *
                  </Label>
                  <Textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description shown in gift listings..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </Label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    >
                      {GIFT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status *
                    </Label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as CreateGiftFormData['status'] })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Image */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Product Image</h3>
              <div>
                <Label className="block text-sm font-semibold text-gray-700 mb-2">
                  Image URL *
                </Label>
                <Input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                />
                {formData.image && (
                  <div className="mt-3">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+Image';
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Image
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                />
              </div>
            </div>

            {/* Attributes */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Product Attributes (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-semibold text-gray-700 mb-2">
                    Brand
                  </Label>
                  <Input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g., AudioTech Pro"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tags</h3>
              <div className="flex gap-2 mb-3">
                <Input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add a tag..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                />
                <Button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 bg-pink-50 text-[#D91C81] px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:bg-pink-100 rounded-full p-0.5 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <Button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="px-6 py-2 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#B71569] transition-all"
          >
            {giftId ? 'Update Gift' : 'Create Gift'}
          </Button>
        </div>
      </div>
    </div>
  );
}