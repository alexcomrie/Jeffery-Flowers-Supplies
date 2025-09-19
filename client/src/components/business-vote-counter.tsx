import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useBusinessVotes } from '@/hooks/use-votes';

interface BusinessVoteCounterProps {
  businessId: string;
}

export function BusinessVoteCounter({ businessId }: BusinessVoteCounterProps) {
  const { votes, isLoading } = useBusinessVotes(businessId);
  
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 animate-pulse text-muted-foreground">
        <div className="flex items-center gap-1">
          <ThumbsUp className="h-4 w-4" />
          <span>-</span>
        </div>
        <div className="flex items-center gap-1">
          <ThumbsDown className="h-4 w-4" />
          <span>-</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="flex items-center gap-1">
        <ThumbsUp className="h-4 w-4" />
        <span>{votes?.likes || 0}</span>
      </div>
      <div className="flex items-center gap-1">
        <ThumbsDown className="h-4 w-4" />
        <span>{votes?.dislikes || 0}</span>
      </div>
    </div>
  );
}