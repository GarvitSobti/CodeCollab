import api from './api';

export async function fetchUserReviews(userId) {
  const response = await api.get(`/api/v1/reviews/user/${userId}`);
  return response.data;
}

export async function fetchReviewEligibility(userId) {
  const response = await api.get(`/api/v1/reviews/eligibility/${userId}`);
  return response.data;
}

export async function createReview(payload) {
  const response = await api.post('/api/v1/reviews', payload);
  return response.data.review;
}
