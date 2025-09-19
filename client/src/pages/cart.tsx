import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Trash2, ShoppingCart, Plus, Minus } from "lucide-react";
import { useCart } from "@/providers/cart-provider";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { 
    orders, 
    customerName, 
    deliveryOption, 
    deliveryAddress, 
    pickupTime, 
    selectedBusiness,
    removeFromCart, 
    updateCustomerInfo, 
    clearCart,
    addToCart 
  } = useCart();
  
  const [itemToRemove, setItemToRemove] = useState<number | null>(null);
  
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    customerName: customerName,
    deliveryAddress: deliveryAddress,
    pickupTime: pickupTime,
    inquiryMessage: '',
    parish: '',
    country: '',
  });

  const subtotal = orders.reduce(
    (sum, order) => {
      // Skip price calculation for product_inquiry businesses
      if (order.business.profileType === 'product_inquiry') {
        return sum;
      }
      return sum + order.product.price * order.quantity;
    },
    0
  );

  const getDeliveryCost = () => {
    if (!selectedBusiness) return 0;
    switch (deliveryOption) {
      case 'delivery':
        return selectedBusiness.deliveryCost || 0;
      case 'island_wide':
        return selectedBusiness.islandWideDeliveryCost || 0;
      default:
        return 0;
    }
  };

  const deliveryCost = getDeliveryCost();
  const total = subtotal + deliveryCost;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    updateCustomerInfo({ [field]: value } as any);
  };

  const handleDeliveryOptionChange = (value: string) => {
    updateCustomerInfo({ deliveryOption: value as any });
  };

  const buildOrderSummary = () => {
    let summary = '';
    
    // Check if this is a product inquiry business
    const isInquiryBusiness = selectedBusiness?.profileType === 'product_inquiry';
    
    for (const order of orders) {
      if (isInquiryBusiness) {
        summary += `${order.product.name} x ${order.quantity}\n`;
      } else {
        const itemTotal = order.product.price * order.quantity;
        summary += `${order.product.name} x ${order.quantity} @ $${Math.round(order.product.price)} = $${Math.round(itemTotal)}\n`;
      }
    }

    if (!isInquiryBusiness) {
      summary += `\nTotal: $${Math.round(total)}`;
      
      if (deliveryOption === 'delivery' && selectedBusiness?.hasDelivery) {
        summary += `\nDelivery Area: ${selectedBusiness.deliveryArea}`;
        if (selectedBusiness.deliveryCost) {
          summary += `\nDelivery Cost: $${Math.round(selectedBusiness.deliveryCost)}`;
        }
      } else if (deliveryOption === 'island_wide' && selectedBusiness?.islandWideDelivery) {
        summary += `\nIsland Wide Delivery via ${selectedBusiness.islandWideDelivery}`;
        if (selectedBusiness.islandWideDeliveryCost) {
          summary += `\nDelivery Cost: $${Math.round(selectedBusiness.islandWideDeliveryCost)}`;
        }
      }
    }

    return summary;
  };

  const handleSendOrder = async () => {
    if (!selectedBusiness || !customerName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Validation for regular businesses
    if (selectedBusiness.profileType !== 'product_inquiry') {
      if (deliveryOption === 'delivery' && !deliveryAddress.trim()) {
        toast({
          title: "Missing Delivery Address",
          description: "Please enter a delivery address",
          variant: "destructive"
        });
        return;
      }

      if (deliveryOption === 'pickup' && !pickupTime.trim()) {
        toast({
          title: "Missing Pickup Time",
          description: "Please enter a preferred pickup time",
          variant: "destructive"
        });
        return;
      }
      
      if (deliveryOption === 'inquiry' && !formData.inquiryMessage.trim()) {
        toast({
          title: "Missing Inquiry Message",
          description: "Please enter your inquiry message",
          variant: "destructive"
        });
        return;
      }
    } 
    // Validation for product inquiry businesses
    else {
      if (deliveryOption === 'pickup' && !pickupTime.trim()) {
        toast({
          title: "Missing Date and Time",
          description: "Please enter a preferred date and time",
          variant: "destructive"
        });
        return;
      }

      if (deliveryOption === 'island_wide') {
        if (!formData.parish?.trim()) {
          toast({
            title: "Missing Parish",
            description: "Please enter a parish",
            variant: "destructive"
          });
          return;
        }
        if (!deliveryAddress.trim()) {
          toast({
            title: "Missing Address",
            description: "Please enter a delivery address",
            variant: "destructive"
          });
          return;
        }
      }

      if (deliveryOption === 'overseas') {
        if (!formData.country?.trim()) {
          toast({
            title: "Missing Country",
            description: "Please enter a country",
            variant: "destructive"
          });
          return;
        }
        
        // Check if country is Jamaica
        if (formData.country.toLowerCase() === 'jamaica') {
          toast({
            title: "Invalid Country Selection",
            description: "Please choose 'Island Wide Delivery' for deliveries within Jamaica",
            variant: "destructive"
          });
          return;
        }
        
        if (!deliveryAddress.trim()) {
          toast({
            title: "Missing Address",
            description: "Please enter a delivery address",
            variant: "destructive"
          });
          return;
        }
      }
    }

    const orderSummary = buildOrderSummary();
    const isInquiryBusiness = selectedBusiness?.profileType === 'product_inquiry';
    
    let deliveryMethod;
    if (selectedBusiness?.profileType === 'product_inquiry') {
      deliveryMethod = deliveryOption === 'island_wide' ? 'Island Wide Delivery' : 
                      deliveryOption === 'overseas' ? 'Overseas Shipping' : 'Pickup';
    } else {
      deliveryMethod = deliveryOption === 'island_wide' ? 'Island Wide Delivery' : 
                      deliveryOption === 'delivery' ? 'Delivery' : 
                      deliveryOption === 'inquiry' ? 'Product Inquiry' : 'Pickup';
    }
    
    // Use the WhatsApp number directly from the business profile
    const phoneNumber = selectedBusiness.whatsAppNumber;
    
    let addressInfo = '';
    if (selectedBusiness?.profileType !== 'product_inquiry') {
      if (deliveryOption === 'delivery' || deliveryOption === 'island_wide') {
        addressInfo = `Delivery Address: ${deliveryAddress}`;
      } else if (deliveryOption === 'pickup') {
        addressInfo = `Pickup Time: ${pickupTime}`;
      } else if (deliveryOption === 'inquiry') {
        addressInfo = `Inquiry Message: ${formData.inquiryMessage}`;
      }
    } else {
      // For product_inquiry businesses, addressInfo is handled directly in the message format
      addressInfo = '';
    }
    
    let message;
    if (isInquiryBusiness) {
      if (deliveryOption === 'pickup') {
        message = `Hello ${selectedBusiness.name}, could you please provide the price for the following ${orderSummary}\nI would like pickup on ${pickupTime}\nName: ${customerName}`;
      } else if (deliveryOption === 'island_wide') {
        message = `Hello ${selectedBusiness.name}, could you please provide the price for the following ${orderSummary}along with the price to have it delivered to ${deliveryAddress} in the parish of ${formData.parish}\nName: ${customerName}`;
      } else if (deliveryOption === 'overseas') {
        message = `Hello ${selectedBusiness.name}, could you please provide the price for the following ${orderSummary}along with the price to have it delivered to ${deliveryAddress} in ${formData.country || ''}\nName: ${customerName}`;
      }
    } else {
      message = `Hello ${selectedBusiness.name}, I would like to place an order for:\n${orderSummary}\nName: ${customerName}\nDelivery Method: ${deliveryMethod}\n${addressInfo}`;
    }
    
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message || '')}`;
    
    try {
      window.open(url, '_blank');
      clearCart();
      toast({
        title: "Order Sent!",
        description: "Your order has been sent via WhatsApp",
      });
      setLocation('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not open WhatsApp",
        variant: "destructive"
      });
    }
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Shopping Cart</h1>
          </div>
          
          <div className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="h-24 w-24 text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground text-center mb-4">
              Add some plants to your cart to get started
            </p>
            <Button onClick={() => setLocation('/')}>
              Start Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <AlertDialog open={itemToRemove !== null} onOpenChange={() => setItemToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from your cart?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToRemove(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (itemToRemove !== null) {
                  removeFromCart(itemToRemove);
                  setItemToRemove(null);
                  toast({
                    title: "Item Removed",
                    description: "The item has been removed from your cart",
                    duration: 1500
                  });
                }
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Shopping Cart</h1>
        </div>

        {/* Order Items */}
        <div className="space-y-4 mb-6">
          {orders.map((order, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium">{order.product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {order.product.description}
                    </p>
                    {order.business.profileType !== 'product_inquiry' && (
                      <p className="text-sm font-medium">
                        ${Math.round(order.product.price)} x {order.quantity}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 mr-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          if (order.quantity > 1) {
                            addToCart(order.product, order.business, order.quantity - 1);
                          } else {
                            setItemToRemove(index);
                          }
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{order.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => addToCart(order.product, order.business, order.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setItemToRemove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Customer Information Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customerName">Your Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            {(selectedBusiness?.hasDelivery || selectedBusiness?.profileType === 'product_inquiry') && (
              <div>
                <Label>Delivery Option</Label>
                <RadioGroup
                  value={deliveryOption}
                  onValueChange={handleDeliveryOptionChange}
                  className="mt-2"
                >
                  {selectedBusiness?.profileType !== 'product_inquiry' && (
                    <>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <Label htmlFor="pickup">Pickup</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="delivery" id="delivery" />
                        <Label htmlFor="delivery">Delivery</Label>
                      </div>
                      {selectedBusiness?.islandWideDelivery && (
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="island_wide" id="island_wide" />
                          <Label htmlFor="island_wide">Island Wide Delivery</Label>
                        </div>
                      )}
                    </>
                  )}
                  {selectedBusiness?.profileType === 'product_inquiry' && (
                    <>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <Label htmlFor="pickup">Pickup</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="island_wide" id="island_wide" />
                        <Label htmlFor="island_wide">Island Wide Delivery</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="overseas" id="overseas" />
                        <Label htmlFor="overseas">Overseas Shipping</Label>
                      </div>
                    </>
                  )}
                </RadioGroup>
              </div>
            )}

            {selectedBusiness?.profileType !== 'product_inquiry' ? (
              // Regular business delivery options
              (deliveryOption === 'delivery' || deliveryOption === 'island_wide') ? (
                <div>
                  <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                  <Input
                    id="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                    placeholder="Enter delivery address"
                  />
                </div>
              ) : deliveryOption === 'pickup' ? (
                <div>
                  <Label htmlFor="pickupTime">Preferred Pickup Time *</Label>
                  <Input
                    id="pickupTime"
                    value={formData.pickupTime}
                    onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                    placeholder="e.g., 2:00 PM today"
                  />
                </div>
              ) : deliveryOption === 'inquiry' ? (
                <div>
                  <Label htmlFor="inquiryMessage">Your Inquiry Message *</Label>
                  <Input
                    id="inquiryMessage"
                    value={formData.inquiryMessage}
                    onChange={(e) => handleInputChange('inquiryMessage', e.target.value)}
                    placeholder="Enter your questions about this product"
                  />
                </div>
              ) : null
            ) : (
              // Product inquiry business delivery options
              deliveryOption === 'pickup' ? (
                <div>
                  <Label htmlFor="pickupTime">Date and Time *</Label>
                  <Input
                    id="pickupTime"
                    value={formData.pickupTime}
                    onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                    placeholder="Enter preferred date and time"
                  />
                </div>
              ) : deliveryOption === 'island_wide' ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="parish">Parish *</Label>
                    <Input
                      id="parish"
                      value={formData.parish || ''}
                      onChange={(e) => handleInputChange('parish', e.target.value)}
                      placeholder="Enter parish"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryAddress">Address *</Label>
                    <Input
                      id="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                      placeholder="Enter delivery address"
                    />
                  </div>
                </div>
              ) : deliveryOption === 'overseas' ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.country || ''}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="Enter country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryAddress">Address *</Label>
                    <Input
                      id="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                      placeholder="Enter delivery address"
                    />
                  </div>
                </div>
              ) : null
            )
          }
          </CardContent>
        </Card>

        {/* Order Summary */}
        {selectedBusiness?.profileType !== 'product_inquiry' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${Math.round(subtotal)}</span>
                </div>
                {deliveryCost > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery Cost</span>
                    <span>${Math.round(deliveryCost)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${Math.round(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Send Order Button */}
        <Button 
          onClick={handleSendOrder}
          className="w-full"
          size="lg"
        >
          {selectedBusiness?.profileType === 'product_inquiry' 
            ? 'Send Price Inquiry via WhatsApp' 
            : 'Send Order via WhatsApp'}
        </Button>
      </div>
    </div>
  );
}