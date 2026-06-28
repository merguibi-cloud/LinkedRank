// Load test for LinkedRank — run with the k6 binary (https://k6.io), NOT node/tsx.
//
// Usage:
//   BASE_URL=https://your-staging-url.vercel.app k6 run scripts/load-test.k6.js
//
// Safety:
// - BASE_URL is required, there is no hardcoded default — this forces a conscious choice
//   of target instead of accidentally hitting production.
// - Targeting a URL containing "linkedrank.fr" requires CONFIRM_PRODUCTION=1 as well.
//   Real users + real OpenAI/Gemini/LinkedIn API costs live behind that domain — load
//   testing it directly can cost money and degrade real users' experience. Use a Vercel
//   preview/staging deployment instead whenever possible.
// - The expensive AI-generation and LinkedIn-publish endpoints are intentionally excluded
//   from the main scenarios below (see EXPENSIVE_ENDPOINTS scenario, opt-in only, low
//   iteration count) so this script can't accidentally burn through your AI provider quota
//   or hit LinkedIn's rate limits at the configured VU counts.
//
// Configurable via env vars:
//   TARGET_VUS              Peak concurrent virtual users to ramp to (default 1000)
//   RAMP_DURATION           Time to ramp up to TARGET_VUS (default "2m")
//   HOLD_DURATION           Time to hold at TARGET_VUS (default "3m")
//   TEST_SESSION_COOKIE     Optional: a valid app_session_id cookie value for a test
//                           account, to also exercise authenticated read endpoints under
//                           load (Dashboard's myPosts / auto-publish upcoming). Generate
//                           one with: npx tsx -e "import 'dotenv/config'; import { sdk }
//                           from './server/_core/sdk'; sdk.createSessionToken('openId',
//                           { name: 'Load Test', expiresInMs: 3600000 }).then(console.log)"
//                           for a throwaway test user you've inserted yourself.
//   RUN_EXPENSIVE           Set to "1" to also run the small, fixed-iteration scenario
//                           against the AI-generation endpoint (needs TEST_SESSION_COOKIE).
//                           Off by default — costs real AI provider credits.

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL;
if (!BASE_URL) {
  throw new Error(
    "BASE_URL is required, e.g. BASE_URL=https://your-preview.vercel.app k6 run scripts/load-test.k6.js"
  );
}
if (BASE_URL.includes("linkedrank.fr") && __ENV.CONFIRM_PRODUCTION !== "1") {
  throw new Error(
    "Refusing to target production (linkedrank.fr) without CONFIRM_PRODUCTION=1. " +
      "Use a Vercel preview/staging URL instead, or set CONFIRM_PRODUCTION=1 if you " +
      "really mean to load-test production (real users + real API costs are at risk)."
  );
}

const TARGET_VUS = Number(__ENV.TARGET_VUS) || 1000;
const RAMP_DURATION = __ENV.RAMP_DURATION || "2m";
const HOLD_DURATION = __ENV.HOLD_DURATION || "3m";
const TEST_SESSION_COOKIE = __ENV.TEST_SESSION_COOKIE || "";
const RUN_EXPENSIVE = __ENV.RUN_EXPENSIVE === "1";

const browsingErrors = new Rate("browsing_errors");
const browsingDuration = new Trend("browsing_duration_ms");
const authedErrors = new Rate("authed_errors");
const authedDuration = new Trend("authed_duration_ms");

export const options = {
  scenarios: {
    // The bulk of "N concurrent users" — people with the app open, browsing pages and
    // hitting cheap/public endpoints. This is the realistic interpretation of most of
    // your concurrent user count; few apps have every user actively mutating data at once.
    browsing: {
      executor: "ramping-vus",
      exec: "browsing",
      startVUs: 0,
      stages: [
        { duration: RAMP_DURATION, target: TARGET_VUS },
        { duration: HOLD_DURATION, target: TARGET_VUS },
        { duration: "30s", target: 0 },
      ],
    },
    // A much smaller, constant slice of genuinely logged-in users hitting real
    // authenticated read paths (Dashboard data) — only runs if you provide a session
    // cookie. Sized at ~5% of TARGET_VUS since "actively logged in and polling" is
    // naturally rarer than "tab open".
    ...(TEST_SESSION_COOKIE
      ? {
          authenticated: {
            executor: "constant-vus",
            exec: "authenticated",
            vus: Math.max(1, Math.round(TARGET_VUS * 0.05)),
            duration: HOLD_DURATION,
            startTime: RAMP_DURATION,
          },
        }
      : {}),
    // Opt-in only: a tiny, fixed number of real AI-generation requests, just to confirm
    // the endpoint doesn't error under *some* concurrency — NOT scaled to TARGET_VUS,
    // since that would mean spending real OpenAI/Gemini credits per virtual user.
    ...(RUN_EXPENSIVE && TEST_SESSION_COOKIE
      ? {
          expensive: {
            executor: "shared-iterations",
            exec: "expensive",
            vus: 5,
            iterations: 5,
            maxDuration: "2m",
          },
        }
      : {}),
  },
  thresholds: {
    browsing_errors: ["rate<0.05"], // fail the test if >5% of browsing requests error
    browsing_duration_ms: ["p(95)<3000"], // 95% of requests should complete under 3s
    ...(TEST_SESSION_COOKIE
      ? {
          authed_errors: ["rate<0.05"],
          authed_duration_ms: ["p(95)<4000"],
        }
      : {}),
  },
};

function recordBrowsing(res) {
  browsingDuration.add(res.timings.duration);
  const ok = check(res, { "status is 200": (r) => r.status === 200 });
  browsingErrors.add(!ok);
}

function recordAuthed(res) {
  authedDuration.add(res.timings.duration);
  const ok = check(res, { "status is 200": (r) => r.status === 200 });
  authedErrors.add(!ok);
}

// --- Scenario: passive browsing (public, cheap-to-serve pages/endpoints) ---
export function browsing() {
  const endpoints = [
    () => http.get(`${BASE_URL}/`),
    () => http.get(`${BASE_URL}/generate`),
    () => http.get(`${BASE_URL}/api/health`),
    () => http.get(`${BASE_URL}/api/trpc/generator.options`),
    () => http.get(`${BASE_URL}/api/trpc/categories.list?input=%7B%7D`),
  ];
  const pick = endpoints[Math.floor(Math.random() * endpoints.length)];
  recordBrowsing(pick());
  sleep(Math.random() * 3 + 1); // 1-4s between actions, like a real person
}

// --- Scenario: authenticated reads (Dashboard data) ---
export function authenticated() {
  const headers = { Cookie: `app_session_id=${TEST_SESSION_COOKIE}` };
  const endpoints = [
    () =>
      http.get(
        `${BASE_URL}/api/trpc/generator.myPosts?input=%7B%22json%22%3A%7B%22limit%22%3A6%2C%22offset%22%3A0%7D%7D`,
        { headers }
      ),
    () => http.get(`${BASE_URL}/api/auto-publish/upcoming?days=14`, { headers }),
  ];
  const pick = endpoints[Math.floor(Math.random() * endpoints.length)];
  recordAuthed(pick());
  sleep(Math.random() * 2 + 1);
}

// --- Scenario: expensive AI generation (opt-in, fixed tiny iteration count) ---
export function expensive() {
  const headers = {
    Cookie: `app_session_id=${TEST_SESSION_COOKIE}`,
    "Content-Type": "application/json",
  };
  const res = http.post(
    `${BASE_URL}/api/trpc/generator.generate`,
    JSON.stringify({
      json: {
        theme: "entrepreneurship",
        tone: "inspirational",
        language: "FR",
      },
    }),
    { headers, timeout: "60s" }
  );
  check(res, { "generation status is 200": (r) => r.status === 200 });
  sleep(1);
}
