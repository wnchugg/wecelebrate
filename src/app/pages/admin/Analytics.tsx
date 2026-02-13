import { TrendingUp, Users, Gift, ShoppingCart, Calendar } from 'lucide-react';

export function Analytics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-1">View platform performance and user insights</p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-4">
        <Calendar className="w-5 h-5 text-gray-400" />
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none">
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="365">Last Year</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-[#D91C81]" />
            <span className="text-green-600 text-sm font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              12.5%
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">1,284</h3>
          <p className="text-sm text-gray-600 mt-1">Total Users</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <ShoppingCart className="w-8 h-8 text-[#00B4CC]" />
            <span className="text-green-600 text-sm font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              8.2%
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">856</h3>
          <p className="text-sm text-gray-600 mt-1">Orders Placed</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Gift className="w-8 h-8 text-[#1B2A5E]" />
            <span className="text-gray-600 text-sm font-medium">-</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">47</h3>
          <p className="text-sm text-gray-600 mt-1">Total Gifts</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span className="text-green-600 text-sm font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              15.3%
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">66.7%</h3>
          <p className="text-sm text-gray-600 mt-1">Conversion Rate</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Orders Over Time</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart visualization would appear here</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Gift Category Distribution</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart visualization would appear here</p>
          </div>
        </div>
      </div>

      {/* Top Performing Gifts */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Top Performing Gifts</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Rank</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Gift Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Orders</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Views</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm font-bold text-gray-900">1</td>
                <td className="px-4 py-4 text-sm text-gray-900">Premium Wireless Headphones</td>
                <td className="px-4 py-4 text-sm text-gray-600">142</td>
                <td className="px-4 py-4 text-sm text-gray-600">385</td>
                <td className="px-4 py-4 text-sm font-semibold text-green-600">36.9%</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm font-bold text-gray-900">2</td>
                <td className="px-4 py-4 text-sm text-gray-900">Smart Fitness Watch</td>
                <td className="px-4 py-4 text-sm text-gray-600">128</td>
                <td className="px-4 py-4 text-sm text-gray-600">342</td>
                <td className="px-4 py-4 text-sm font-semibold text-green-600">37.4%</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm font-bold text-gray-900">3</td>
                <td className="px-4 py-4 text-sm text-gray-900">Portable Bluetooth Speaker</td>
                <td className="px-4 py-4 text-sm text-gray-600">95</td>
                <td className="px-4 py-4 text-sm text-gray-600">298</td>
                <td className="px-4 py-4 text-sm font-semibold text-green-600">31.9%</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm font-bold text-gray-900">4</td>
                <td className="px-4 py-4 text-sm text-gray-900">Premium Coffee Maker</td>
                <td className="px-4 py-4 text-sm text-gray-600">87</td>
                <td className="px-4 py-4 text-sm text-gray-600">256</td>
                <td className="px-4 py-4 text-sm font-semibold text-green-600">34.0%</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm font-bold text-gray-900">5</td>
                <td className="px-4 py-4 text-sm text-gray-900">Wireless Charging Pad</td>
                <td className="px-4 py-4 text-sm text-gray-600">64</td>
                <td className="px-4 py-4 text-sm text-gray-600">223</td>
                <td className="px-4 py-4 text-sm font-semibold text-green-600">28.7%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
