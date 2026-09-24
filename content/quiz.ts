import type { Question } from "@/lib/types";

/*
 * Quiz. BROUILLON : ⚠️ tous les chiffres sont À VÉRIFIER par l'équipe avant la mise en ligne
 * (ce sont des ordres de grandeur tirés des sources citées ; les estimations évoluent vite).
 * Chaque question affiche `explanation` et `source` après la réponse.
 */
export const quiz: Question[] = [
  {
    id: "k_datacenter_share",
    type: "single",
    prompt: {
      fr: "Quelle part de l'électricité mondiale les centres de données ont-ils consommée en 2024 ?",
      en: "What share of the world's electricity did data centres use in 2024?",
    },
    options: [
      { id: "a", label: { fr: "≈ 0,1 %", en: "≈ 0.1%" } },
      { id: "b", label: { fr: "≈ 1,5 %", en: "≈ 1.5%" } },
      { id: "c", label: { fr: "≈ 8 %", en: "≈ 8%" } },
      { id: "d", label: { fr: "≈ 20 %", en: "≈ 20%" } },
    ],
    correct: "b",
    explanation: {
      fr: "Environ 415 TWh, soit plus que la consommation de la France. L'AIE prévoit que ça pourrait doubler d'ici 2030, en grande partie à cause de l'IA.",
      en: "About 415 TWh, more than France's consumption. The IEA projects it could double by 2030, largely because of AI.",
    },
    source: { label: "AIE / IEA — Energy and AI (2025)", url: "https://www.iea.org/reports/energy-and-ai" },
  },
  {
    id: "k_training_vs_inference",
    type: "ab",
    prompt: {
      fr: "Sur toute sa durée de vie, qu'est-ce qui consomme le plus d'énergie pour un modèle d'IA populaire ?",
      en: "Over its lifetime, what uses more energy for a popular AI model?",
    },
    a: { id: "a", emoji: "🏋️", label: { fr: "Son entraînement", en: "Training it" } },
    b: { id: "b", emoji: "💬", label: { fr: "Son utilisation par le public", en: "People using it" } },
    correct: "b",
    explanation: {
      fr: "L'entraînement est un gros coût ponctuel, mais les milliards de requêtes finissent par peser plus lourd : chez Google, l'utilisation représentait environ 60 % de l'énergie consacrée à l'apprentissage automatique.",
      en: "Training is a big one-off cost, but billions of queries end up weighing more: at Google, usage accounted for about 60% of machine-learning energy.",
    },
    source: {
      label: "Patterson et al. (2022), IEEE Computer",
      url: "https://arxiv.org/abs/2204.05149",
    },
  },
  {
    id: "k_water",
    type: "estimate",
    prompt: {
      fr: "Selon une étude de 2023, combien d'eau GPT-3 « boit »-il pour 10 à 50 réponses ?",
      en: "According to a 2023 study, how much water does GPT-3 “drink” for 10 to 50 answers?",
    },
    help: {
      fr: "Refroidissement des serveurs + production de l'électricité",
      en: "Server cooling + electricity generation",
    },
    min: 1,
    max: 100_000,
    unit: { fr: "mL", en: "mL" },
    correct: 500,
    comparison: { fr: "≈ une bouteille d'eau de 500 mL", en: "≈ one 500 mL water bottle" },
    explanation: {
      fr: "Les centres de données évaporent de l'eau pour refroidir les serveurs, souvent dans des régions déjà en stress hydrique.",
      en: "Data centres evaporate water to cool their servers, often in regions already under water stress.",
    },
    source: { label: "Li et al. (2023), Making AI Less “Thirsty”", url: "https://arxiv.org/abs/2304.03271" },
  },
  {
    id: "k_training_gpt3",
    type: "single",
    prompt: {
      fr: "L'entraînement de GPT-3 a consommé environ autant d'électricité que…",
      en: "Training GPT-3 used about as much electricity as…",
    },
    options: [
      { id: "a", emoji: "🏠", label: { fr: "1 maison pendant 1 an", en: "1 home for 1 year" } },
      { id: "b", emoji: "🏘️", label: { fr: "≈ 120 maisons pendant 1 an", en: "≈ 120 homes for 1 year" } },
      { id: "c", emoji: "🏙️", label: { fr: "≈ 10 000 maisons pendant 1 an", en: "≈ 10,000 homes for 1 year" } },
    ],
    correct: "b",
    explanation: {
      fr: "Environ 1 300 MWh. Les modèles récents sont bien plus gros : leur entraînement coûte probablement des dizaines de fois plus.",
      en: "About 1,300 MWh. Recent models are much bigger: training them likely costs tens of times more.",
    },
    source: { label: "Patterson et al. (2021)", url: "https://arxiv.org/abs/2104.10350" },
  },
  {
    id: "k_ranking",
    type: "ranking",
    prompt: {
      fr: "Classe ces usages du plus au moins énergivore.",
      en: "Rank these from most to least energy-hungry.",
    },
    topLabel: { fr: "Le plus énergivore", en: "Most energy" },
    bottomLabel: { fr: "Le moins énergivore", en: "Least energy" },
    items: [
      { id: "email", emoji: "📧", label: { fr: "Envoyer un courriel", en: "Sending an email" } },
      { id: "text", emoji: "💬", label: { fr: "Une réponse texte d'un chatbot", en: "One chatbot text answer" } },
      { id: "video", emoji: "🎬", label: { fr: "Générer une courte vidéo IA", en: "Generating a short AI video" } },
      { id: "image", emoji: "🖼️", label: { fr: "Générer une image IA", en: "Generating an AI image" } },
    ],
    correct: ["video", "image", "text", "email"],
    explanation: {
      fr: "Générer une image demande en moyenne beaucoup plus d'énergie que du texte, et la vidéo encore bien davantage (plusieurs images par seconde).",
      en: "Generating an image takes far more energy than text on average, and video much more still (many frames per second).",
    },
    source: { label: "Luccioni et al. (2024), Power Hungry Processing", url: "https://arxiv.org/abs/2311.16863" },
  },
  {
    id: "k_labor",
    type: "true_false",
    prompt: {
      fr: "Des travailleurs au Kenya ont été payés moins de 2 $ US de l'heure pour filtrer des contenus violents afin d'entraîner ChatGPT.",
      en: "Workers in Kenya were paid less than US$2 an hour to filter violent content used to train ChatGPT.",
    },
    correct: true,
    explanation: {
      fr: "Derrière l'IA, il y a beaucoup de travail humain peu visible (annotation, modération), souvent mal payé et éprouvant psychologiquement.",
      en: "Behind AI there is a lot of invisible human work (labelling, moderation), often poorly paid and psychologically taxing.",
    },
    source: { label: "TIME (janvier 2023)", url: "https://time.com/6247678/openai-chatgpt-kenya-workers/" },
  },
  {
    id: "k_quebec",
    type: "true_false",
    prompt: {
      fr: "Un centre de données au Québec émet autant de CO₂ qu'un centre de données alimenté au charbon.",
      en: "A data centre in Quebec emits as much CO₂ as one powered by coal.",
    },
    correct: false,
    explanation: {
      fr: "L'électricité québécoise est quasi entièrement renouvelable (hydroélectricité), donc beaucoup moins de CO₂. Mais l'eau, le territoire et la concurrence pour l'électricité restent des enjeux.",
      en: "Quebec's electricity is almost entirely renewable (hydro), so far less CO₂. But water, land use and competition for electricity remain issues.",
    },
    source: { label: "Hydro-Québec", url: "https://www.hydroquebec.com/about/our-energy/" },
  },
  {
    id: "k_ewaste",
    type: "gauge",
    prompt: {
      fr: "Quel pourcentage des déchets électroniques mondiaux est recyclé de façon documentée ?",
      en: "What percentage of the world's e-waste is formally documented as recycled?",
    },
    help: { fr: "Glisse le curseur", en: "Drag the slider" },
    min: 0,
    max: 100,
    unit: "%",
    correct: 22,
    tolerance: 30,
    explanation: {
      fr: "Seulement ≈ 22 % des 62 millions de tonnes produites en 2022. Les puces et serveurs de l'IA, renouvelés rapidement, alourdissent ce bilan.",
      en: "Only ≈ 22% of the 62 million tonnes produced in 2022. AI chips and servers, replaced quickly, add to the problem.",
    },
    source: { label: "Global E-waste Monitor (2024)", url: "https://ewastemonitor.info/" },
  },
];
