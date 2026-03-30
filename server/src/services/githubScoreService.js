const axios = require('axios');
const prisma = require('../config/prisma');

const GITHUB_API = 'https://api.github.com';
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

function extractUsername(githubUrl) {
  if (!githubUrl) return null;
  // Handle full URLs like https://github.com/username or github.com/username
  const match = githubUrl.trim().match(/(?:github\.com\/)([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  // If they just typed a plain username
  if (/^[a-zA-Z0-9_-]+$/.test(githubUrl.trim())) return githubUrl.trim();
  return null;
}

function buildHeaders() {
  const token = process.env.GITHUB_API_TOKEN;
  return token && token !== 'your_github_personal_access_token'
    ? { Authorization: `token ${token}`, 'User-Agent': 'CodeCollab-App' }
    : { 'User-Agent': 'CodeCollab-App' };
}

async function fetchGithubScore(githubUrl) {
  const username = extractUsername(githubUrl);
  if (!username) return 0;

  const headers = buildHeaders();
  const cutoff = Date.now() - SIX_MONTHS_MS;

  try {
    // Fetch repos and events in parallel
    const [reposRes, eventsRes] = await Promise.all([
      axios.get(`${GITHUB_API}/users/${username}/repos?per_page=100&sort=pushed`, { headers, timeout: 8000 }),
      axios.get(`${GITHUB_API}/users/${username}/events/public?per_page=100`, { headers, timeout: 8000 })
        .catch(() => ({ data: [] })), // events endpoint failure is non-fatal
    ]);
    const repos = reposRes.data;

    // --- Commit/activity score (0–40): count push events in last 6 months ---
    let recentPushWeeks = new Set();
    let totalCommitCount = 0;
    eventsRes.data.forEach((event) => {
      if (event.type !== 'PushEvent') return;
      const ts = new Date(event.created_at).getTime();
      if (ts < cutoff) return;
      totalCommitCount += event.payload.size || 0;
      const d = new Date(event.created_at);
      recentPushWeeks.add(`${d.getFullYear()}-W${Math.ceil(d.getDate() / 7)}`);
    });
    const commitScore = Math.min((totalCommitCount / 150) * 40, 40);

    // --- Language diversity score (0–20) ---
    const languages = new Set(repos.map((r) => r.language).filter(Boolean));
    const languageScore = Math.min(languages.size * 4, 20);

    // --- Quality score (0–20): stars + forks across all repos ---
    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
    const qualityScore = Math.min((totalStars + totalForks) * 1.5, 20);

    // --- Consistency score (0–20): active weeks out of last 24 ---
    const consistencyScore = Math.min((recentPushWeeks.size / 24) * 20, 20);

    const raw = commitScore + languageScore + qualityScore + consistencyScore;
    return Math.round(Math.min(Math.max(raw, 0), 100));
  } catch (err) {
    // User not found or rate limited — return 0 (won't penalise)
    if (err.response?.status !== 404) {
      console.warn(`GitHub score fetch failed for ${username}:`, err.message);
    }
    return 0;
  }
}

/**
 * Refreshes the githubScore on a UserProfile record.
 * Safe to call fire-and-forget — errors are swallowed.
 */
async function refreshGithubScore(userId, githubUrl) {
  try {
    const score = await fetchGithubScore(githubUrl);
    await prisma.userProfile.update({
      where: { userId },
      data: { githubScore: score, githubScoreUpdatedAt: new Date() },
    });
  } catch (err) {
    console.warn(`Failed to persist githubScore for user ${userId}:`, err.message);
  }
}

module.exports = { fetchGithubScore, refreshGithubScore, extractUsername };
