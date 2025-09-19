import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Home, RefreshCw } from "lucide-react";
import { BusinessService } from "@/services/business-service";
import { toast } from "sonner";

export default function TestUtility() {
  const [location, setLocation] = useLocation();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearBusinessCache = () => {
    setIsClearing(true);
    try {
      BusinessService.clearBusinessCache();
      toast.success("Business cache cleared successfully");
    } catch (error) {
      toast.error("Failed to clear business cache");
      console.error(error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearProductCache = () => {
    setIsClearing(true);
    try {
      BusinessService.clearProductCache();
      toast.success("Product cache cleared successfully");
    } catch (error) {
      toast.error("Failed to clear product cache");
      console.error(error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearAllCaches = () => {
    setIsClearing(true);
    try {
      BusinessService.clearAllCaches();
      toast.success("All caches cleared successfully");
    } catch (error) {
      toast.error("Failed to clear caches");
      console.error(error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <Home className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Test Utility</h1>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cache Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Use these buttons to clear the application caches. This is useful when testing changes to business types or product data.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleClearBusinessCache}
                disabled={isClearing}
                className="flex items-center gap-2"
              >
                {isClearing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : null}
                Clear Business Cache
              </Button>
              <Button
                onClick={handleClearProductCache}
                disabled={isClearing}
                className="flex items-center gap-2"
              >
                {isClearing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : null}
                Clear Product Cache
              </Button>
              <Button
                onClick={handleClearAllCaches}
                disabled={isClearing}
                className="flex items-center gap-2"
                variant="destructive"
              >
                {isClearing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : null}
                Clear All Caches
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Testing Product Inquiry Business Type</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Clear all caches using the buttons above</li>
                <li>Make sure your business has <code>product_inquiry</code> in the profileType column (column 20) in the Google Sheet</li>
                <li>Navigate to the business profile and verify that:
                  <ul className="list-disc list-inside ml-6 mt-2">
                    <li>The business profile shows "Product Inquiry Information" instead of "Delivery Information"</li>
                    <li>The "View Products" button shows "View Products for Inquiry"</li>
                  </ul>
                </li>
                <li>Navigate to the product list and verify that:
                  <ul className="list-disc list-inside ml-6 mt-2">
                    <li>Prices are hidden and replaced with "Contact for Price"</li>
                  </ul>
                </li>
                <li>Navigate to a product detail page and verify that:
                  <ul className="list-disc list-inside ml-6 mt-2">
                    <li>The price is hidden and replaced with "Contact for Price"</li>
                    <li>The "Add to Cart" button is replaced with "Inquire About This Product"</li>
                  </ul>
                </li>
                <li>Add a product to the cart and verify that:
                  <ul className="list-disc list-inside ml-6 mt-2">
                    <li>The cart shows "Product Inquiry" as a delivery option</li>
                    <li>The inquiry message field is displayed</li>
                    <li>The "Send Order via WhatsApp" button is replaced with "Send Inquiry via WhatsApp"</li>
                  </ul>
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}