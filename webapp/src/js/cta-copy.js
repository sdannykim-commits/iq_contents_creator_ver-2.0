/* =========================================================================
 * IQ SPARK — Marketing CTA Copy Bank (EN)
 * Hooks engineered for the YouTube Shorts algorithm & US audience.
 *
 * [Copywriting strategy]
 *  - 1-second hook: challenge/identity trigger -> lowers scroll-away, boosts retention
 *  - Numbers & time pressure: "30 seconds", "top 2%" -> tension
 *  - FOMO & identity: "only geniuses solve this", "what's YOUR IQ?" -> comments/shares
 *  - Clear CTA: always drive to iqspark.digital at the end
 *
 * A date-based seed rotates the copy so every day is different.
 * ========================================================================= */

export const CTA_BANK = {
  /* Top hook — very top of the card. The scroll-stopper. */
  topHooks: [
    "🔥 Only the top 2% solve this in 30s",
    "🧠 Get this right = IQ 130+",
    "⚡ Geniuses spot it in 3 seconds",
    "😱 99% get this WRONG",
    "👀 Can't solve it? Totally normal.",
    "🚨 30-SECOND CHALLENGE — how fast are you?",
    "💡 Real IQ test question",
    "🏆 Even Mensa members hesitate",
    "🤯 See the answer = top 5%",
    "⏱️ Beat the clock: 30 seconds",
    "🎯 1% accuracy challenge",
    "🧩 Can you crack the pattern?",
    "🔥 STOP scrolling — IQ test time",
    "😎 For smart people only",
    "⚡ Kids solve it, adults can't?",
    "🚀 Brain at full power — 30s duel",
    "💎 Nail it = certified genius today",
    "🔍 Find the hidden rule",
    "🧠 Are you actually smart? Prove it.",
    "😤 Drop your answer in the comments!"
  ],

  /* Engagement line — bottom of the question card. Drives comments/saves. */
  engageLines: [
    "Know the answer? 👇 Comment now",
    "Saw it in 3s? Smash that like ❤️",
    "Tag a friend for an IQ battle 🥊",
    "Save this & try again later 🔖",
    "How many seconds did it take? 👇",
    "Share it in the family chat 📲",
    "Got it right? Raise your hand 🙋",
    "Solve it and flex on your friends 😎"
  ],

  /* Reveal hook — top of the answer card. */
  revealHooks: [
    "🎉 Answer revealed! Did you nail it?",
    "✅ Here's the correct answer",
    "👏 If you got it — you're elite!",
    "💥 The answer is…",
    "🔓 Drumroll… the answer is",
    "🧠 Surprised? Here's the solution"
  ],

  /* Final CTA — last card. The site-driver. */
  finalCTAs: [
    { headline: "Curious about your REAL IQ?", sub: "Take the free, precise IQ test now", button: "Start Free IQ Test" },
    { headline: "If you got these — you're above average!", sub: "See your exact IQ score right now", button: "Get My IQ Score" },
    { headline: "One a day isn't enough, right?", sub: "Challenge yourself unlimited on IQ Spark", button: "Play More Now" },
    { headline: "Are you smarter than your friends?", sub: "Compare with an official IQ report", button: "Get My IQ Report" },
    { headline: "Start your brain training today!", sub: "A scientifically designed IQ test", button: "Measure My Brain Free" },
    { headline: "What percentile are you in?", sub: "Your precise IQ result in 10 minutes", button: "Find My Ranking" },
    { headline: "Think you've got a genius brain?", sub: "Prove it with the official IQ Spark test", button: "Take the Genius Test" }
  ],

  /* Brand watermark / site URL */
  brandUrl: "iqspark.digital"
};

/**
 * Rotates copy based on date hash seed.
 * @param {string} dateStr e.g. "2026-07-07"
 */
export function getDailyCTA(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const seed = Math.abs(hash);

  return {
    topHook: CTA_BANK.topHooks[seed % CTA_BANK.topHooks.length],
    engageLine: CTA_BANK.engageLines[(seed + 1) % CTA_BANK.engageLines.length],
    revealHook: CTA_BANK.revealHooks[(seed + 2) % CTA_BANK.revealHooks.length],
    finalCTA: CTA_BANK.finalCTAs[(seed + 3) % CTA_BANK.finalCTAs.length],
    brandUrl: CTA_BANK.brandUrl
  };
}
