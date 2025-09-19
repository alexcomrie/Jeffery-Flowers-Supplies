import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { StarRating } from './star-rating';
import { useSubmitProductReview } from '@/hooks/use-submit-product-review';
import { UsernameModal } from './username-modal';

interface ReviewFormProps {
  productId: string;
  businessId: string;
  className?: string;
  isComingSoon?: boolean;
}

export function ReviewForm({ productId, businessId, className, isComingSoon = false }: ReviewFormProps) {
  const { submit, isSubmitting, error: submitError } = useSubmitProductReview(productId, businessId);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  
  // Handle rating change
  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    if (error) setError('');
  };
  
  // Handle comment change
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    if (error) setError('');
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (!comment.trim()) {
      setError('Please enter a comment');
      return;
    }
    
    // Submit review
    try {
      await submit(rating, comment);
      // Reset form
      setRating(0);
      setComment('');
    } catch (err) {
      if (err instanceof Error && err.message === 'Username is required') {
        setIsUsernameModalOpen(true);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred while submitting your review');
      }
    }
  };
  
  // Close username modal
  const handleCloseUsernameModal = () => {
    setIsUsernameModalOpen(false);
  };
  
  return (
    <>
      <form onSubmit={handleSubmit} className={className}>
        <div className="space-y-4">
          <div>
            <label htmlFor="rating" className="block text-sm font-medium mb-1">
              Rating
            </label>
            <StarRating 
              rating={rating} 
              interactive={!isComingSoon} 
              onChange={!isComingSoon ? handleRatingChange : undefined} 
              size="lg" 
            />
          </div>
          
          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-1">
              Review
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={handleCommentChange}
              placeholder="Share your experience with this product..."
              rows={4}
              disabled={isSubmitting || isComingSoon}
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}
          
          <Button type="submit" disabled={isSubmitting || isComingSoon}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </form>
      
      {/* Username Modal */}
      <UsernameModal 
        isOpen={isUsernameModalOpen} 
        onClose={handleCloseUsernameModal} 
      />
    </>
  );
}