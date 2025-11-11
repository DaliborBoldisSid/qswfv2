// Motivational quotes

export const MOTIVATIONAL_QUOTES = [
  "Every cigarette you don't smoke is a victory. 🏆",
  "You're stronger than your cravings. 💪",
  "Your health is worth more than any habit. ❤️",
  "Progress, not perfection. Keep going! 🌟",
  "You've come too far to give up now. 🚀",
  "Each day smoke-free is a gift to yourself. 🎁",
  "Your future self will thank you. ⭐",
  "You are in control of your choices. 🎯",
  "Breaking free, one day at a time. 🔓",
  "Your lungs are already thanking you. 🫁",
  "This craving will pass. You've got this! 💎",
  "You're not giving up smoking, you're gaining freedom. 🦅",
  "Every moment is a fresh start. 🌅",
  "You deserve to breathe easy. 🌬️",
  "Quitting is hard, but you're harder. 🔥",
  "Your determination is inspiring. Keep it up! ✨",
  "Small steps lead to big changes. 👣",
  "You're building a healthier tomorrow. 🏗️",
  "The best time to quit was yesterday. The next best time is now. ⏰",
  "You're not alone in this journey. 🤝",
  "Cravings are temporary, your health is permanent. ⚡",
  "You've survived 100% of your toughest days. 📈",
  "Be proud of every small win. 🎊",
  "Your body is healing with every passing hour. 🌱",
  "You're proving to yourself how strong you are. 💯"
]

export const getRandomQuote = () => {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
}

export const getDailyQuote = () => {
  // Use current date as seed to get same quote for the day
  const today = new Date().toDateString()
  const hash = today.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  const index = Math.abs(hash) % MOTIVATIONAL_QUOTES.length
  return MOTIVATIONAL_QUOTES[index]
}
