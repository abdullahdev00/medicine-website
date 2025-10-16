import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Welcome from "@/pages/welcome";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import OrderSuccess from "@/pages/order-success";
import Profile from "@/pages/profile";
import EditProfile from "@/pages/edit-profile";
import MyOrders from "@/pages/my-orders";
import MyAddresses from "@/pages/my-addresses";
import WalletPage from "@/pages/wallet";
import AffiliatePage from "@/pages/affiliate";
import BecomePartnerPage from "@/pages/become-partner";
import Wishlist from "@/pages/wishlist";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/home" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-success" component={OrderSuccess} />
      <Route path="/profile" component={Profile} />
      <Route path="/edit-profile" component={EditProfile} />
      <Route path="/my-orders" component={MyOrders} />
      <Route path="/my-addresses" component={MyAddresses} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/affiliate" component={AffiliatePage} />
      <Route path="/become-partner" component={BecomePartnerPage} />
      <Route path="/wishlist" component={Wishlist} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
