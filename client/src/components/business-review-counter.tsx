import { MessageCircle, Star } from "lucide-react";
import { useBusinessReviews } from "@/hooks/use-business-reviews";

interface BusinessReviewCounterProps {
  businessId: string;
}

export function BusinessReviewCounter({ businessId }: BusinessReviewCounterProps) {
  const { summary, isLoading, error } = useBusinessReviews(businessId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <MessageCircle className="w-4 h-4" />
        <span>Loading...</span>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <MessageCircle className="w-4 h-4" />
        <span>0</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <MessageCircle className="w-4 h-4" />
        <span>{summary.totalReviews}</span>
      </div>
      {summary.totalReviews > 0 && (
        <div className="flex items-center gap-1 text-sm text-yellow-500">
          <Star className="w-4 h-4 fill-current" />
          <span>{summary.averageRating.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
}