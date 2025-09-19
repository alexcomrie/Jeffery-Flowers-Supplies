// Simple test script to verify CORS compatibility

// Test vote service
async function testVoteService() {
  console.log('Testing Vote Service...');
  
  try {
    // Test getVotes
    const getVotesResponse = await fetch('https://script.google.com/macros/s/AKfycbw78FY_4wWiiNSj7zXVYtJPzejTFE1SX_WTdZMSxRYxHsLeC-F-A_QTWZnh91nxj5Ma/exec?action=getVotes&businessId=test-business&username=test-user');
    
    if (!getVotesResponse.ok) {
      throw new Error(`Failed to fetch votes: ${getVotesResponse.statusText}`);
    }
    
    const getVotesData = await getVotesResponse.json();
    console.log('getVotes response:', getVotesData);
    
    // Test vote
    const formData = new URLSearchParams();
    formData.append('action', 'vote');
    formData.append('businessId', 'test-business');
    formData.append('username', 'test-user');
    formData.append('voteType', 'like');
    formData.append('ipAddress', '127.0.0.1'); // Test IP
    
    const voteResponse = await fetch('https://script.google.com/macros/s/AKfycbw78FY_4wWiiNSj7zXVYtJPzejTFE1SX_WTdZMSxRYxHsLeC-F-A_QTWZnh91nxj5Ma/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });
    
    if (!voteResponse.ok) {
      throw new Error(`Failed to submit vote: ${voteResponse.statusText}`);
    }
    
    const voteData = await voteResponse.json();
    console.log('vote response:', voteData);
    
    return true;
  } catch (error) {
    console.error('Vote Service Test Error:', error);
    return false;
  }
}

// Test review service
async function testReviewService() {
  console.log('Testing Review Service...');
  
  try {
    // Test getReviews
    const getReviewsResponse = await fetch('https://script.google.com/macros/s/AKfycbw78FY_4wWiiNSj7zXVYtJPzejTFE1SX_WTdZMSxRYxHsLeC-F-A_QTWZnh91nxj5Ma/exec?action=getReviews&productId=test-product&businessId=test-business');
    
    if (!getReviewsResponse.ok) {
      throw new Error(`Failed to fetch reviews: ${getReviewsResponse.statusText}`);
    }
    
    const getReviewsData = await getReviewsResponse.json();
    console.log('getReviews response:', getReviewsData);
    
    // Test submitReview
    const formData = new URLSearchParams();
    formData.append('action', 'submitReview');
    formData.append('productId', 'test-product');
    formData.append('businessId', 'test-business');
    formData.append('username', 'test-user');
    formData.append('rating', '5');
    formData.append('comment', 'Test review');
    formData.append('timestamp', new Date().getTime().toString());
    formData.append('ipAddress', '127.0.0.1'); // Test IP
    
    const submitReviewResponse = await fetch('https://script.google.com/macros/s/AKfycbw78FY_4wWiiNSj7zXVYtJPzejTFE1SX_WTdZMSxRYxHsLeC-F-A_QTWZnh91nxj5Ma/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });
    
    if (!submitReviewResponse.ok) {
      throw new Error(`Failed to submit review: ${submitReviewResponse.statusText}`);
    }
    
    const submitReviewData = await submitReviewResponse.json();
    console.log('submitReview response:', submitReviewData);
    
    return true;
  } catch (error) {
    console.error('Review Service Test Error:', error);
    return false;
  }
}

// Run tests
async function runTests() {
  const voteServiceResult = await testVoteService();
  const reviewServiceResult = await testReviewService();
  
  console.log('\nTest Results:');
  console.log('Vote Service:', voteServiceResult ? 'PASS' : 'FAIL');
  console.log('Review Service:', reviewServiceResult ? 'PASS' : 'FAIL');
}

// Execute tests
runTests();