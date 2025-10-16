import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, X } from "lucide-react";
import type { Category } from "@shared/schema";

interface FilterSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  minRating: number;
  onMinRatingChange: (rating: number) => void;
  showInStock: boolean;
  onShowInStockChange: (show: boolean) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  onClearFilters: () => void;
}

export function FilterSidebar({
  open,
  onOpenChange,
  categories,
  selectedCategories,
  onCategoriesChange,
  priceRange,
  onPriceRangeChange,
  minRating,
  onMinRatingChange,
  showInStock,
  onShowInStockChange,
  sortBy,
  onSortByChange,
  onClearFilters,
}: FilterSidebarProps) {
  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[320px] sm:w-[400px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-serif">Filters</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-primary hover:text-primary/80"
              data-testid="button-clear-filters"
            >
              Clear All
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Categories */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Categories</Label>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                    data-testid={`checkbox-category-${category.id}`}
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Price Range (PKR)</Label>
            <div className="pt-2">
              <Slider
                value={priceRange}
                onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                min={0}
                max={3000}
                step={50}
                className="mb-3"
                data-testid="slider-price-range"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span data-testid="text-min-price">₨{priceRange[0]}</span>
                <span data-testid="text-max-price">₨{priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Minimum Rating</Label>
            <RadioGroup value={minRating.toString()} onValueChange={(v) => onMinRatingChange(Number(v))}>
              {[4, 3, 2, 1, 0].map((rating) => (
                <div key={rating} className="flex items-center space-x-3">
                  <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} data-testid={`radio-rating-${rating}`} />
                  <label
                    htmlFor={`rating-${rating}`}
                    className="text-sm font-medium leading-none cursor-pointer flex items-center gap-1"
                  >
                    {rating > 0 ? (
                      <>
                        {[...Array(rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="ml-1">& up</span>
                      </>
                    ) : (
                      <span>All Ratings</span>
                    )}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Stock Availability */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Availability</Label>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="in-stock"
                checked={showInStock}
                onCheckedChange={(checked) => onShowInStockChange(checked as boolean)}
                data-testid="checkbox-in-stock"
              />
              <label
                htmlFor="in-stock"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Show only in-stock items
              </label>
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Sort By</Label>
            <RadioGroup value={sortBy} onValueChange={onSortByChange}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="default" id="sort-default" data-testid="radio-sort-default" />
                <label htmlFor="sort-default" className="text-sm font-medium leading-none cursor-pointer">
                  Default
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="price-asc" id="sort-price-asc" data-testid="radio-sort-price-asc" />
                <label htmlFor="sort-price-asc" className="text-sm font-medium leading-none cursor-pointer">
                  Price: Low to High
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="price-desc" id="sort-price-desc" data-testid="radio-sort-price-desc" />
                <label htmlFor="sort-price-desc" className="text-sm font-medium leading-none cursor-pointer">
                  Price: High to Low
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="rating" id="sort-rating" data-testid="radio-sort-rating" />
                <label htmlFor="sort-rating" className="text-sm font-medium leading-none cursor-pointer">
                  Highest Rated
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="name" id="sort-name" data-testid="radio-sort-name" />
                <label htmlFor="sort-name" className="text-sm font-medium leading-none cursor-pointer">
                  Name (A-Z)
                </label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
