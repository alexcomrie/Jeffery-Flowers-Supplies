import { useState } from "react";
import { submitBusinessReview } from "@/services/review-service";
import { useUsername } from "@/providers/username-provider";

export function useSubmitBusinessReview(businessId: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { username } = useUsername();

  const submit = async (rating: number, comment: string) => {
    if (!username) {
      throw new Error('Username is required');
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitBusinessReview(businessId, rating, comment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submit,
    isSubmitting,
    error,
  };
}