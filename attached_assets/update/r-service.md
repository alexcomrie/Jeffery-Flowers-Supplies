import { ProductReview } from '@shared/schema';

// API endpoint for reviews
const REVIEW_API_URL = 'https://script.google.com/macros/s/AKfycby3aSa6II7qhuEjWCiqaE9wzu_KECalfTDzUCRUxHMrJSTIm8jkbJqniImimr4HQMDT/exec';

// Response interface for review API
export type ReviewResponse = ProductReview[]

// Response interface for review summary API
export interface ReviewSummaryResponse {
  productId: string;
  businessId: string;
  averageRating: number;
  totalReviews: number;
}

/**
 * Fetches reviews for a specific product
 */
export async function getReviews(productId: string): Promise<ReviewResponse> {
  try {
    const response = await fetch(`${REVIEW_API_URL}?action=getReviews&productId=${productId}`, {
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reviews: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch reviews');
    }
    return data.reviews || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    console.error('Error fetching reviews:', error);
    return [];
  }
}

/**
 * Submits a review for a product
 */
export async function submitReview(productId: string, review: Omit<ProductReview, 'id' | 'productId'>): Promise<ReviewResponse> {
  try {
    const response = await fetch(REVIEW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `productId=${productId}&username=${review.username}&rating=${review.rating}&comment=${review.comment}&timestamp=${review.timestamp}&action=submitReview`,
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to submit review: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to submit review');
    }
    return data.reviews || [];
  } catch (error) {
    console.error('Error submitting review:', error);
    console.error('Error submitting review:', error);
    return [];
  }
}

/**
 * Fetches review summary for a specific product
 */
export async function getProductReviewSummary(productId: string, businessId: string): Promise<ReviewSummaryResponse> {
  try {
    const response = await fetch(`${REVIEW_API_URL}?action=getReviewSummary&productId=${productId}&businessId=${businessId}`, {
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch review summary: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch review summary');
    }
    return data.summary || {
      productId,
      businessId,
      averageRating: 0,
      totalReviews: 0
    };
  } catch (error) {
    console.error('Error fetching review summary:', error);
    return {
      productId,
      businessId,
      averageRating: 0,
      totalReviews: 0
    };
  }
}