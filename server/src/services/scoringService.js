const prisma = require('../config/prisma');
const { ExperienceLevel } = require('@prisma/client');

const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function scoreToTier(score) {
  if (score < 40) return ExperienceLevel.BEGINNER;
  if (score < 70) return ExperienceLevel.INTERMEDIATE;
  return ExperienceLevel.ADVANCED;
}

function scoreFromMcq(mcq) {
  const map = {
    rolePreference:    { frontend:10, backend:10, fullstack:10, ai:10, product:10, design:10, other:10 },
    strongestArea:     { ui:10, api:10, data:10, ml:10, devops:10, unknown:5 },
    comfortAmbiguity:  { low:4, medium:8, high:12 },
    debuggingApproach: { guess:3, logs:8, isolate:12, hypothesis:14 },
    teamworkStyle:     { follow:7, contributor:10, coordinator:10, lead:10 },
  };
  return (
    (map.rolePreference[mcq.rolePreference]       || 0) +
    (map.strongestArea[mcq.strongestArea]         || 0) +
    (map.comfortAmbiguity[mcq.comfortAmbiguity]   || 0) +
    (map.debuggingApproach[mcq.debuggingApproach] || 0) +
    (map.teamworkStyle[mcq.teamworkStyle]          || 0)
  );
}

function scoreFromCaseResponses(caseBased) {
  const mvpMap  = { build_fast_ignore_risk:4, define_scope_and_milestones:13, overengineer:6, wait_for_perfect_plan:5 };
  const inciMap = { rollback_and_triage:13, patch_without_rootcause:6, wait_for_someone_else:4, random_trial_error:5 };
  return (mvpMap[caseBased.mvpTradeoff] || 0) + (inciMap[caseBased.prodIncident] || 0);
}

// Pillar 3 — peer review score (0–100). Neutral 50 for users with no reviews.
// Recent reviews (within 6 months) are weighted 2× vs older ones.
async function computeReviewScore(userId) {
  const reviews = await prisma.review.findMany({
    where: { targetUserId: userId },
    select: { rating: true, createdAt: true },
  });
  if (!reviews.length) return 50;

  const cutoff = Date.now() - SIX_MONTHS_MS;
  let score = 50;
  for (const r of reviews) {
    const weight = new Date(r.createdAt).getTime() > cutoff ? 2 : 1;
    score += r.rating === 'POSITIVE' ? 8 * weight : -8 * weight;
  }
  return clamp(Math.round(score), 0, 100);
}

// Combined 3-pillar score (0–100).
// When githubScore is 0 (not linked), weight redistributes to self + reviews.
async function computeCombinedScore(userId, selfScore, githubScore) {
  const reviewScore = await computeReviewScore(userId);
  const combined = githubScore === 0
    ? selfScore * 0.55 + reviewScore * 0.45
    : selfScore * 0.40 + githubScore * 0.35 + reviewScore * 0.25;
  return clamp(Math.round(combined), 0, 100);
}

module.exports = {
  SIX_MONTHS_MS,
  clamp,
  scoreToTier,
  scoreFromMcq,
  scoreFromCaseResponses,
  computeReviewScore,
  computeCombinedScore,
};
