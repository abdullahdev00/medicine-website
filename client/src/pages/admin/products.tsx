import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { ProtectedAdminRoute } from "@/components/ProtectedAdminRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Product, Category } from "@shared/schema";

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const getCategoryName = (categoryId: string) => {
    return categories?.find(c => c.id === categoryId)?.name || "Unknown";
  };

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedAdminRoute>
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-products-title">
              Products Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your product catalog
            </p>
          </div>
          <Button className="bg-teal-600 hover:bg-teal-700" data-testid="button-add-product">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-products"
          />
        </div>

        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}>
                        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredProducts && filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                      <TableCell>
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium" data-testid="text-product-name">
                        {product.name}
                      </TableCell>
                      <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                      <TableCell>{product.variants?.length || 0}</TableCell>
                      <TableCell>⭐ {product.rating}</TableCell>
                      <TableCell>
                        {product.inStock ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            In Stock
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                            Out of Stock
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" data-testid="button-edit-product">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600" data-testid="button-delete-product">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      No products found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AdminLayout>
    </ProtectedAdminRoute>
  );
}
