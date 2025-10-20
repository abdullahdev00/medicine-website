import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import type { Category } from "@shared/schema";

interface FilterBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  onClearFilters: () => void;
}

export function FilterBottomSheet({
  open,
  onOpenChange,
  categories,
  selectedCategories,
  onCategoriesChange,
  priceRange,
  onPriceRangeChange,
  onClearFilters,
}: FilterBottomSheetProps) {
  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  const activeFiltersCount = selectedCategories.length + (priceRange[0] > 0 || priceRange[1] < 3000 ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 border-none">
        <div className="h-full flex flex-col">
          {/* Header */}
          <SheetHeader className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-2xl font-bold">Filters</SheetTitle>
                {activeFiltersCount > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} applied
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="rounded-full h-10 w-10"
                data-testid="button-close-filters"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Categories Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category.id);
                  return (
                    <motion.button
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`
                        px-6 py-3 rounded-full font-medium transition-all duration-300
                        ${
                          isSelected
                            ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg scale-105"
                            : "bg-muted hover:bg-muted/80 text-foreground"
                        }
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      data-testid={`category-${category.id}`}
                    >
                      {category.name}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Price Range Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold mb-4">Price Range</h3>
              <div className="space-y-6">
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                    min={0}
                    max={3000}
                    step={50}
                    className="w-full"
                    data-testid="slider-price-range"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl px-6 py-3 flex-1 mr-2">
                    <p className="text-xs text-muted-foreground mb-1">Min Price</p>
                    <p className="text-lg font-bold text-primary">PKR {priceRange[0]}</p>
                  </div>
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl px-6 py-3 flex-1 ml-2">
                    <p className="text-xs text-muted-foreground mb-1">Max Price</p>
                    <p className="text-lg font-bold text-primary">PKR {priceRange[1]}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Actions */}
          <div className="border-t p-6 bg-background">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="flex-1 rounded-full h-12 text-base font-semibold"
                data-testid="button-clear-filters"
              >
                Clear All
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80"
                data-testid="button-apply-filters"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
