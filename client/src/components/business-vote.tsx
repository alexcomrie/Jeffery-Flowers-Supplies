import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from './ui/button';
import { useBusinessVotes } from '@/hooks/use-votes';
import { UsernameModal } from './username-modal';

interface BusinessVoteProps {
  businessId: string;
  isComingSoon?: boolean;
}

export function BusinessVote({ businessId, isComingSoon = false }: BusinessVoteProps) {
  const { votes, isLoading, submitVote, isUsernameRequired } = useBusinessVotes(businessId);
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  
  // Handle vote action
  const handleVote = (voteType: 'like' | 'dislike') => {
    if (isUsernameRequired) {
      // Open username modal if username is not set
      setIsUsernameModalOpen(true);
      return;
    }
    
    submitVote(voteType);
  };
  
  // Close username modal
  const handleCloseUsernameModal = () => {
    setIsUsernameModalOpen(false);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <Button variant="ghost" size="sm" disabled>
          <ThumbsUp className="h-4 w-4 mr-1" />
          <span>-</span>
        </Button>
        <Button variant="ghost" size="sm" disabled>
          <ThumbsDown className="h-4 w-4 mr-1" />
          <span>-</span>
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant={votes?.userVote === 'like' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => !isComingSoon && handleVote('like')}
          disabled={isComingSoon}
          aria-label="Like"
        >
          <ThumbsUp className="h-4 w-4 mr-1" />
          <span>{votes?.likes || 0}</span>
        </Button>
        
        <Button
          variant={votes?.userVote === 'dislike' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => !isComingSoon && handleVote('dislike')}
          disabled={isComingSoon}
          aria-label="Dislike"
        >
          <ThumbsDown className="h-4 w-4 mr-1" />
          <span>{votes?.dislikes || 0}</span>
        </Button>
      </div>
      
      {/* Username Modal */}
      <UsernameModal 
        isOpen={isUsernameModalOpen} 
        onClose={handleCloseUsernameModal} 
      />
    </>
  );
}