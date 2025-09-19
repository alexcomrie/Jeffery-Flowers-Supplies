# Product Inquiry Implementation Plan

## Overview

This document outlines the implementation plan for adding a new business type called "product_inquiry" to TheHub Web app. This business type will allow customers to inquire about products without seeing prices, enabling businesses to provide custom quotes based on customer requirements.

## Requirements Summary

When a business profile is set to "product_inquiry":

1. Product prices will not be visible in both product list and product details pages
2. Customers can still add products to cart, but price totals will be disabled when setting quantity
3. Shopping cart changes:
   - Customer info section will retain name input field, but all prices will be disabled
   - Delivery options will be replaced with a dropdown containing: "pickup", "island wide delivery", and "overseas shipping"
   - Each delivery option will have specific input fields:
     - Pickup: Date and time input
     - Island wide delivery: Parish input and address input
     - Overseas shipping: Country input (with validation for "Jamaica") and address input
4. Order summary will be disabled
5. "Send order via WhatsApp" button will be renamed to "Send inquiry via WhatsApp"
6. WhatsApp message format will change based on delivery option:
   - Pickup: "Hello [business name], could you please provide the price for the following [selected products]. I would like pickup on [pickup date and time]"
   - Island wide delivery: "Hello [business name], could you please provide the price for the following [selected products] along with the price to have it delivered to [delivery address] in the parish of [entered parish]"
   - Overseas shipping: "Hello [business name], could you please provide the price for the following [selected products] along with the price to have it delivered to [delivery address] in [entered country]"
7. Business profile delivery information will display "Delivery available" with info stating "Delivery option available in inquiry"

## Implementation Plan

### 1. Schema Updates

**File: `/shared/schema.ts`**

- Update the `BusinessSchema` to include "product_inquiry" in the `profileType` enum
- Update the `CartSchema` to accommodate the new delivery options and fields

### 2. Business Profile Component Updates

**File: `/client/src/pages/business-profile.tsx`**

- Update the conditional rendering to handle the new "product_inquiry" profile type
- Modify the delivery information display for "product_inquiry" businesses

### 3. Product List Updates

**File: `/client/src/pages/product-list.tsx`**

- Add conditional rendering to hide prices when business type is "product_inquiry"
- Ensure "Add to Cart" functionality remains available

### 4. Product Details Updates

**File: `/client/src/pages/product-details.tsx`**

- Add conditional rendering to hide prices when business type is "product_inquiry"
- Ensure "Add to Cart" functionality remains available

### 5. Quantity Selector Updates

**File: `/client/src/components/quantity-selector.tsx`**

- Modify to conditionally hide price information when business type is "product_inquiry"
- Ensure quantity selection still works correctly

### 6. Cart Provider Updates

**File: `/client/src/providers/cart-provider.tsx`**

- Update the CartContext interface to include new delivery options
- Modify state management to handle the new fields (parish, country, etc.)
- Update localStorage handling for the new fields

### 7. Cart Page Updates

**File: `/client/src/pages/cart.tsx`**

- Add conditional rendering to hide prices when business type is "product_inquiry"
- Update the delivery options dropdown to show the new options
- Implement dynamic form fields based on selected delivery option
- Add validation for "Jamaica" in country field
- Update the WhatsApp message generation to use the new formats
- Rename "Send order via WhatsApp" button to "Send inquiry via WhatsApp"

## Testing Plan

1. **Schema Validation**
   - Verify that "product_inquiry" is accepted as a valid business type

2. **Business Profile Display**
   - Verify that delivery information displays correctly for "product_inquiry" businesses

3. **Product List and Details**
   - Verify that prices are hidden for "product_inquiry" businesses
   - Verify that "Add to Cart" functionality works correctly

4. **Quantity Selector**
   - Verify that price information is hidden for "product_inquiry" businesses
   - Verify that quantity selection works correctly

5. **Shopping Cart**
   - Verify that prices are hidden for "product_inquiry" businesses
   - Verify that the new delivery options dropdown works correctly
   - Verify that the appropriate input fields appear based on the selected delivery option
   - Verify that validation works for the "Jamaica" country input
   - Verify that the WhatsApp message is formatted correctly for each delivery option

## Implementation Sequence

1. Update schema files first to establish the foundation
2. Update the cart provider to handle the new state management requirements
3. Modify the quantity selector component
4. Update product list and details pages to hide prices
5. Update the cart page with the new delivery options and form fields
6. Update the business profile page to display the correct delivery information
7. Test all components thoroughly

## Potential Challenges

1. **State Management**: Ensuring that the new delivery options and fields are properly managed in the cart provider
2. **Conditional Rendering**: Implementing consistent price hiding across all components
3. **Form Validation**: Implementing proper validation for the new form fields
4. **WhatsApp Message Formatting**: Ensuring that the message is formatted correctly for each delivery option

## Conclusion

This implementation plan provides a comprehensive roadmap for adding the "product_inquiry" business type to TheHub Web app. By following this plan, the development team can ensure that all requirements are met and that the new functionality is implemented correctly.