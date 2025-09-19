import { Star } from "lucide-react";
import { useBusinessReviews } from "@/hooks/use-business-reviews";
import { formatDistanceToNow } from "date-fns";

interface BusinessReviewListProps {
  businessId: string;
}

export function BusinessReviewList({ businessId }: BusinessReviewListProps) {
  const { reviews, isLoading, error } = useBusinessReviews(businessId);
  const sortedReviews = [...(reviews || [])].sort((a, b) => b.timestamp - a.timestamp);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-muted rounded-lg p-4">
            <div className="h-4 bg-muted-foreground/20 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Failed to load reviews
      </div>
    );
  }

  if (!sortedReviews?.length) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No reviews yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedReviews.map((review) => (
        <div key={`${review.businessId}-${review.timestamp}`} className="border rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{review.username}</span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                  />
                ))}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(review.timestamp), { addSuffix: true })}
            </span>
          </div>
          {review.comment && (
            <p className="text-muted-foreground">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}