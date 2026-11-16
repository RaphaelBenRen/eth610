import type { Question } from "@/lib/types";

/*
 * Quiz, contenu final de l'équipe.
 * Chaque question correspond à une affirmation du sondage :
 *   Q1 → Environnement 1 · Q2 → Environnement 2 · Q3 → Société 1 · Q4 → Société 2 · Q5 → Économie 1 · Q6 → Économie 2.
 * `explanation` et `source` sont affichés après la réponse.
 */
export const quiz: Question[] = [
  // Q1 · 🌍 Environnement 1
  {
    id: "k_env_1_prompt_energy",
    short: { fr: "Énergie d'une requête", en: "Energy per prompt" },
    type: "estimate",
    dimension: "env",
    image: "bulb",
    prompt: {
      fr: "Quelle quantité d'énergie consomme une requête texte « médiane » de Gemini, en wattheures (Wh) ?",
      en: "How much energy does a “median” Gemini text prompt use, in watt-hours (Wh)?",
    },
    // Échelle choisie pour que la bonne réponse tombe à droite (≈ 80 % du curseur).
    min: 0.001,
    max: 1,
    unit: { fr: "Wh", en: "Wh" },
    correct: 0.24,
    comparison: {
      fr: "≈ une télévision allumée pendant moins de 9 secondes",
      en: "≈ a TV switched on for less than 9 seconds",
    },
    explanation: {
      fr: "Environ 0,24 Wh pour une requête texte médiane de Gemini, avec 0,03 gCO₂e émis et 0,26 mL d'eau consommée, soit environ cinq gouttes. Une requête consomme très peu : l'impact vient de leur nombre. Pour 2 heures par jour à raison d'une requête par minute (120 requêtes), on arrive à environ 29 Wh, soit moins de 18 minutes de télévision, et environ 31 mL d'eau, soit deux cuillères à soupe.",
      en: "About 0.24 Wh for a median Gemini text prompt, with 0.03 gCO₂e emitted and 0.26 mL of water consumed, about five drops. A single prompt uses very little: the impact comes from their number. For 2 hours a day at one prompt per minute (120 prompts), that comes to about 29 Wh, less than 18 minutes of TV, and about 31 mL of water, two tablespoons.",
    },
    source: {
      label: "Google — Measuring the environmental impact of AI inference (août 2025)",
      url: "https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference",
    },
  },

  // Q2 · 🌍 Environnement 2
  {
    id: "k_env_2_datacenter_share",
    short: { fr: "Part des centres de données", en: "Data centres' share" },
    type: "gauge",
    dimension: "env",
    image: "powerlines",
    prompt: {
      fr: "En 2024, quelle part de la consommation mondiale d'électricité représentaient les centres de données, tous usages confondus ?",
      en: "In 2024, what share of global electricity consumption did data centres account for, all uses combined?",
    },
    help: { fr: "Glisse le curseur", en: "Drag the slider" },
    // Échelle 0-2 % pour que la bonne réponse tombe à droite (75 % du curseur).
    min: 0,
    max: 2,
    step: 0.1,
    unit: "%",
    correct: 1.5,
    tolerance: 0.8,
    explanation: {
      fr: "Environ 1,5 %, soit 415 TWh. L'AIE projette environ 945 TWh en 2030, soit un peu plus que toute la consommation d'électricité actuelle du Japon. Les centres de données restent une petite part du total mondial, mais leur impact local est beaucoup plus marqué.",
      en: "About 1.5%, or 415 TWh. The IEA projects about 945 TWh by 2030, slightly more than Japan's entire current electricity consumption. Data centres remain a small share of the global total, but their local impact is much more pronounced.",
    },
    source: {
      label: "Agence internationale de l'énergie — Energy and AI (avril 2025)",
      url: "https://www.iea.org/reports/energy-and-ai",
    },
  },

  // Q3 · 👥 Société 1
  {
    id: "k_soc_1_cv_bias",
    short: { fr: "Biais du tri de CV", en: "Résumé-screening bias" },
    type: "single",
    dimension: "soc",
    image: "interview-woman",
    prompt: {
      fr: "Pourquoi un outil d'IA de tri de CV, entraîné sur dix ans de candidatures reçues par une entreprise technologique, a-t-il défavorisé les candidatures de femmes ?",
      en: "Why did an AI résumé-screening tool, trained on ten years of applications received by a tech company, penalize women's applications?",
    },
    options: [
      {
        id: "a",
        label: {
          fr: "Parce que l'algorithme calcule une réelle différence de compétence",
          en: "Because the algorithm computes a real difference in competence",
        },
      },
      {
        id: "b",
        label: {
          fr: "Parce que le modèle a été entraîné sur des données historiques reflétant la sous-représentation passée des femmes dans ce domaine",
          en: "Because the model was trained on historical data reflecting the past under-representation of women in the field",
        },
      },
      {
        id: "c",
        label: {
          fr: "Il s'agit d'un bug aléatoire sans lien avec les données",
          en: "It was a random bug unrelated to the data",
        },
      },
    ],
    correct: "b",
    explanation: {
      fr: "L'IA apprend des données passées, y compris de leurs déséquilibres. Chez Amazon, les CV d'entraînement venaient surtout d'hommes, et le système a pénalisé les CV contenant le mot « women's » ainsi que les diplômées de deux collèges de femmes. Le problème persiste : dans une étude de l'Université de Washington (2024), trois modèles de langage ont favorisé les noms associés aux personnes blanches dans 85 % des cas et les noms féminins dans seulement 11 % des cas. Amazon affirme que l'outil n'a jamais été utilisé par ses recruteurs pour évaluer des candidats, et l'étude de 2024 est une expérience en laboratoire sur des modèles open source.",
      en: "AI learns from past data, including its imbalances. At Amazon, the training résumés came mostly from men, and the system penalized résumés containing the word “women's” as well as graduates of two women's colleges. The problem persists: in a University of Washington study (2024), three language models favoured names associated with white people in 85% of cases and female names in only 11% of cases. Amazon says the tool was never used by its recruiters to evaluate candidates, and the 2024 study is a lab experiment on open-source models.",
    },
    source: [
      {
        label: "HRReporter (octobre 2018)",
        url: "https://www.hrreporter.com/focus-areas/recruitment-and-staffing/amazon-scraps-secret-ai-recruiting-tool-that-showed-bias-against-women/287026",
      },
      {
        label: "Université de Washington (octobre 2024)",
        url: "https://www.washington.edu/news/2024/10/31/ai-bias-resume-screening-race-gender/",
      },
      { label: "AI Incident Database", url: "https://incidentdatabase.ai/reports/611/" },
    ],
  },

  // Q4 · 👥 Société 2
  {
    id: "k_soc_2_privacy",
    short: { fr: "Lecture humaine des prompts", en: "Humans reading prompts" },
    type: "single",
    dimension: "soc",
    image: "cameras",
    prompt: {
      fr: "Les questions intimes ou de santé et les fichiers que vous partagez avec un assistant IA peuvent-ils être lus par des humains et servir à entraîner le modèle ?",
      en: "Can the intimate or health questions and files you share with an AI assistant be read by humans and used to train the model?",
    },
    options: [
      {
        id: "a",
        label: { fr: "Jamais, la loi interdit formellement tout accès humain", en: "Never, the law strictly forbids any human access" },
      },
      {
        id: "b",
        label: {
          fr: "Oui, des sous-traitants humains analysent régulièrement des échantillons de requêtes pour évaluer et calibrer les modèles",
          en: "Yes, human contractors regularly review samples of prompts to evaluate and calibrate the models",
        },
      },
      {
        id: "c",
        label: { fr: "Uniquement si la police dispose d'un mandat judiciaire", en: "Only if the police have a court warrant" },
      },
    ],
    correct: "b",
    explanation: {
      fr: "Oui, c'est possible, et souvent activé par défaut sur les versions grand public. Selon une analyse de Stanford, six développeurs américains majeurs semblent tous utiliser par défaut les conversations pour entraîner leurs modèles, et certains les conservent indéfiniment. Google indique aussi que des relecteurs humains lisent et annotent des conversations Gemini, après les avoir dissociées du compte. Les pratiques varient selon le fournisseur, l'offre et les réglages. Les chercheuses recommandent de désactiver l'utilisation des données pour l'entraînement quand l'option existe.",
      en: "Yes, it is possible, and often enabled by default in consumer versions. According to a Stanford analysis, six major US developers all appear to use conversations by default to train their models, and some keep them indefinitely. Google also states that human reviewers read and annotate Gemini conversations after disconnecting them from the account. Practices vary by provider, plan and settings. The researchers recommend turning off the use of your data for training when the option exists.",
    },
    source: [
      {
        label: "Stanford — User Privacy and Large Language Models (2025)",
        url: "https://cyberlaw.stanford.edu/publications/user-privacy-and-large-language-models-an-analysis-of-frontier-developers-privacy-policies/",
      },
      {
        label: "Voicebot.ai — Google Warns Gemini Users The AI Automatically Saves Conversations",
        url: "https://voicebot.ai/2024/02/12/google-warns-gemini-users-automatically-saves-conversations/",
      },
      {
        label: "Stanford — Be Careful What You Tell Your AI Chatbot",
        url: "https://cyberlaw.stanford.edu/press/be-careful-what-you-tell-your-ai-chatbot/",
      },
    ],
  },

  // Q5 · 💰 Économie 1
  {
    id: "k_eco_1_training_cost",
    short: { fr: "Coût d'entraînement de GPT-4", en: "GPT-4 training cost" },
    type: "estimate",
    dimension: "eco",
    image: "gpu",
    prompt: {
      fr: "Combien a coûté en puissance de calcul l'entraînement de GPT-4 ?",
      en: "How much did the computing power to train GPT-4 cost?",
    },
    help: { fr: "Estimation en dollars américains", en: "Estimate in US dollars" },
    min: 100_000,
    max: 10_000_000_000,
    unit: { fr: "$ US", en: "USD" },
    correct: 78_000_000,
    comparison: {
      fr: "et environ 191 millions $ US pour Gemini Ultra de Google",
      en: "and about USD 191 million for Google's Gemini Ultra",
    },
    explanation: {
      fr: "Environ 78 millions de dollars pour GPT-4, et environ 191 millions pour Gemini Ultra de Google. Le coût d'entraînement des modèles de pointe a progressé de 2 à 3 fois par an pendant huit ans. Ce sont des estimations qui ne couvrent que le calcul, sans les salaires de recherche.",
      en: "About $78 million for GPT-4, and about $191 million for Google's Gemini Ultra. The cost of training frontier models has grown 2 to 3 times per year for eight years. These estimates cover compute only, not research salaries.",
    },
    source: {
      label: "Epoch AI — How much does it cost to train frontier AI models?",
      url: "https://epoch.ai/blog/how-much-does-it-cost-to-train-frontier-ai-models",
    },
  },

  // Q6 · 💰 Économie 2
  {
    id: "k_eco_2_unemployment",
    short: { fr: "IA et chômage", en: "AI and unemployment" },
    type: "true_false",
    dimension: "eco",
    image: "robots",
    prompt: {
      fr: "L'IA va forcément créer du chômage.",
      en: "AI will inevitably create unemployment.",
    },
    correct: false,
    explanation: {
      fr: "Faux. L'IA fait clairement disparaître des tâches, mais pas nécessairement des emplois. Selon l'OIT, un emploi sur quatre dans le monde est exposé à l'IA générative, mais l'effet le plus probable est une transformation des emplois plutôt que leur disparition. Le Forum économique mondial prévoit, d'ici 2030, 170\u00a0millions d'emplois créés et 92\u00a0millions supprimés, soit un gain net de 78\u00a0millions. Du chômage structurel reste toutefois possible si la transition est mal gérée\u00a0: 63\u00a0% des employeurs citent le manque de compétences comme principal obstacle à la transformation de leurs activités, et aux États-Unis, l'emploi des 22-25\u00a0ans dans les métiers les plus exposés a reculé de 13\u00a0% par rapport aux autres depuis l'adoption de l'IA générative. Ce sont des projections et des mesures d'exposition, pas des pertes d'emplois constatées, et l'étude de Stanford montre un lien, pas une preuve de cause.",
      en: "False. AI clearly eliminates tasks, but not necessarily jobs. According to the ILO, one job in four worldwide is exposed to generative AI, but the most likely effect is that jobs are transformed rather than lost. The World Economic Forum projects, by 2030, 170 million jobs created and 92 million eliminated, a net gain of 78 million. Structural unemployment remains possible if the transition is poorly managed: 63% of employers cite skills gaps as the main barrier to transforming their business, and in the US, employment of 22-25-year-olds in the most exposed occupations has fallen 13% relative to others since generative AI was adopted. These are projections and exposure measures, not observed job losses, and the Stanford study shows a link, not proof of causation.",
    },
    source: [
      {
        label: "OIT / ILO — Generative AI and Jobs: A Refined Global Index of Occupational Exposure (mai 2025)",
        url: "https://www.ilo.org/publications/generative-ai-and-jobs-refined-global-index-occupational-exposure",
      },
      {
        label: "Forum économique mondial — Future of Jobs Report 2025 (janvier 2025)",
        url: "https://www.weforum.org/media/future-of-jobs-report-2025-78-million-new-job-opportunities-by-2030-but-urgent-upskilling-needed-to-prepare-workforces",
      },
      {
        label: "InfoDocket — One in Four Jobs at Risk of Being Transformed by GenAI (mai 2025)",
        url: "https://www.infodocket.com/2025/05/20/new-report-one-in-four-jobs-at-risk-of-being-transformed-by-genai-new-ilo-nask-global-index-shows/",
      },
    ],
  },
];
