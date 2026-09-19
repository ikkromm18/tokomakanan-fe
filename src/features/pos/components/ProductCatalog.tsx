import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, UtensilsCrossed, Layers } from 'lucide-react';
import { productApi } from '@/features/products/api/productApi';
import { packageApi } from '@/features/packages/api/packageApi';
import { usePosCartStore } from '@/stores/posCartStore';
import { formatRupiah } from '@/utils/currency';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { cn } from '@/utils/cn';

const categories = [
  'Semua',
  'Paket Bundling',
  'Roti Manis',
  'Roti Tawar',
  'Pastry',
  'Cake',
  'Kue Kering',
  'Minuman',
];

export const ProductCatalog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [search, setSearch] = useState('');

  const addItem = usePosCartStore((s) => s.addItem);
  const cartItems = usePosCartStore((s) => s.items);

  // Fetch active products
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['pos-products'],
    queryFn: () => productApi.list({ limit: 100, is_active: true }),
  });

  // Fetch active packages
  const { data: packagesData, isLoading: isLoadingPackages } = useQuery({
    queryKey: ['pos-packages'],
    queryFn: () => packageApi.list({ limit: 100, is_active: true }),
  });

  const products = productsData?.data || [];
  const packages = packagesData?.data || [];

  const getItemCartQty = (type: 'PRODUCT' | 'PACKAGE', id: number): number => {
    const found = cartItems.find((it) => it.item_type === type && it.item_id === id);
    return found ? found.quantity : 0;
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'Paket Bundling') return false;
    const matchesCategory =
      selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter packages
  const filteredPackages = packages.filter((pkg) => {
    if (selectedCategory !== 'Semua' && selectedCategory !== 'Paket Bundling')
      return false;
    return pkg.name.toLowerCase().includes(search.toLowerCase());
  });

  const isLoading = isLoadingProducts || isLoadingPackages;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Bar: Search and Category Pills */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <div className="absolute left-3.5 top-3 pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Cari menu roti, kue, atau paket bundling (Ketik / Scan)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-sm text-stone-900 shadow-2xs placeholder:text-stone-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
        </div>

        {/* Categories scrollable pill list */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shadow-2xs select-none',
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-amber-600/20'
                  : 'bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200/80'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Catalog Cards */}
      {isLoading ? (
        <div className="py-24 flex justify-center items-center">
          <LoadingSpinner text="Memuat menu toko..." size="lg" />
        </div>
      ) : filteredProducts.length === 0 && filteredPackages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-white/50">
          <UtensilsCrossed className="w-10 h-10 text-stone-300 mb-3" />
          <h3 className="text-sm font-semibold text-stone-700">Menu Tidak Ditemukan</h3>
          <p className="text-xs text-stone-400 mt-1 max-w-xs">
            Tidak ada produk atau paket bundling yang cocok dengan pencarian Anda.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {/* Packages Cards */}
            {filteredPackages.map((pkg) => {
              const qty = getItemCartQty('PACKAGE', pkg.id);
              return (
                <div
                  key={`pkg-${pkg.id}`}
                  onClick={() =>
                    addItem({
                      id: pkg.id,
                      name: pkg.name,
                      sell_price: pkg.sell_price,
                      type: 'PACKAGE',
                    })
                  }
                  className="group relative flex flex-col justify-between rounded-2xl border border-purple-200 bg-linear-to-b from-purple-50/40 to-white p-4 shadow-2xs hover:shadow-md hover:border-purple-400 transition-all cursor-pointer select-none active:scale-[0.98]"
                >
                  {/* In-cart badge */}
                  {qty > 0 && (
                    <span className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-purple-700 text-[11px] font-bold text-white shadow-xs">
                      {qty}
                    </span>
                  )}

                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-700 uppercase tracking-wider mb-1">
                      <Layers className="w-3 h-3" />
                      <span>Paket Bundling</span>
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 group-hover:text-purple-700 transition-colors line-clamp-2 leading-snug">
                      {pkg.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-1 line-clamp-1">
                      {pkg.items?.length || 0} macam item pilihan
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-2 border-t border-purple-100">
                    <span className="text-sm font-extrabold text-purple-900 font-mono">
                      {formatRupiah(pkg.sell_price)}
                    </span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white group-hover:bg-purple-700 shadow-xs">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Individual Product Cards */}
            {filteredProducts.map((product) => {
              const qty = getItemCartQty('PRODUCT', product.id);
              return (
                <div
                  key={`prod-${product.id}`}
                  onClick={() =>
                    addItem({
                      id: product.id,
                      name: product.name,
                      sell_price: product.sell_price,
                      type: 'PRODUCT',
                    })
                  }
                  className="group relative flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer select-none active:scale-[0.98]"
                >
                  {/* In-cart quantity indicator */}
                  {qty > 0 && (
                    <span className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-[11px] font-bold text-white shadow-xs">
                      {qty}
                    </span>
                  )}

                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-stone-100 text-[10px] font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                      {product.category}
                    </span>
                    <h4 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                      {product.name}
                    </h4>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-2 border-t border-stone-100">
                    <span className="text-sm font-extrabold text-stone-900 font-mono">
                      {formatRupiah(product.sell_price)}
                    </span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-stone-700 group-hover:bg-amber-600 group-hover:text-white transition-colors shadow-2xs">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
