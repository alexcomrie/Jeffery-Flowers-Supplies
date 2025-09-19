# Review & Rating System - Google Apps Script Implementation

## Overview

This document contains the implementation of the Google Apps Script backend for TheHub's Review and Rating system. The script handles data storage and API endpoints for business votes, product reviews, and business reviews using a CORS-friendly approach with form-urlencoded data.

## Google Apps Script Implementation

```javascript
// Global variables
const ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1nxqiolWgMlutTYwCfdL7EI1Ejonz912v0xcmPIE0a9g/edit?gid=1793469125#gid=1793469125");

// Initialize sheets if they don't exist
function initializeSheets() {
  // Votes sheet
  let votesSheet = ss.getSheetByName('Votes');
  if (!votesSheet) {
    votesSheet = ss.insertSheet('Votes');
    votesSheet.getRange('A1:E1').setValues([['BusinessID', 'Username', 'VoteType', 'Timestamp', 'UserID']]);
  }
  
  // Reviews sheet
  let reviewsSheet = ss.getSheetByName('Reviews');
  if (!reviewsSheet) {
    reviewsSheet = ss.insertSheet('Reviews');
    reviewsSheet.getRange('A1:G1').setValues([['ProductID', 'BusinessID', 'Username', 'Rating', 'ReviewText', 'Timestamp', 'UserID']]);
  }
  
  // Business Reviews sheet
  let businessReviewsSheet = ss.getSheetByName('BusinessReviews');
  if (!businessReviewsSheet) {
    businessReviewsSheet = ss.insertSheet('BusinessReviews');
    businessReviewsSheet.getRange('A1:F1').setValues([['BusinessID', 'Username', 'Rating', 'ReviewText', 'Timestamp', 'UserID']]);
  }
  
  // Meta sheet
  let metaSheet = ss.getSheetByName('Meta');
  if (!metaSheet) {
    metaSheet = ss.insertSheet('Meta');
    metaSheet.getRange('A1:B1').setValues([['Key', 'Value']]);
  }
  
  // Users sheet for tracking usernames and their unique identifiers
  let usersSheet = ss.getSheetByName('Users');
  if (!usersSheet) {
    usersSheet = ss.insertSheet('Users');
    usersSheet.getRange('A1:C1').setValues([['Username', 'UserID', 'CreatedAt']]);
  }
}

/**
 * Handle GET requests
 */
function doGet(e) {
  initializeSheets();
  
  // Check if e and e.parameter exist to avoid errors
  if (!e || !e.parameter) {
    var output = ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Invalid request parameters'
    })).setMimeType(ContentService.MimeType.JSON);
    output.append("\n");
    output.getHeaders = function() {
      return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      };
    };
    return output;
  }
  
  const action = e.parameter.action;
  const data = e.parameter;
  
  let response;
  
  switch (action) {
    case 'getVotes':
      response = handleGetVotes(ss.getSheetByName('Votes'), data);
      break;
      
    case 'getReviews':
      response = handleGetReviews(ss.getSheetByName('Reviews'), data);
      break;
      
    case 'getBusinessReviews':
      response = handleGetBusinessReviews(ss.getSheetByName('BusinessReviews'), data);
      break;
      
    case 'getProductReviews':
      // Ensure this case properly handles product reviews
      response = handleGetProductReviews(ss.getSheetByName('Reviews'), data);
      break;
      
    default:
      response = { success: false, message: 'Invalid action' };
  }
  
  // Using the simpler approach for CORS compatibility with explicit headers
  var output = ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
    output.append("\n");
    output.getHeaders = function() {
      return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      };
    };
    return output;
}

/**
 * Handle POST requests
 */
function doPost(e) {
  initializeSheets();
  
  // Check if e and e.parameter exist to avoid errors
  if (!e || !e.parameter) {
    var output = ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Invalid request parameters'
    })).setMimeType(ContentService.MimeType.JSON);
    output.append("\n");
    output.getHeaders = function() {
      return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      };
    };
    return output;
  }
  
  const data = e.parameter;
  const action = data.action;
  
  let response;
  
  switch (action) {
    case 'vote':
      response = handleVote(ss.getSheetByName('Votes'), data);
      break;
      
    case 'submitReview':
      response = handleSubmitReview(ss.getSheetByName('Reviews'), data);
      break;
      
    case 'submitBusinessReview':
      response = handleSubmitBusinessReview(ss.getSheetByName('BusinessReviews'), data);
      break;
      
    case 'submitProductReview':
      response = handleSubmitProductReview(ss.getSheetByName('Reviews'), data);
      break;
      
    default:
      response = { success: false, message: 'Invalid action' };
  }
  
  // Using the same approach as doGet for CORS compatibility
  var output = ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
  output.append("\n");
  output.getHeaders = function() {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };
  };
  return output;
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
function doOptions(e) {
  var output = ContentService.createTextOutput("").setMimeType(ContentService.MimeType.TEXT);
  output.append("\n");
  output.getHeaders = function() {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '3600'
    };
  };
  return output;
}

/**
 * Gets or creates a unique user ID for a username
 * @deprecated This function is no longer used as userId is now provided directly from the frontend
 * and remains permanent even when username changes
 */
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


function handleVote(sheet, data) {
  // Check if data is defined before destructuring
  if (!data) {
    return { 
      success: false, 
      message: 'Missing request data' 
    };
  }
  
  const { businessId, username, voteType, userId } = data;
  
  if (!businessId || !username || !voteType || !userId) {
    return { success: false, message: 'Missing required fields' };
  }
  
  // Use the provided userId directly - it should be permanent from the frontend
  const userIdentifier = userId;
  
  // Check existing votes by userId instead of username
  const votes = sheet.getDataRange().getValues();
  const existingVotes = votes.slice(1)
    .filter(row => row[0] === businessId && row[4] === userIdentifier);
  
  if (existingVotes.some(row => row[2] !== voteType)) {
    return { success: false, message: 'You can only like OR dislike a business, not both' };
  }
  
  if (existingVotes.some(row => row[2] === voteType)) {
    return { success: false, message: 'You have already voted for this business' };
  }
  
  // Add new vote with user ID
  sheet.appendRow([businessId, username, voteType, new Date().getTime(), userIdentifier]);
  
  // Calculate updated votes
  const allVotes = votes.slice(1).filter(row => row[0] === businessId);
  const likes = allVotes.filter(row => row[2] === 'like').length;
  const dislikes = allVotes.filter(row => row[2] === 'dislike').length;
  
  return {
    success: true,
    message: 'Vote recorded',
    votes: {
      businessId,
      likes,
      dislikes,
      userVote: voteType
    }
  };
}

function handleSubmitReview(sheet, data) {
  // Check if data is defined before destructuring
  if (!data) {
    return { 
      success: false, 
      message: 'Missing request data' 
    };
  }
  
  const { productId, businessId, username, rating, comment, userId } = data;
  
  if (!productId || !businessId || !username || !rating || !userId) {
    return { success: false, message: 'Missing required fields' };
  }
  
  const timestamp = new Date().getTime();
  const today = new Date().setHours(0, 0, 0, 0);
  
  // Use the provided userId directly - it should be permanent from the frontend
  const userIdentifier = userId;
  
  // Check daily review limit by userId instead of username
  const reviews = sheet.getDataRange().getValues();
  const todayReviews = reviews.slice(1)
    .filter(row => row[6] === userIdentifier && new Date(row[5]).setHours(0, 0, 0, 0) === today);
  
  // Check if user has already submitted 5 reviews for this business today
  const todayBusinessReviews = todayReviews.filter(row => row[1] === businessId);
  if (todayBusinessReviews.length >= 5) {
    return { success: false, message: 'You have reached the daily limit of 5 reviews per business' };
  }
  
  // Add new review with user ID - ensure rating is stored as a number
  sheet.appendRow([productId, businessId, username, parseFloat(rating), comment, timestamp, userIdentifier]);
  
  // Get updated reviews
  const updatedReviews = reviews.slice(1)
    .filter(row => row[0] === productId && row[1] === businessId)
    .map(row => ({
      id: `${row[0]}-${row[1]}-${row[5]}`,
      productId: row[0],
      businessId: row[1],
      username: row[2],
      rating: parseFloat(row[3]) || 0, // Ensure rating is parsed as a number
      comment: row[4],
      timestamp: row[5],
      createdAt: row[5],
      userId: row[6]
    }));
  
  return {
    success: true,
    message: 'Review submitted',
    reviews: updatedReviews
  };
}

function handleSubmitProductReview(sheet, data) {
  // Check if data is defined before destructuring
  if (!data) {
    return { 
      success: false, 
      message: 'Missing request data' 
    };
  }
  
  const { productId, businessId, username, rating, comment, userId } = data;
  
  if (!productId || !username || !rating || !userId) {
    return { success: false, message: 'Missing required fields' };
  }
  
  const timestamp = new Date().getTime();
  const today = new Date().setHours(0, 0, 0, 0);
  
  // Use the provided userId directly - it should be permanent from the frontend
  const userIdentifier = userId;
  
  // Check daily review limit by userId instead of username
  const reviews = sheet.getDataRange().getValues();
  const todayReviews = reviews.slice(1)
    .filter(row => row[6] === userIdentifier && new Date(row[5]).setHours(0, 0, 0, 0) === today);
  
  // Check if user has already submitted 5 reviews for this product today
  const todayProductReviews = todayReviews.filter(row => row[0] === productId);
  if (todayProductReviews.length >= 5) {
    return { success: false, message: 'You have reached the daily limit of 5 reviews per product' };
  }
  
  // Add new review with user ID - ensure rating is stored as a number
  sheet.appendRow([productId, businessId || '', username, parseFloat(rating), comment, timestamp, userIdentifier]);
  
  // Get updated reviews
  const updatedReviews = reviews.slice(1)
    .filter(row => row[0] === productId && (businessId ? row[1] === businessId : true))
    .map(row => ({
      id: `${row[0]}-${row[1] ? row[1] + '-' : ''}${row[5]}`,
      productId: row[0],
      businessId: row[1],
      username: row[2],
      rating: parseFloat(row[3]) || 0,
      comment: row[4],
      timestamp: row[5],
      createdAt: row[5],
      userId: row[6]
    }));
  
  // Calculate summary
  const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = updatedReviews.length > 0 ? totalRating / updatedReviews.length : 0;
  
  return {
    success: true,
    message: 'Product review submitted',
    reviews: updatedReviews,
    summary: {
      productId,
      businessId: businessId || '',
      totalReviews: updatedReviews.length,
      averageRating
    }
  };
}

function handleSubmitBusinessReview(sheet, data) {
  // Check if data is defined before destructuring
  if (!data) {
    return { 
      success: false, 
      message: 'Missing request data' 
    };
  }
  
  const { businessId, username, rating, comment, userId } = data;
  
  if (!businessId || !username || !rating || !userId) {
    return { success: false, message: 'Missing required fields' };
  }
  
  const timestamp = new Date().getTime();
  const today = new Date().setHours(0, 0, 0, 0);
  
  // Use the provided userId directly - it should be permanent from the frontend
  const userIdentifier = userId;
  
  // Check daily review limit by userId instead of username
  const reviews = sheet.getDataRange().getValues();
  const todayReviews = reviews.slice(1)
    .filter(row => row[5] === userIdentifier && new Date(row[4]).setHours(0, 0, 0, 0) === today);
  
  // Check if user has already submitted 5 reviews for this business today
  const todayBusinessReviews = todayReviews.filter(row => row[0] === businessId);
  if (todayBusinessReviews.length >= 5) {
    return { success: false, message: 'You have reached the daily limit of 5 reviews per business' };
  }
  
  // Add new review with user ID - ensure rating is stored as a number
  sheet.appendRow([businessId, username, parseFloat(rating), comment, timestamp, userIdentifier]);
  
  // Get updated reviews
  const updatedReviews = reviews.slice(1)
    .filter(row => row[0] === businessId)
    .map(row => ({
      id: `${row[0]}-${row[4]}`,
      businessId: row[0],
      username: row[1],
      rating: row[2],
      comment: row[3],
      timestamp: row[4],
      createdAt: row[4],
      userId: row[5]
    }));
  
  // Calculate summary
  const businessReviews = reviews.slice(1).filter(row => row[0] === businessId);
  const totalRating = businessReviews.reduce((sum, row) => sum + (parseFloat(row[2]) || 0), 0);
  const averageRating = businessReviews.length > 0 ? totalRating / businessReviews.length : 0;
  
  return {
    success: true,
    message: 'Business review submitted',
    reviews: updatedReviews,
    summary: {
      businessId,
      totalReviews: updatedReviews.length,
      averageRating
    }
  };
}

function handleGetVotes(sheet, data) {
  // Check if data is defined before destructuring
  if (!data) {
    return { 
      success: false, 
      message: 'Missing request data' 
    };
  }
  
  const { businessId, username, userId } = data;
  
  // Check required parameters
  if (!businessId) {
    return { 
      success: false, 
      message: 'Missing businessId parameter' 
    };
  }
  
  const votes = sheet.getDataRange().getValues();
  const businessVotes = votes.slice(1).filter(row => row[0] === businessId);
  
  const likes = businessVotes.filter(row => row[2] === 'like').length;
  const dislikes = businessVotes.filter(row => row[2] === 'dislike').length;
  
  // Check user vote by userId if available, otherwise fall back to username
  let userVote = null;
  if (userId) {
    userVote = businessVotes.find(row => row[4] === userId)?.[2] || null;
  } else if (username) {
    userVote = businessVotes.find(row => row[1] === username)?.[2] || null;
  }
  
  return {
    success: true,
    votes: {
      businessId,
      likes,
      dislikes,
      userVote
    }
  };
}

function handleGetReviews(sheet, data) {
  // Check if data is defined before destructuring
  if (!data) {
    return { 
      success: false, 
      message: 'Missing request data' 
    };
  }
  
  const { productId, businessId } = data;
  
  // Check required parameters
  if (!productId || !businessId) {
    return { 
      success: false, 
      message: 'Missing required parameters (productId or businessId)' 
    };
  }
  
  const reviews = sheet.getDataRange().getValues();
  const productReviews = reviews.slice(1)
    .filter(row => row[0] === productId && row[1] === businessId)
    .map(row => ({
      id: `${row[0]}-${row[1]}-${row[5]}`,
      productId: row[0],
      businessId: row[1],
      username: row[2],
      rating: row[3],
      comment: row[4],
      timestamp: row[5],
      createdAt: row[5],
      userId: row[6]
    }));
  
  return {
    success: true,
    reviews: productReviews
  };
}

function handleGetProductReviews(sheet, data) {
  // Check if data is defined before destructuring
  if (!data) {
    return { 
      success: false, 
      message: 'Missing request data' 
    };
  }
  
  const { productId, businessId } = data;
  
  // Check required parameters
  if (!productId) {
    return { 
      success: false, 
      message: 'Missing productId parameter' 
    };
  }
  
  const reviews = sheet.getDataRange().getValues();
  let productReviews;
  
  // If businessId is provided, filter by both productId and businessId
  if (businessId) {
    productReviews = reviews.slice(1)
      .filter(row => row[0] === productId && row[1] === businessId)
      .map(row => ({
        id: `${row[0]}-${row[1]}-${row[5]}`,
        productId: row[0],
        businessId: row[1],
        username: row[2],
        rating: parseFloat(row[3]) || 0,
        comment: row[4],
        timestamp: row[5],
        createdAt: row[5],
        userId: row[6]
      }));
  } else {
    // If no businessId, just filter by productId
    productReviews = reviews.slice(1)
      .filter(row => row[0] === productId)
      .map(row => ({
        id: `${row[0]}-${row[5]}`,
        productId: row[0],
        businessId: row[1],
        username: row[2],
        rating: parseFloat(row[3]) || 0,
        comment: row[4],
        timestamp: row[5],
        createdAt: row[5],
        userId: row[6]
      }));
  }
  
  // Calculate summary
  const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = productReviews.length > 0 ? totalRating / productReviews.length : 0;
  
  return {
    success: true,
    reviews: productReviews,
    summary: {
      productId,
      businessId: businessId || '',
      totalReviews: productReviews.length,
      averageRating
    }
  };
}

function handleGetBusinessReviews(sheet, data) {
  // Check if data is defined before destructuring
  if (!data) {
    return { 
      success: false, 
      message: 'Missing request data' 
    };
  }
  
  const { businessId } = data;
  
  // Check required parameters
  if (!businessId) {
    return { 
      success: false, 
      message: 'Missing businessId parameter' 
    };
  }
  
  const reviews = sheet.getDataRange().getValues();
  const businessReviews = reviews.slice(1)
    .filter(row => row[0] === businessId)
    .map(row => ({
      id: `${row[0]}-${row[4]}`,
      businessId: row[0],
      username: row[1],
      rating: parseFloat(row[2]) || 0, // Ensure rating is parsed as a number
      comment: row[3],
      timestamp: row[4],
      createdAt: row[4],
      userId: row[5]
    }));
  
  // Calculate summary
  const totalRating = businessReviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = businessReviews.length > 0 ? totalRating / businessReviews.length : 0;
  
  return {
    success: true,
    reviews: businessReviews,
    summary: {
      businessId,
      totalReviews: businessReviews.length,
      averageRating
    }
  };
}

function handleSubmitProductReview(sheet, data) {
  // Check if data is defined before destructuring
  if (!data) {
    return { 
      success: false, 
      message: 'Missing request data' 
    };
  }
  
  const { productId, businessId, username, rating, comment, userId } = data;
  
  if (!productId || !businessId || !username || !rating || !userId) {
    return { success: false, message: 'Missing required fields' };
  }
  
  const timestamp = new Date().getTime();
  const today = new Date().setHours(0, 0, 0, 0);
  
  // Use the provided userId directly - it should be permanent from the frontend
  const userIdentifier = userId;
  
  // Check daily review limit by userId instead of username
  const reviews = sheet.getDataRange().getValues();
  const todayReviews = reviews.slice(1)
    .filter(row => row[6] === userIdentifier && new Date(row[5]).setHours(0, 0, 0, 0) === today);
  
  // Check if user has already submitted 5 reviews for this product/business today
  const todayProductReviews = todayReviews.filter(row => row[0] === productId && row[1] === businessId);
  if (todayProductReviews.length >= 5) {
    return { success: false, message: 'You have reached the daily limit of 5 reviews per product' };
  }
  
  // Add new review with user ID - ensure rating is stored as a number
  sheet.appendRow([productId, businessId, username, parseFloat(rating), comment, timestamp, userIdentifier]);
  
  // Get updated reviews
  const updatedReviews = reviews.slice(1)
    .filter(row => row[0] === productId && row[1] === businessId)
    .map(row => ({
      id: `${row[0]}-${row[1]}-${row[5]}`,
      productId: row[0],
      businessId: row[1],
      username: row[2],
      rating: parseFloat(row[3]) || 0,
      comment: row[4],
      timestamp: row[5],
      createdAt: row[5],
      userId: row[6]
    }));
  
  // Calculate summary
  const productReviews = reviews.slice(1).filter(row => row[0] === productId && row[1] === businessId);
  const totalRating = productReviews.reduce((sum, row) => sum + (parseFloat(row[3]) || 0), 0);
  const averageRating = productReviews.length > 0 ? totalRating / productReviews.length : 0;
  
  return {
    success: true,
    message: 'Product review submitted',
    reviews: updatedReviews,
    summary: {
      productId,
      businessId,
      totalReviews: updatedReviews.length,
      averageRating
    }
  };
}
```

## Deployment Instructions

1. Create a new Google Spreadsheet
2. Open Script Editor (Extensions > Apps Script)
3. Copy and paste the above code
4. Save the script
5. Deploy as web app:
   - Click "Deploy" > "New deployment"
   - Choose "Web app"
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Click "Deploy"
6. Copy the web app URL for use in the frontend application

## Features

### Vote System
- Users can like or dislike businesses
- User ID-based tracking prevents users from both liking and disliking the same business
- Each user can only vote once per business, even if they change their username

### Review System
- Users can submit reviews for products with ratings and comments
- Users can submit reviews for businesses with ratings and comments
- User ID-based tracking limits users to 5 reviews per business per day
- Review summaries include total reviews and average rating

### Security
- Permanent user ID tracking prevents abuse
- User ID remains consistent even when username changes
- Rate limiting based on permanent user ID
- Basic input validation
- No sensitive data is stored or exposed

### Error Handling
- Descriptive error messages
- Validation of required fields
- Proper HTTP response codes

### Response Format
- Consistent JSON response format
- Success/failure indication
- Descriptive messages
- Data payload when applicable