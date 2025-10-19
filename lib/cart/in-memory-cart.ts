interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  selectedPackage: { name: string; price: string };
}

class InMemoryCart {
  private cart = new Map<string, CartItem[]>();

  get(userId: string): CartItem[] {
    return this.cart.get(userId) || [];
  }

  add(userId: string, item: Omit<CartItem, 'id' | 'userId'>): CartItem[] {
    const userCart = this.get(userId);
    const existingItemIndex = userCart.findIndex(
      (i) => i.productId === item.productId && i.selectedPackage.name === item.selectedPackage.name
    );

    if (existingItemIndex >= 0) {
      userCart[existingItemIndex].quantity += item.quantity;
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random()}`,
        userId,
        ...item,
      };
      userCart.push(newItem);
    }

    this.cart.set(userId, userCart);
    return userCart;
  }

  remove(userId: string, itemId: string): CartItem[] {
    const userCart = this.get(userId);
    const updatedCart = userCart.filter((item) => item.id !== itemId);
    this.cart.set(userId, updatedCart);
    return updatedCart;
  }

  clear(userId: string): void {
    this.cart.delete(userId);
  }

  update(userId: string, itemId: string, quantity: number): CartItem | null {
    const userCart = this.get(userId);
    const itemIndex = userCart.findIndex((item) => item.id === itemId);
    
    if (itemIndex >= 0) {
      userCart[itemIndex].quantity = quantity;
      this.cart.set(userId, userCart);
      return userCart[itemIndex];
    }
    
    return null;
  }
}

export const inMemoryCart = new InMemoryCart();
