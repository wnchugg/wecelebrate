import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Gift, Search, Filter, Grid, List, Tag, Info, ShoppingCart, Heart, Star } from 'lucide-react';

export function Step4GiftSelection() {
  const [selectedVariation, setSelectedVariation] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const variations = [
    { id: 'grid', label: 'Grid View', description: 'Traditional grid layout with product cards' },
    { id: 'category', label: 'Category Filter', description: 'Browse by product categories' },
    { id: 'with-pricing', label: 'With Pricing', description: 'Show prices and point values' },
    { id: 'without-pricing', label: 'Without Pricing', description: 'Hide all pricing information' }
  ];

  const categories = [
    { id: 'all', label: 'All Gifts', count: 24 },
    { id: 'electronics', label: 'Electronics', count: 8 },
    { id: 'lifestyle', label: 'Lifestyle', count: 6 },
    { id: 'experiences', label: 'Experiences', count: 5 },
    { id: 'gift-cards', label: 'Gift Cards', count: 5 }
  ];

  const mockGifts = [
    { 
      id: 1, 
      name: 'Premium Wireless Headphones', 
      category: 'electronics', 
      price: 299, 
      points: 2990,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      rating: 4.8,
      popular: true
    },
    { 
      id: 2, 
      name: 'Luxury Spa Day Experience', 
      category: 'experiences', 
      price: 250, 
      points: 2500,
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400',
      rating: 4.9,
      popular: true
    },
    { 
      id: 3, 
      name: 'Designer Backpack', 
      category: 'lifestyle', 
      price: 180, 
      points: 1800,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      rating: 4.6,
      popular: false
    },
    { 
      id: 4, 
      name: 'Smart Watch Series 5', 
      category: 'electronics', 
      price: 399, 
      points: 3990,
      image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400',
      rating: 4.7,
      popular: true
    },
    { 
      id: 5, 
      name: 'Premium Coffee Maker', 
      category: 'lifestyle', 
      price: 220, 
      points: 2200,
      image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400',
      rating: 4.5,
      popular: false
    },
    { 
      id: 6, 
      name: 'Amazon Gift Card $100', 
      category: 'gift-cards', 
      price: 100, 
      points: 1000,
      image: 'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=400',
      rating: 5.0,
      popular: true
    },
    { 
      id: 7, 
      name: 'Cooking Class Package', 
      category: 'experiences', 
      price: 150, 
      points: 1500,
      image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
      rating: 4.8,
      popular: false
    },
    { 
      id: 8, 
      name: 'Wireless Charging Station', 
      category: 'electronics', 
      price: 89, 
      points: 890,
      image: 'https://images.unsplash.com/photo-1591290619762-d6d2d0ea7e41?w=400',
      rating: 4.4,
      popular: false
    }
  ];

  const filteredGifts = selectedCategory === 'all' 
    ? mockGifts 
    : mockGifts.filter(gift => gift.category === selectedCategory);

  const showPricing = selectedVariation === 'with-pricing';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/demos"
              className="flex items-center gap-2 text-gray-600 hover:text-[#D91C81] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to All Steps</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#D91C81] text-white flex items-center justify-center font-bold">
                4
              </div>
              <span className="font-semibold text-gray-900">Gift Selection</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Variation Selector */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select Variation</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {variations.map((variation) => (
              <button
                key={variation.id}
                onClick={() => setSelectedVariation(variation.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedVariation === variation.id
                    ? 'border-[#D91C81] bg-pink-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-gray-900 mb-1">{variation.label}</p>
                <p className="text-sm text-gray-600">{variation.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Demo Preview */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#D91C81] to-[#1B2A5E] text-white p-6">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-8 h-8" />
              <h1 className="text-2xl md:text-3xl font-bold">Choose Your Perfect Gift</h1>
            </div>
            <p className="text-white/90">Browse our curated selection of premium gifts</p>
          </div>

          <div className="p-6">
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for gifts..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                />
              </div>

              {/* Category Filter (visible in category variation) */}
              {(selectedVariation === 'category' || selectedVariation === 'grid') && (
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedCategory === category.id
                          ? 'bg-[#D91C81] text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.label}
                      <span className="ml-2 text-sm opacity-75">({category.count})</span>
                    </button>
                  ))}
                </div>
              )}

              {/* View Options */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredGifts.length}</span> gifts
                </p>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg bg-[#D91C81] text-white">
                    <Grid className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">
                    <List className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">
                    <Filter className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Gift Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGifts.map((gift) => (
                <div
                  key={gift.id}
                  className="group bg-white rounded-xl border-2 border-gray-200 hover:border-[#D91C81] hover:shadow-xl transition-all overflow-hidden cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={gift.image}
                      alt={gift.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {gift.popular && (
                      <div className="absolute top-3 right-3 bg-[#D91C81] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />
                        Popular
                      </div>
                    )}
                    <button className="absolute top-3 left-3 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="w-5 h-5 text-[#D91C81]" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {gift.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-700">{gift.rating}</span>
                      <span className="text-sm text-gray-500">(124)</span>
                    </div>

                    {/* Pricing */}
                    {showPricing && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-[#D91C81]">
                            ${gift.price}
                          </span>
                          <span className="text-sm text-gray-500">or</span>
                          <span className="text-sm font-semibold text-[#1B2A5E] flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {gift.points} pts
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button className="w-full py-2.5 bg-[#D91C81] hover:bg-[#B71569] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 group-hover:shadow-md">
                      <ShoppingCart className="w-4 h-4" />
                      Select Gift
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="mt-8 text-center">
              <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                Load More Gifts
              </button>
            </div>
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Implementation Notes</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Gift catalog is dynamically loaded based on site configuration</li>
                <li>• Supports multiple view modes: grid, list, and detail views</li>
                <li>• Category filtering and search are fully functional</li>
                <li>• Pricing display can be toggled based on site settings</li>
                <li>• Wishlist functionality for comparing multiple gifts</li>
                <li>• Responsive design optimized for mobile browsing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
