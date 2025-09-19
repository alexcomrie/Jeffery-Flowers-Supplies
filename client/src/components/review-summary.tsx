import React from 'react';
import { StarRating } from './star-rating';
import { useProductReviews } from '@/hooks/use-product-reviews';

interface ReviewSummaryProps {
  productId: string;
  businessId: string;
  className?: string;
}

export function ReviewSummary({ productId, businessId, className }: ReviewSummaryProps) {
  const { summary, isLoading, error } = useProductReviews(productId, businessId);
  
  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 animate-pulse">
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error || !summary) {
    return null;
  }
  
  const { averageRating, totalReviews } = summary;
  
  if (totalReviews === 0) {
    return (
      <div className={className}>
        <p className="text-sm text-gray-500">No reviews yet</p>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <StarRating rating={averageRating || 0} size="sm" />
        <span className="text-sm font-medium">{averageRating ? averageRating.toFixed(1) : '0.0'}</span>
        <span className="text-sm text-gray-500">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
      </div>
    </div>
  );
}