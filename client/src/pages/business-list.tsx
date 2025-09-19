import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RefreshCw, ShoppingCart, Settings, Info } from "lucide-react";
import { useBusinesses, useRefreshBusinesses } from "@/hooks/use-businesses";
import { useCart } from "@/providers/cart-provider";
import BusinessCard from "@/components/business-card";

export default function BusinessList() {
  const [, setLocation] = useLocation();
  const { data: businesses, isLoading, error } = useBusinesses();
  const refreshBusinesses = useRefreshBusinesses();
  const { itemCount } = useCart();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBusinesses();
      setLastRefreshTime(Date.now());
    } finally {
      setIsRefreshing(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Unable to load businesses</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
          <Button onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Jeffery Flowers</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/cart')}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {itemCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/settings')}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Business List */}
        {!isLoading && (
          <>
            {businesses?.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">
                  No businesses available
                </h3>
                <p className="text-muted-foreground">
                  Please check back later
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {businesses?.map((business) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    onRefresh={handleRefresh}
                    lastRefreshTime={lastRefreshTime}
                    isRefreshing={isRefreshing}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Social and About Buttons */}
      <div className="p-4 flex flex-col items-center space-y-2">
        <Button 
          className="w-full max-w-md" 
          variant="outline"
          onClick={() => window.open('https://www.tiktok.com/@the_hub_ja?_t=ZN-8z4xvGMZONS&_r=1', '_blank')}
        >
          <svg 
            className="mr-2 h-4 w-4" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
          Follow the developer on TikTok
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full max-w-md" variant="outline">
              <Info className="mr-2 h-4 w-4" />
              About Jeffery Flowers
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>About Jeffery Flowers</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <p>
                        Jeffery Flowers is an online platform designed to connect Jeffery Flowers Supplies to plant lovers.
                      </p>
                      <div className="space-y-2">
                        <h3 className="font-semibold">Key features include:</h3>
                        <ul className="list-disc pl-6 space-y-2">
                          <li><span className="font-semibold">Business Profiles:</span> Showcase Jeffery Flowers Supplies contact info, location, hours, and a short bio so customers get to know who we are.</li>
                          <li><span className="font-semibold">Product Catalogs:</span> Display images and details of our products—each product can feature a large image, description, and price.</li>
                          <li><span className="font-semibold">Shopping Cart:</span> Customers can add items into their cart. When ready, they can send order directly (Via WhatsApp) to finalize the order.</li>

                        </ul>
                      </div>

                    </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}