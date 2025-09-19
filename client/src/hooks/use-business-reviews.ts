import { useEffect, useState } from 'react';
import { BusinessReview } from '@/types/review';
import { getBusinessReviews } from '@/services/review-service';

interface BusinessReviewSummary {
  businessId: string;
  totalReviews: number;
  averageRating: number;
}

interface UseBusinessReviewsResult {
  reviews: BusinessReview[];
  summary: BusinessReviewSummary | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => Promise<void>;
}

export function useBusinessReviews(businessId: string): UseBusinessReviewsResult {
  const [reviews, setReviews] = useState<BusinessReview[]>([]);
  const [summary, setSummary] = useState<BusinessReviewSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getBusinessReviews(businessId);
      
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
  }, [businessId]);

  return {
    reviews,
    summary,
    isLoading,
    error,
    mutate: fetchReviews,
  };
}