export interface ProductReview {
  id: string;
  productId: string;
  businessId: string;
  username: string;
  rating: number;
  comment: string;
  timestamp: number;
  createdAt: number;
}

export interface BusinessReview {
  id: string;
  businessId: string;
  username: string;
  rating: number;
  comment: string;
  timestamp: number;
  createdAt: number;
}