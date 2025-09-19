# Review & Rating System - Google Apps Script Implementation

## Overview

This document contains the implementation of the Google Apps Script backend for TheHub's Review and Rating system. The script handles data storage and API endpoints for business votes and product reviews using a CORS-friendly approach with form-urlencoded data.

## Google Sheets Structure

The script uses the following sheets in a Google Spreadsheet:

### 1. Votes Sheet

| Column | Description |
|--------|-------------|
| BusinessID | ID of the business |
| Username | Username of the voter |
| VoteType | "like" or "dislike" |
| Timestamp | Timestamp of the vote |

### 2. Reviews Sheet

| Column | Description |
|--------|-------------|
| ProductID | ID of the product |
| Username | Username of the reviewer |
| Rating | Star rating (1-5) |
| ReviewText | Text review |
| Timestamp | Timestamp of the review |

### 3. Meta Sheet

| Column | Description |
|--------|-------------|
| Key | Configuration key |
| Value | Configuration value |

## Google Apps Script Implementation

```javascript

// Global variables
const ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1nxqiolWgMlutTYwCfdL7EI1Ejonz912v0xcmPIE0a9g/edit?gid=635390106#gid=635390106");

// Initialize sheets if they don't exist
function initializeSheets() {
  // Votes sheet
  let votesSheet = ss.getSheetByName('Votes');
  if (!votesSheet) {
    votesSheet = ss.insertSheet('Votes');
    votesSheet.getRange('A1:D1').setValues([['BusinessID', 'Username', 'VoteType', 'Timestamp']]);
  }
  
  // Reviews sheet
  let reviewsSheet = ss.getSheetByName('Reviews');
  if (!reviewsSheet) {
    reviewsSheet = ss.insertSheet('Reviews');
    reviewsSheet.getRange('A1:E1').setValues([['ProductID', 'Username', 'Rating', 'ReviewText', 'Timestamp']]);
  }
  
  // Meta sheet
  let metaSheet = ss.getSheetByName('Meta');
  if (!metaSheet) {
    metaSheet = ss.insertSheet('Meta');
    metaSheet.getRange('A1:B1').setValues([['Key', 'Value']]);
  }
}

/**
 * Handle GET requests
 */
function doGet(e) {
  initializeSheets();
  
  const action = e.parameter.action;
  const data = e.parameter;
  
  let response;
  
  switch (action) {
    case 'getVotes':
      const votesSheet = ss.getSheetByName('Votes');
      const businessId = data.businessId;
      const username = data.username || '';
      
      // Get all votes for the business
      const votes = votesSheet.getDataRange().getValues();
      const votesData = votes.slice(1).filter(row => row[0] === businessId);
      
      // Calculate likes and dislikes
      const likes = votesData.filter(row => row[2] === 'like').length;
      const dislikes = votesData.filter(row => row[2] === 'dislike').length;
      
      // Get user's vote if username provided
      const userVote = username ? 
        votesData.find(row => row[1] === username)?.[2] || null :
        null;
      
      response = {
        success: true,
        votes: {
          businessId,
          likes,
          dislikes,
          userVote
        }
      };
      break;
      
    case 'getReviews':
      const reviewsSheet = ss.getSheetByName('Reviews');
      const productId = data.productId;
      
      // Get all reviews for the product
      const reviews = reviewsSheet.getDataRange().getValues();
      const productReviews = reviews.slice(1)
        .filter(row => row[0] === productId)
        .map(row => ({
          productId: row[0],
          username: row[1],
          rating: row[2],
          comment: row[3],
          timestamp: row[4]
        }));
      
      response = {
        success: true,
        reviews: productReviews
      };
      break;
      
    default:
      response = { success: false, message: 'Invalid action' };
  }
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST requests
 */
function doPost(e) {
  initializeSheets();
  
  const data = e.parameter;
  const action = data.action;
  
  let response;
  
  switch (action) {
    case 'vote':
      const votesSheet = ss.getSheetByName('Votes');
      const businessId = data.businessId;
      const username = data.username;
      const voteType = data.voteType;
      
      // Validate required fields
      if (!businessId || !username || !voteType) {
        response = { success: false, message: 'Missing required fields' };
        break;
      }
      
      // Add new vote
      votesSheet.appendRow([
        businessId,
        username,
        voteType,
        new Date().getTime()
      ]);
      
      response = { success: true, message: 'Vote recorded' };
      break;
      
    case 'submitReview':
      const reviewsSheet = ss.getSheetByName('Reviews');
      const review = {
        productId: data.productId,
        username: data.username,
        rating: parseInt(data.rating),
        comment: data.comment
      };
      
      // Validate required fields
      if (!review.productId || !review.username || !review.rating) {
        response = { success: false, message: 'Missing required fields' };
        break;
      }
      
      // Add new review
      reviewsSheet.appendRow([
        review.productId,
        review.username,
        review.rating,
        review.comment,
        new Date().getTime()
      ]);
      
      response = { success: true, message: 'Review submitted' };
      break;
      
    default:
      response = { success: false, message: 'Invalid action' };
  }
  
  return ContentService.createTextOutput(JSON.stringify(response));
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

## Security Considerations

1. The script uses form-urlencoded data format which is more CORS-friendly
2. Basic input validation is implemented
3. No sensitive data is stored or exposed
4. Rate limiting should be implemented if needed

## Monitoring and Maintenance

1. Regular backup of the spreadsheet data
2. Monitor sheet size and implement archiving if needed
3. Check error logs in Apps Script dashboard
4. Update script when new features are needed

## Scaling Considerations

1. Google Sheets has limits on concurrent users and operations
2. Consider migrating to a database if usage grows significantly
3. Implement caching for frequently accessed data
4. Use batch operations when possible

## Testing Plan

1. Test all endpoints with valid and invalid data
2. Verify CORS functionality
3. Test concurrent operations
4. Validate data integrity
5. Test error handling