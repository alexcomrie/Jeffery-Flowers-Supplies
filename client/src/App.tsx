import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/providers/cart-provider";
import { UsernameProvider } from "@/providers/username-provider";
import { UsernameCheck } from "./components/username-check";

import { refreshService } from "@/services/refresh-service";
import { useEffect } from "react";
import BusinessList from "@/pages/business-list";
import BusinessProfile from "@/pages/business-profile";
import ProductList from "@/pages/product-list";
import ProductDetails from "@/pages/product-details";
import Cart from "@/pages/cart";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import CategoryList from "@/pages/category-list";
import CategoryBusinesses from "@/pages/category-businesses";
// Remove or create TestUtility component before importing
// import TestUtility from "@/pages/test-utility";

function Router() {
  return (
    <Switch>
      <Route path="/" component={BusinessList} />
      {/* Category routes kept for backward compatibility */}
      <Route path="/category/:categoryId" component={CategoryBusinesses} />
      <Route path="/all-businesses" component={BusinessList} />
      <Route path="/business/:id" component={BusinessProfile} />
      <Route path="/business/:id/products" component={ProductList} />
      <Route path="/business/:id/product/:productId/:productName" component={ProductDetails} />
      <Route path="/cart" component={Cart} />
      <Route path="/settings" component={Settings} />
      {/* Commented out until TestUtility component is created */}
      {/* <Route path="/test-utility" component={TestUtility} /> */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Cleanup refresh service when the app unmounts
    return () => refreshService.cleanup();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <UsernameProvider>
          <UsernameCheck />
          <TooltipProvider>
            <div className="min-h-screen bg-neutral">
              <Toaster />
              <Router />
            </div>
          </TooltipProvider>
        </UsernameProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
