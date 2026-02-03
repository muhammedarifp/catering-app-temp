import { AlertTriangle, Package, ArrowRight } from 'lucide-react';
import { InventoryItem } from '@/lib/types';

interface InventorySectionProps {
  items: InventoryItem[];
  lowStockItems: InventoryItem[];
}

export default function InventorySection({
  items,
  lowStockItems,
}: InventorySectionProps) {
  const categories = [...new Set(items.map((item) => item.category))];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="border border-red-200 bg-red-50">
          <div className="flex items-center gap-2 border-b border-red-200 px-4 py-3 lg:gap-3 lg:px-6 lg:py-4">
            <AlertTriangle className="h-4 w-4 text-red-600 lg:h-5 lg:w-5" />
            <h2 className="text-base font-semibold text-red-900 lg:text-lg">
              Low Stock ({lowStockItems.length})
            </h2>
          </div>
          <div className="p-4 lg:p-6">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 lg:gap-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border border-red-200 bg-white p-3 lg:p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-900 text-sm lg:text-base">{item.name}</p>
                    <p className="text-xs text-zinc-500 lg:text-sm">{item.category}</p>
                  </div>
                  <div className="ml-2 text-right flex-shrink-0">
                    <p className="text-base font-semibold text-red-600 lg:text-lg">
                      {item.quantity} {item.unit}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Min: {item.minQuantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inventory Overview */}
      <div className="border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 lg:px-6 lg:py-4">
          <h2 className="text-base font-semibold text-zinc-900 lg:text-lg">
            Godown Inventory
          </h2>
          <a
            href="/inventory"
            className="flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            <span className="hidden sm:inline">Manage</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="p-4 lg:p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {categories.map((category) => {
              const categoryItems = items.filter(
                (item) => item.category === category
              );
              const lowStockCount = categoryItems.filter(
                (item) => item.quantity < item.minQuantity
              ).length;

              return (
                <div key={category} className="border border-zinc-200 p-3 lg:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div className="flex h-8 w-8 items-center justify-center bg-zinc-100 lg:h-10 lg:w-10">
                        <Package className="h-4 w-4 text-zinc-600 lg:h-5 lg:w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-zinc-900 lg:text-base">{category}</h3>
                        <p className="text-xs text-zinc-500">
                          {categoryItems.length} items
                        </p>
                      </div>
                    </div>
                    {lowStockCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center bg-red-100 text-xs font-semibold text-red-700 lg:h-6 lg:w-6">
                        {lowStockCount}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 space-y-1.5 lg:mt-4 lg:space-y-2">
                    {categoryItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs lg:text-sm"
                      >
                        <span className="text-zinc-600 truncate mr-2">{item.name}</span>
                        <span
                          className={`font-medium flex-shrink-0 ${
                            item.quantity < item.minQuantity
                              ? 'text-red-600'
                              : 'text-zinc-900'
                          }`}
                        >
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    ))}
                    {categoryItems.length > 3 && (
                      <p className="text-xs text-zinc-400">
                        +{categoryItems.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
