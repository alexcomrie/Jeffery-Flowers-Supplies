import { BusinessVote } from '@shared/schema';

// API endpoint for votes
const VOTE_API_URL = 'https://script.google.com/macros/s/AKfycby3aSa6II7qhuEjWCiqaE9wzu_KECalfTDzUCRUxHMrJSTIm8jkbJqniImimr4HQMDT/exec';

// Response interface for vote API
export interface VoteResponse {
  success: boolean;
  message: string;
  votes?: {
    businessId: string;
    likes: number;
    dislikes: number;
    userVote?: 'like' | 'dislike' | null;
  };
}

/**
 * Fetches vote data for a specific business
 */
export async function getVotes(businessId: string): Promise<VoteResponse> {
  try {
    // Get username from localStorage
    const username = localStorage.getItem('username') || '';
    
    const response = await fetch(`${VOTE_API_URL}?action=getVotes&businessId=${businessId}&username=${username}`, {
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch votes: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch votes');
    }
    return data;
  } catch (error) {
    console.error('Error fetching votes:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Submits a vote for a business
 */
export async function vote(businessId: string, voteType: 'like' | 'dislike'): Promise<VoteResponse> {
  try {
    const username = localStorage.getItem('username') || '';
    
    const response = await fetch(VOTE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `businessId=${businessId}&username=${username}&voteType=${voteType}&action=vote`,
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to submit vote: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to submit vote');
    }
    return data;
  } catch (error) {
    console.error('Error submitting vote:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}