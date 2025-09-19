import { useEffect, useState } from 'react';
import { ProductReview } from '@/types/review';
import { getProductReviews } from '@/services/review-service';

interface ProductReviewSummary {
  productId: string;
  businessId: string;
  totalReviews: number;
  averageRating: number;
}

interface UseProductReviewsResult {
  reviews: ProductReview[];
  summary: ProductReviewSummary | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => Promise<void>;
}

export function useProductReviews(productId: string, businessId: string): UseProductReviewsResult {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [summary, setSummary] = useState<ProductReviewSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getProductReviews(productId, businessId);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch reviews');
      }

      if (response.reviews) {
        setReviews(response.reviews);
      }
      
      if (response.summary) {
        setSummary(response.summary);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, businessId]);

  return {
    reviews,
    summary,
    isLoading,
    error,
    mutate: fetchReviews,
  };
}