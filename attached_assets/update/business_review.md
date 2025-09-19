# Business Review Service Implementation

```typescript
// src/services/business-review-service.ts

// API endpoint for business reviews (use the same endpoint as product reviews)
const REVIEW_API_URL = 'https://script.google.com/macros/s/AKfycbzXttDdokt5xJjnkMvvvji7ibhl7z1HmOn91otBgTcYHsJdqCPYoeHg6YrWZV7U1kLz/exec';

// Business review interface
export interface BusinessReview {
  id: string;
  businessId: string;
  username: string;
  rating: number;
  comment: string;
  timestamp: number;
}

// Response interface for business review API
export type BusinessReviewResponse = BusinessReview[]

// Response interface for business review summary API
export interface BusinessReviewSummaryResponse {
  businessId: string;
  averageRating: number;
  totalReviews: number;
}

/**
 * Fetches reviews for a specific business
 */
export async function getBusinessReviews(businessId: string): Promise<BusinessReviewResponse> {
  try {
    const response = await fetch(`${REVIEW_API_URL}?action=getBusinessReviews&businessId=${businessId}`, {
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch business reviews: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch business reviews');
    }
    return data.reviews || [];
  } catch (error) {
    console.error('Error fetching business reviews:', error);
    return [];
  }
}

/**
 * Submits a review for a business
 */
export async function submitBusinessReview(businessId: string, review: Omit<BusinessReview, 'id' | 'businessId'>): Promise<BusinessReviewResponse> {
  try {
    const response = await fetch(REVIEW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `businessId=${businessId}&username=${review.username}&rating=${review.rating}&comment=${review.comment}&timestamp=${review.timestamp}&action=submitBusinessReview`,
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to submit business review: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to submit business review');
    }
    
    // After successful submission, fetch the updated reviews
    const updatedReviews = await getBusinessReviews(businessId);
    return updatedReviews;
  } catch (error) {
    console.error('Error submitting business review:', error);
    throw error; // Re-throw the error to be handled by the mutation
  }
}

/**
 * Fetches review summary for a specific business
 */
export async function getBusinessReviewSummary(businessId: string): Promise<BusinessReviewSummaryResponse> {
  try {
    const response = await fetch(`${REVIEW_API_URL}?action=getBusinessReviewSummary&businessId=${businessId}`, {
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch business review summary: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch business review summary');
    }
    return data.summary || {
      businessId,
      averageRating: 0,
      totalReviews: 0
    };
  } catch (error) {
    console.error('Error fetching business review summary:', error);
    return {
      businessId,
      averageRating: 0,
      totalReviews: 0
    };
  }
}
```

## Google Apps Script Updates

Add these cases to the existing Google Apps Script:

```javascript
// In doGet function
case 'getBusinessReviews':
  const businessReviewsSheet = ss.getSheetByName('Reviews');
  const targetBusinessId = data.businessId;
  
  // Get all reviews for the business
  const businessReviews = businessReviewsSheet.getDataRange().getValues();
  const filteredBusinessReviews = businessReviews.slice(1)
    .filter(row => row[0] === targetBusinessId)
    .map(row => ({
      id: `${row[0]}-${row[1]}-${row[4]}`,
      businessId: row[0],
      username: row[1],
      rating: row[2],
      comment: row[3],
      timestamp: row[4]
    }));
  
  response = {
    success: true,
    reviews: filteredBusinessReviews
  };
  break;

case 'getBusinessReviewSummary':
  const businessSummarySheet = ss.getSheetByName('Reviews');
  const summaryBusinessId = data.businessId;
  
  // Get all reviews for calculating summary
  const summaryReviews = businessSummarySheet.getDataRange().getValues();
  const businessReviewsForSummary = summaryReviews.slice(1)
    .filter(row => row[0] === summaryBusinessId);
  
  const totalReviews = businessReviewsForSummary.length;
  const summaryTotalRating = businessReviewsForSummary.reduce((sum, row) => sum + row[2], 0);
  const summaryAverageRating = totalReviews > 0 ? summaryTotalRating / totalReviews : 0;
  
  response = {
    success: true,
    summary: {
      businessId: summaryBusinessId,
      averageRating: summaryAverageRating,
      totalReviews: totalReviews
    }
  };
  break;

// In doPost function
case 'submitBusinessReview':
  const businessReviewSheet = ss.getSheetByName('Reviews');
  const businessReview = {
    businessId: data.businessId,
    username: data.username,
    rating: parseInt(data.rating),
    comment: data.comment,
    timestamp: parseInt(data.timestamp)
  };
  
  // Validate required fields
  if (!businessReview.businessId || !businessReview.username || !businessReview.rating) {
    response = { success: false, message: 'Missing required fields' };
    break;
  }
  
  // Add new review
  businessReviewSheet.appendRow([
    businessReview.businessId,
    businessReview.username,
    businessReview.rating,
    businessReview.comment,
    businessReview.timestamp
  ]);
  
  // Get updated reviews
  const updatedBusinessReviews = businessReviewSheet.getDataRange().getValues()
    .slice(1)
    .filter(row => row[0] === businessReview.businessId)
    .map(row => ({
      id: `${row[0]}-${row[1]}-${row[4]}`,
      businessId: row[0],
      username: row[1],
      rating: row[2],
      comment: row[3],
      timestamp: row[4]
    }));
  
  response = {
    success: true,
    message: 'Review submitted successfully',
    reviews: updatedBusinessReviews
  };
  break;
```