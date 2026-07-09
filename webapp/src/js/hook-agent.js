// Hook Generator Sub-Agent for Shorts/TikTok Algorithm Optimization

const HOOK_TEMPLATES = {
  challenge: [
    "Only 2% get BOTH right 🧠",
    "Can you beat 150 IQ score? 🔥",
    "Mensa level: 98% fail this 💡",
    "Prove you are a genius in 5s ⚡",
    "Most people fail Q2. Can you?"
  ],
  fomo: [
    "The hardest puzzle on the internet today",
    "Only 1 in 50 people solve this Q2",
    "This IQ test goes viral for a reason",
    "Why 95% of engineers get this wrong",
    "Don't swipe if you can't solve this"
  ],
  identity: [
    "Genius check: Are you in the top 2%? 🧠",
    "Only high IQ minds solve this under 10s",
    "Mensa members solved Q2 in 3 seconds",
    "Average score is 1/2. Can you get 2?",
    "Smart minds always get the pattern"
  ],
  urgency: [
    "3 seconds to solve Q1! Go! ⏱️",
    "Fast IQ Check: Tick Tock ⏱️",
    "Can you find the rule before the ring turns red?",
    "Speed puzzle: Only quick brains survive",
    "Hurry up! 90% run out of time on Q2"
  ],
  engagement: [
    "Drop your answer to Q2 in the comments 👇",
    "Q1 is easy, but Q2? Comment below! 👇",
    "Let's see who gets the correct logic first 👇",
    "Winner gets pinned in the comment section! 💬",
    "Agree with Q1? Solve Q2 in the comments!"
  ]
};

export class HookAgent {
  static generate(style = 'any', count = 5) {
    let pool = [];
    if (style === 'any' || !HOOK_TEMPLATES[style]) {
      // Gather all
      Object.keys(HOOK_TEMPLATES).forEach(key => {
        pool = pool.concat(HOOK_TEMPLATES[key]);
      });
    } else {
      pool = HOOK_TEMPLATES[style];
    }

    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }
}
