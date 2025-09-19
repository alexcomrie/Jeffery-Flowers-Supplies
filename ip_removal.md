# IP Address Removal Plan

## Overview

This document outlines the plan to remove IP address-based restrictions from TheHub Web app and replace them with username-based restrictions. The current system uses IP addresses to restrict users to:

1. Only 1 like OR dislike per business (not both)
2. Only 5 reviews per business per day

The new system will use usernames instead, with a special identifier number to uniquely identify each user.

## Current Implementation Analysis

### Backend (Google Apps Script)

1. **IP Address Collection**: The backend receives IP addresses from the frontend with each request.
2. **Restriction Logic**:
   - In `handleVote`: Checks if an IP address has already voted for a business
   - In `handleSubmitReview` and `handleSubmitBusinessReview`: Checks if an IP address has submitted 5 reviews for a business in a day

### Frontend

1. **IP Address Collection**: Both `review-service.ts` and `vote-service.ts` use the `getIpAddress()` function to fetch the user's IP from `https://api.ipify.org?format=json`
2. **Username Management**: The app uses a `UsernameProvider` that stores usernames in localStorage
3. **Schema**: The app has a `UsernameSchema` that includes username, createdAt, and lastUpdatedAt

## Implementation Plan

### 1. Create User Identifier System

#### Backend Changes

1. Add a new sheet called "Users" to track usernames and their unique identifiers:
   - Columns: Username, UserID, CreatedAt
   - Update `initializeSheets()` to create this sheet if it doesn't exist

2. Create new functions:
   - `getUserId(username)`: Get or create a unique ID for a username
   - `validateUsername(username)`: Ensure username meets requirements

#### Frontend Changes

1. Modify `username-provider.tsx` to generate and store a unique identifier:
   - Add a `userId` field to the context
   - Generate a UUID when setting a username if one doesn't exist
   - Store the UUID in localStorage alongside the username

### 2. Replace IP-based Restrictions with Username-based Restrictions

#### Backend Changes

1. Update `handleVote` function:
   - Replace IP address filtering with username filtering
   - Change error messages to reference username instead of IP

2. Update `handleSubmitReview` and `handleSubmitBusinessReview` functions:
   - Replace IP address filtering with username filtering
   - Change daily limit checks to use username instead of IP

3. Update sheet structures:
   - Keep IP address columns for analytics but don't use them for restrictions
   - Add UserID column to all sheets for better tracking

#### Frontend Changes

1. Update `review-service.ts` and `vote-service.ts`:
   - Continue sending IP address for analytics purposes
   - Add userId to all requests
   - Update error handling to reflect new username-based restrictions

### 3. Update Database Schema

1. Modify existing sheets to include UserID column
2. Update data mapping in all handler functions

## Implementation Details

### Backend Code Changes

```javascript
// Add to initializeSheets function
let usersSheet = ss.getSheetByName('Users');
if (!usersSheet) {
  usersSheet = ss.insertSheet('Users');
  usersSheet.getRange('A1:C1').setValues([['Username', 'UserID', 'CreatedAt']]);
}

// New function to get or create user ID
function getUserId(username) {
  if (!username) return null;
  
  const usersSheet = ss.getSheetByName('Users');
  const users = usersSheet.getDataRange().getValues();
  
  // Check if user exists
  for (let i = 1; i < users.length; i++) {
    if (users[i][0] === username) {
      return users[i][1]; // Return existing UserID
    }
  }
  
  // Create new user ID if not found
  const userId = Utilities.getUuid();
  usersSheet.appendRow([username, userId, new Date().getTime()]);
  return userId;
}

// Update handleVote function
function handleVote(sheet, data) {
  // Check if data is defined before destructuring
  if (!data) {
    return { 
      success: false, 
      message: 'Missing request data' 
    };
  }
  
  const { businessId, username, voteType, ipAddress } = data;
  
  if (!businessId || !username || !voteType) {
    return { success: false, message: 'Missing required fields' };
  }
  
  // Check existing votes by username instead of IP
  const votes = sheet.getDataRange().getValues();
  const existingVotes = votes.slice(1)
    .filter(row => row[0] === businessId && row[1] === username);
  
  if (existingVotes.some(row => row[2] !== voteType)) {
    return { success: false, message: 'You can only like OR dislike a business, not both' };
  }
  
  if (existingVotes.some(row => row[2] === voteType)) {
    return { success: false, message: 'You have already voted for this business' };
  }
  
  // Get or create user ID
  const userId = getUserId(username);
  
  // Add new vote with user ID
  sheet.appendRow([businessId, username, voteType, new Date().getTime(), ipAddress, userId]);
  
  // Rest of the function remains the same
  // ...
}

// Update handleSubmitReview function
function handleSubmitReview(sheet, data) {
  // Check if data is defined before destructuring
  if (!data) {
    return { 
      success: false, 
      message: 'Missing request data' 
    };
  }
  
  const { productId, businessId, username, rating, comment, ipAddress } = data;
  
  if (!productId || !businessId || !username || !rating) {
    return { success: false, message: 'Missing required fields' };
  }
  
  const timestamp = new Date().getTime();
  const today = new Date().setHours(0, 0, 0, 0);
  
  // Check daily review limit by username instead of IP
  const reviews = sheet.getDataRange().getValues();
  const todayReviews = reviews.slice(1)
    .filter(row => row[2] === username && new Date(row[5]).setHours(0, 0, 0, 0) === today);
  
  // Check if user has already submitted 5 reviews for this business today
  const todayBusinessReviews = todayReviews.filter(row => row[1] === businessId);
  if (todayBusinessReviews.length >= 5) {
    return { success: false, message: 'You have reached the daily limit of 5 reviews per business' };
  }
  
  // Get or create user ID
  const userId = getUserId(username);
  
  // Add new review with user ID
  sheet.appendRow([productId, businessId, username, rating, comment, timestamp, ipAddress, userId]);
  
  // Rest of the function remains the same
  // ...
}

// Update handleSubmitBusinessReview function similarly
// ...
```

### Frontend Code Changes

```typescript
// In username-provider.tsx
import { v4 as uuidv4 } from 'uuid'; // Add UUID library

interface UsernameContextType {
  username: string | null;
  userId: string | null; // Add userId
  setUsername: (username: string) => void;
  clearUsername: () => void;
  isUsernameSet: boolean;
  lastUsernameChange: number | null;
}

export function UsernameProvider({ children }: UsernameProviderProps) {
  const [username, setUsernameState] = useState<string | null>(null);
  const [userId, setUserIdState] = useState<string | null>(null);
  
  // Load username and userId from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    const savedUserId = localStorage.getItem('userId');
    
    if (savedUsername) {
      setUsernameState(savedUsername);
    }
    
    if (savedUserId) {
      setUserIdState(savedUserId);
    }
  }, []);

  const setUsername = (newUsername: string) => {
    if (newUsername && newUsername.trim().length >= 3) {
      // Save username to localStorage
      localStorage.setItem('username', newUsername);
      
      // Generate or keep userId
      let newUserId = localStorage.getItem('userId');
      if (!newUserId) {
        newUserId = uuidv4();
        localStorage.setItem('userId', newUserId);
      }
      
      // Update state
      setUsernameState(newUsername);
      setUserIdState(newUserId);
      
      // Create timestamp for tracking when username was set/updated
      const timestamp = Date.now();
      localStorage.setItem('username_created_at', timestamp.toString());
      localStorage.setItem('username_updated_at', timestamp.toString());
    }
  };

  const clearUsername = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('userId'); // Also clear userId
    localStorage.removeItem('username_created_at');
    localStorage.removeItem('username_updated_at');
    setUsernameState(null);
    setUserIdState(null);
  };

  const value = {
    username,
    userId,
    setUsername,
    clearUsername,
    isUsernameSet: !!username,
    lastUsernameChange: localStorage.getItem('username_updated_at') ? parseInt(localStorage.getItem('username_updated_at')!) : null,
  };

  return (
    <UsernameContext.Provider value={value}>
      {children}
    </UsernameContext.Provider>
  );
}

// In review-service.ts and vote-service.ts

// Update submitReview function
export async function submitReview(
  productId: string,
  businessId: string,
  rating: number,
  comment: string
): Promise<ReviewResponse> {
  try {
    const username = localStorage.getItem('username') || '';
    const userId = localStorage.getItem('userId') || ''; // Get userId
    const timestamp = new Date().getTime();
    
    const formData = new URLSearchParams();
    formData.append('action', 'submitReview');
    formData.append('productId', productId);
    formData.append('businessId', businessId);
    formData.append('username', username);
    formData.append('userId', userId); // Add userId to request
    formData.append('rating', rating.toString());
    formData.append('comment', comment);
    formData.append('timestamp', timestamp.toString());
    formData.append('ipAddress', await getIpAddress()); // Keep for analytics

    // Rest of the function remains the same
    // ...
  }
}

// Update vote function similarly
// ...
```

## Testing Plan

1. Test username creation and ID generation
2. Test voting restrictions with the same username
3. Test review submission limits with the same username
4. Verify that changing username doesn't reset restrictions
5. Test edge cases (empty username, etc.)

## Migration Plan

1. Deploy backend changes first
2. Update frontend to include userId in requests
3. Monitor for any issues
4. Keep IP address collection for analytics purposes

## Conclusion

This plan replaces IP-based restrictions with username-based restrictions while maintaining the same user experience. The addition of a unique identifier ensures that users cannot bypass restrictions by simply changing their username. The implementation maintains backward compatibility with existing data and adds new functionality for better user tracking.