import type { Dict } from "./fr";

export const en: Dict = {
  meta: {
    title: "AI: what we don't see | ÉTS",
    description: "A 5-minute survey and quiz on the hidden costs of artificial intelligence: environmental, social, economic and ethical.",
  },
  home: {
    kicker: "Student project · ÉTS Montréal",
    title: "AI: what we don't see",
    subtitle:
      "Energy, water, invisible human labour, discrimination, jobs: AI has costs we don't see. Test your knowledge and take stock of your own use.",
    pills: ["⏱️ 5 minutes", "🔒 100% anonymous", "📱 No sign-up"],
    steps: [
      { title: "Survey", text: "Your opinion and habits" },
      { title: "Quiz", text: "{n} questions, with the answers explained" },
      { title: "Survey", text: "Has your opinion changed?" },
    ],
    consent:
      "I understand that my answers are anonymous (no personal data, no IP address) and will be used for statistics as part of an ethics course at ÉTS.",
    start: "Start",
    resume: "Resume where I left off",
  },
  flow: {
    phases: { pre: "Survey", quiz: "Quiz", post: "Survey" },
    question: "Question",
    of: "of",
    back: "Back",
    validate: "Submit",
    next: "Next",
    finish: "See results",
    postHint: "Has your opinion changed?",
    multiHint: "Select all that apply",
    true: "True",
    false: "False",
    or: "or",
    dragHint: "Drag the items or use the arrows",
    moveUp: "Move up",
    moveDown: "Move down",
    estimateHint: "Logarithmic scale: each mark multiplies by 10",
    breaks: {
      quiz: {
        emoji: "🧠",
        title: "Quiz time!",
        text: "{n} questions about what AI really costs, to the planet and to people. After each answer, we explain.",
        cta: "Let's go",
      },
      post: {
        emoji: "🔁",
        title: "Last step",
        text: "We'll ask you a few questions from the start again. Answer based on what you think now.",
        cta: "Continue",
      },
    },
    score: "Your quiz score:",
    feedback: {
      right: "Correct!",
      close: "Close!",
      wrong: "Not quite…",
      answerIs: "Answer:",
      yourAnswer: "Your answer:",
      source: "Source:",
    },
  },
  end: {
    title: "Thanks for taking part! 🌱",
    subtitle: "A few simple ways to use AI more responsibly:",
    scoreLabel: "Your quiz score",
    share: "Share the site",
    copied: "Link copied!",
    restart: "Start over",
    footer: "Project carried out for an engineering ethics course at ÉTS (Montréal).",
  },
  common: {
    switchLang: "Français",
  },
};
