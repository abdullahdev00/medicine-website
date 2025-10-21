import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/providers";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useRouter } from "next/navigation";

export function useCart() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const { data: cartItems = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/cart", user?.id],
    enabled: isAuthenticated && !!user,
    queryFn: async () => {
      const res = await fetch(`/api/cart?userId=${user?.id}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ 
      productId, 
      quantity = 1, 
      selectedPackage 
    }: { 
      productId: string; 
      quantity?: number; 
      selectedPackage: any; 
    }) => {
      if (!user) throw new Error("Not authenticated");
      
      const response = await apiRequest("POST", "/api/cart", {
        userId: user.id,
        productId,
        quantity,
        selectedPackage,
      });
      
      return response.json();
    },
    onMutate: async ({ productId, quantity = 1, selectedPackage }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/cart", user?.id] });

      // Snapshot the previous value
      const previousCartItems = queryClient.getQueryData(["/api/cart", user?.id]);

      // Get product details from products query for optimistic update
      const products = queryClient.getQueryData(["/api/products"]) as any[] || [];
      const product = products.find(p => p.id === productId);

      // Optimistically update to the new value
      queryClient.setQueryData(["/api/cart", user?.id], (old: any[] = []) => {
        const existingItemIndex = old.findIndex(
          (item) => item.productId === productId && 
          item.selectedPackage?.name === selectedPackage?.name
        );

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          const newItems = [...old];
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + quantity
          };
          return newItems;
        } else {
          // Add new item with product details
          const newItem = {
            id: `temp-${Date.now()}-${Math.random()}`,
            userId: user?.id,
            productId,
            quantity,
            selectedPackage,
            product: product ? {
              id: product.id,
              name: product.name,
              description: product.description,
              categoryId: product.categoryId || product.category_id,
              images: product.images || [],
              rating: product.rating,
              variants: product.variants || [],
              inStock: product.inStock || product.in_stock,
            } : null,
          };
          return [...old, newItem];
        }
      });

      // Show immediate success toast
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart successfully.",
      });

      // Return a context object with the snapshotted value
      return { previousCartItems };
    },
    onError: (error: any, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["/api/cart", user?.id], context?.previousCartItems);
      
      console.error('Add to cart error:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: async (data: any) => {
      // Update the cache with the server response
      if (data && data.cart) {
        queryClient.setQueryData(["/api/cart", user?.id], data.cart);
      }
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (!user) throw new Error("Not authenticated");
      const response = await apiRequest("PATCH", `/api/cart/${id}?userId=${user.id}`, { quantity });
      return response.json();
    },
    onMutate: async ({ id, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/cart", user?.id] });
      const previousCartItems = queryClient.getQueryData(["/api/cart", user?.id]);
      
      queryClient.setQueryData(["/api/cart", user?.id], (old: any[] = []) =>
        old.map((item) => item.id === id ? { ...item, quantity } : item)
      );
      
      return { previousCartItems };
    },
    onError: (error: any, variables, context) => {
      queryClient.setQueryData(["/api/cart", user?.id], context?.previousCartItems);
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: async (data: any) => {
      // Update the cache with the server response
      if (data && data.cart) {
        queryClient.setQueryData(["/api/cart", user?.id], data.cart);
      }
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      const response = await apiRequest("DELETE", `/api/cart/${id}?userId=${user.id}`);
      return response.json();
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["/api/cart", user?.id] });
      const previousCartItems = queryClient.getQueryData(["/api/cart", user?.id]);
      
      queryClient.setQueryData(["/api/cart", user?.id], (old: any[] = []) =>
        old.filter((item) => item.id !== id)
      );
      
      return { previousCartItems };
    },
    onError: (error: any, variables, context) => {
      queryClient.setQueryData(["/api/cart", user?.id], context?.previousCartItems);
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: async (data: any) => {
      // Update the cache with the server response
      if (data && data.cart) {
        queryClient.setQueryData(["/api/cart", user?.id], data.cart);
      }
    },
  });

  const addToCart = (productId: string, selectedPackage: any, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    addToCartMutation.mutate({ productId, quantity, selectedPackage });
  };

  const updateQuantity = (id: string, delta: number) => {
    const item = cartItems.find((item) => item.id === id);
    if (!item) return;
    const newQuantity = item.quantity + delta;
    
    if (newQuantity <= 0) {
      removeItemMutation.mutate(id);
    } else {
      updateQuantityMutation.mutate({ id, quantity: newQuantity });
    }
  };

  const removeItem = (id: string) => {
    // Filter out temporary IDs that might not exist on server
    if (id.startsWith('temp-')) {
      // For temporary items, just remove from local state
      queryClient.setQueryData(["/api/cart", user?.id], (old: any[] = []) =>
        old.filter((item) => item.id !== id)
      );
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
      return;
    }
    
    removeItemMutation.mutate(id);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return {
    cartItems,
    cartCount,
    isLoading,
    addToCart,
    updateQuantity,
    removeItem,
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingQuantity: updateQuantityMutation.isPending,
    isRemovingItem: removeItemMutation.isPending,
  };
}
