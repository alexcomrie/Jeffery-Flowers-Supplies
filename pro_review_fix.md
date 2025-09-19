# Product Review System Refactoring Plan

## Overview
This plan outlines the steps to remove the current product review implementation and replace it with a new system based on the existing business review code. The business review implementation will remain untouched.

## Phase 1: Identify and Remove Current Product Review Code

### 1. Product Details Page (`product-details.tsx`)
- Remove the following imports:
  ```typescript
  import { ReviewForm } from "@/components/review-form";
  import { ReviewList } from "@/components/review-list";
  import { ReviewSummary } from "@/components/review-summary";
  ```
- Remove the "Review System" section from the UI (lines ~270-280):
  ```typescript
  <div className="mt-8 space-y-6">
    <div className="border-t pt-6">
      <h3 className="text-xl font-semibold mb-4">Reviews</h3>
      <div className="mb-6">
        <ReviewSummary productId={product.id} businessId={business.id} />
      </div>
      <div className="mb-6">
        <ReviewForm productId={product.id} businessId={business.id} isComingSoon={business.status.toLowerCase() === 'coming_soon'} />
      </div>
      <ReviewList productId={product.id} businessId={business.id} />
    </div>
  </div>
  ```

### 2. Product List Page (`product-list.tsx`)
- Remove the `ReviewCount` component and its implementation (lines ~17-45)
- Remove the `useProductReviewSummary` hook import
- Remove the review count display from product cards (around line ~290):
  ```typescript
  <ReviewCount productId={product.id} businessId={business.id} />
  ```

### 3. Review Hooks and Services
- In `use-reviews.ts`, remove the following hooks:
  - `useProductReviews` (lines ~10-100)
  - `useProductReviewSummary` (if present)
  - Any other product review related functions

### 4. Review Services
- In `review-service.ts`, remove the following functions:
  - `getReviews` (lines ~28-60)
  - `submitReview` (lines ~65-95)
  - `getProductReviewSummary` (lines ~150-180)

## Phase 2: Implement New Product Review System

### 1. Create New Product Review Components

#### Create `product-review-form.tsx`
- Based on `business-review-form.tsx`
- Modify the interface to accept product-specific props:
  ```typescript
  interface ProductReviewFormProps {
    productId: string;
    businessId: string;
    onSubmit: (rating: number, comment: string) => void;
    isSubmitting?: boolean;
    isComingSoon?: boolean;
  }
  ```

#### Create `product-review-list.tsx`
- Based on `business-review-list.tsx`
- Modify to use the new product review hooks:
  ```typescript
  interface ProductReviewListProps {
    productId: string;
    businessId: string;
  }
  
  export function ProductReviewList({ productId, businessId }: ProductReviewListProps) {
    const { reviews, isLoading, error } = useProductReviews(productId, businessId);
    // Rest of the implementation similar to BusinessReviewList
  }
  ```

#### Create `product-review-counter.tsx`
- Based on `business-review-counter.tsx`
- Modify to use product review data:
  ```typescript
  interface ProductReviewCounterProps {
    productId: string;
    businessId: string;
  }
  
  export function ProductReviewCounter({ productId, businessId }: ProductReviewCounterProps) {
    const { summary, isLoading, error } = useProductReviews(productId, businessId);
    // Rest of the implementation similar to BusinessReviewCounter
  }
  ```

### 2. Create New Product Review Hooks

#### Create `use-product-reviews.ts`
- Based on `use-business-reviews.ts`
- Implement the hook to fetch and manage product reviews:
  ```typescript
  import { useEffect, useState } from 'react';
  import { ProductReview, ProductReviewSummary, getProductReviews } from '@/services/review-service';
  
  interface UseProductReviewsResult {
    reviews: ProductReview[];
    summary: ProductReviewSummary | null;
    isLoading: boolean;
    error: Error | null;
    mutate: () => Promise<void>;
  }
  
  export function useProductReviews(productId: string, businessId: string): UseProductReviewsResult {
    // Implementation similar to useBusinessReviews but for products
  }
  ```

#### Create `use-submit-product-review.ts`
- Based on `use-submit-business-review.ts`
- Implement the hook for submitting product reviews

### 3. Update Review Services

#### Add to `review-service.ts`
- Create new product review service functions based on business review implementations:
  ```typescript
  /**
   * Fetches reviews for a specific product
   */
  export async function getProductReviews(productId: string, businessId: string): Promise<ReviewResponse> {
    try {
      const params = new URLSearchParams({
        action: 'getProductReviews',
        productId,
        businessId
      });
      // Rest of implementation similar to getBusinessReviews
    } catch (error) {
      // Error handling
    }
  }
  
  /**
   * Submits a review for a product
   */
  export async function submitProductReview(
    productId: string,
    businessId: string,
    rating: number,
    comment: string
  ): Promise<ReviewResponse> {
    // Implementation similar to submitBusinessReview
  }
  ```

### 4. Update Product Details Page

- In `product-details.tsx`, add the new product review components:
  ```typescript
  import { ProductReviewForm } from "@/components/product-review-form";
  import { ProductReviewList } from "@/components/product-review-list";
  import { ProductReviewCounter } from "@/components/product-review-counter";
  
  // Then in the JSX:
  <div className="mt-8 space-y-6">
    <div className="border-t pt-6">
      <h3 className="text-xl font-semibold mb-4">Reviews</h3>
      <div className="mb-6">
        <ProductReviewCounter productId={product.id} businessId={business.id} />
      </div>
      <div className="mb-6">
        <ProductReviewForm 
          productId={product.id} 
          businessId={business.id} 
          isComingSoon={business.status.toLowerCase() === 'coming_soon'} 
          onSubmit={(rating, comment) => {
            // Handle submission
          }}
        />
      </div>
      <ProductReviewList productId={product.id} businessId={business.id} />
    </div>
  </div>
  ```

### 5. Update Product List Page

- In `product-list.tsx`, add the new product review counter:
  ```typescript
  import { ProductReviewCounter } from "@/components/product-review-counter";
  
  // Then in the product card JSX:
  <ProductReviewCounter productId={product.id} businessId={business.id} />
  ```

## Phase 3: Testing and Validation

1. Test the removal of old product review system
   - Ensure no errors or references to removed components
   - Verify UI renders correctly without review components

2. Test the new product review system
   - Verify review submission works
   - Verify review display works
   - Verify review counts update correctly
   - Test error handling and edge cases

3. Verify business review system still works correctly
   - Ensure business reviews are unaffected by changes
   - Test business review submission and display

## Implementation Notes

- The business review system uses a simpler approach with useState and useEffect, while the current product review system uses React Query. Consider which approach to use for the new implementation.
- Ensure proper error handling in all new components
- Implement localStorage caching for API responses to handle network errors
- Consider adding loading states and error states for all review components
- Make sure to update the API endpoints in the Google Apps Script to support the new product review endpoints if needed