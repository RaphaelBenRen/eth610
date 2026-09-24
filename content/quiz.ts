import type { Question } from "@/lib/types";

/*
 * Quiz. BROUILLON : ⚠️ chiffres À VÉRIFIER par l'équipe avant la mise en ligne
 * (tirés des sources citées ; les estimations évoluent vite).
 * Objectif : faire prendre conscience des coûts cachés de l'IA, sur 4 dimensions :
 * 🌍 environnement · 👥 social · 💰 économie · ⚖️ éthique.
 * Chaque question affiche `explanation` et `source` après la réponse.
 */
export const quiz: Question[] = [
  // 🌍 Environnement : l'échelle du problème
  {
    id: "k_dc_2030",
    type: "single",
    prompt: {
      fr: "D'ici 2030, les centres de données (tirés par l'IA) pourraient consommer autant d'électricité que…",
      en: "By 2030, data centres (driven by AI) could use as much electricity as…",
    },
    options: [
      { id: "a", emoji: "🇧🇪", label: { fr: "La Belgique", en: "Belgium" } },
      { id: "b", emoji: "🇨🇦", label: { fr: "Le Québec", en: "Quebec" } },
      { id: "c", emoji: "🇯🇵", label: { fr: "Le Japon tout entier", en: "All of Japan" } },
      { id: "d", emoji: "🏙️", label: { fr: "La ville de Montréal", en: "The city of Montreal" } },
    ],
    correct: "c",
    explanation: {
      fr: "≈ 945 TWh en 2030, soit un peu plus que tout le Japon aujourd'hui : la consommation aura plus que doublé en 6 ans, et l'IA en est le premier moteur. Une grande partie de cette électricité vient encore du gaz et du charbon.",
      en: "≈ 945 TWh in 2030, slightly more than all of Japan today: consumption will have more than doubled in 6 years, with AI as the main driver. Much of this electricity still comes from gas and coal.",
    },
    source: { label: "AIE / IEA — Energy and AI (2025)", url: "https://www.iea.org/reports/energy-and-ai/executive-summary" },
  },

  // ⚖️ Éthique : biais et discriminations
  {
    id: "k_face_bias",
    type: "gauge",
    prompt: {
      fr: "Des IA de reconnaissance faciale se trompaient dans 0,8 % des cas pour les hommes à peau claire. Et pour les femmes à peau foncée ?",
      en: "Facial-analysis AIs were wrong 0.8% of the time for lighter-skinned men. What about darker-skinned women?",
    },
    help: { fr: "Taux d'erreur, glisse le curseur", en: "Error rate, drag the slider" },
    min: 0,
    max: 100,
    unit: "%",
    correct: 34.7,
    tolerance: 25,
    explanation: {
      fr: "Jusqu'à 34,7 % d'erreurs, soit plus de 40 fois plus. Une IA apprend à partir de données qui reflètent nos inégalités : elle peut les reproduire, voire les amplifier. Aux États-Unis, des personnes noires ont déjà été arrêtées à tort à cause d'une reconnaissance faciale.",
      en: "Up to 34.7% errors, over 40 times more. AI learns from data that reflects our inequalities: it can reproduce and even amplify them. In the US, Black people have already been wrongfully arrested because of facial recognition.",
    },
    source: { label: "Buolamwini & Gebru (2018), Gender Shades — MIT", url: "https://proceedings.mlr.press/v81/buolamwini18a.html" },
  },

  // 👥 Social : le travail invisible
  {
    id: "k_click_workers",
    type: "true_false",
    prompt: {
      fr: "Pour rendre un des chatbots les plus utilisés au monde « moins toxique », des travailleurs au Kenya ont lu des descriptions de violences et d'abus pour moins de 2 $ US de l'heure.",
      en: "To make one of the world's most used chatbots “less toxic”, workers in Kenya read descriptions of violence and abuse for less than US$2 an hour.",
    },
    correct: true,
    explanation: {
      fr: "Derrière chaque IA, des milliers de personnes étiquettent et filtrent des données, souvent dans des pays du Sud, mal payées et exposées à des contenus traumatisants. Plusieurs ont témoigné de séquelles psychologiques.",
      en: "Behind every AI, thousands of people label and filter data, often in the Global South, poorly paid and exposed to traumatic content. Several have reported lasting psychological harm.",
    },
    source: { label: "TIME (janvier 2023)", url: "https://time.com/6247678/openai-chatgpt-kenya-workers/" },
  },

  // ⚖️ Éthique / 💰 économie : consentement et droits d'auteur
  {
    id: "k_scraped_images",
    type: "estimate",
    prompt: {
      fr: "Combien d'images (photos, dessins, œuvres d'artistes…) ont été récupérées sur internet, sans demander la permission, pour une seule base de données qui a servi à entraîner des IA d'images ?",
      en: "How many images (photos, drawings, artworks…) were collected from the internet, without asking permission, for a single dataset used to train image AIs?",
    },
    min: 1_000_000,
    max: 100_000_000_000,
    unit: { fr: "d'images", en: "images" },
    correct: 5_850_000_000,
    comparison: {
      fr: "≈ 5,85 milliards, presque une image par être humain sur Terre",
      en: "≈ 5.85 billion, nearly one image per human on Earth",
    },
    explanation: {
      fr: "Des œuvres d'artistes, des photos personnelles, parfois même des images médicales, sans consentement ni rémunération. Des IA peuvent ensuite imiter le style d'un artiste vivant et le concurrencer.",
      en: "Artists' works, personal photos, sometimes even medical images, without consent or payment. AIs can then imitate a living artist's style and compete with them.",
    },
    source: { label: "LAION-5B (Schuhmann et al., 2022)", url: "https://arxiv.org/abs/2210.08402" },
  },

  // 🌍 Environnement : les promesses climatiques
  {
    id: "k_bigtech_emissions",
    type: "ab",
    prompt: {
      fr: "Entre 2019 et 2023, avec l'essor de l'IA, les émissions de CO₂ de Google ont…",
      en: "Between 2019 and 2023, with the rise of AI, Google's CO₂ emissions…",
    },
    a: { id: "a", emoji: "📉", label: { fr: "Baissé de 20 %", en: "Fell by 20%" } },
    b: { id: "b", emoji: "📈", label: { fr: "Augmenté de 48 %", en: "Rose by 48%" } },
    correct: "b",
    explanation: {
      fr: "+48 % en 5 ans, alors que l'entreprise vise la neutralité carbone en 2030. Elle attribue cette hausse à la consommation de ses centres de données. Microsoft a connu une hausse similaire (≈ +30 % depuis 2020).",
      en: "+48% in 5 years, while the company aims for net zero by 2030. It attributes the rise to its data centres' energy use. Microsoft saw a similar rise (≈ +30% since 2020).",
    },
    source: { label: "Google Environmental Report 2024", url: "https://blog.google/company-news/outreach-and-initiatives/sustainability/2024-environmental-report/" },
  },

  // 🌍 Environnement : l'impact de NOS usages
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
      { id: "text", emoji: "💬", label: { fr: "Une réponse texte d'une IA", en: "One AI text answer" } },
      { id: "video", emoji: "🎬", label: { fr: "Générer une courte vidéo IA", en: "Generating a short AI video" } },
      { id: "image", emoji: "🖼️", label: { fr: "Générer une image IA", en: "Generating an AI image" } },
    ],
    correct: ["video", "image", "text", "email"],
    explanation: {
      fr: "Générer une image consomme en moyenne des dizaines de fois plus qu'une réponse texte, et une vidéo encore beaucoup plus. Les « tendances » virales (se transformer en figurine, en personnage animé…) représentent des millions de générations.",
      en: "Generating an image uses tens of times more energy than a text answer on average, and a video far more still. Viral “trends” (turning yourself into a figurine, an anime character…) add up to millions of generations.",
    },
    source: { label: "Luccioni et al. (2024), Power Hungry Processing", url: "https://arxiv.org/abs/2311.16863" },
  },

  // 🌍 Environnement : l'eau
  {
    id: "k_water",
    type: "single",
    prompt: {
      fr: "En un an, les centres de données de Google ont consommé environ 23 milliards de litres d'eau. Ça représente combien de piscines olympiques ?",
      en: "In one year, Google's data centres used about 23 billion litres of water. How many Olympic swimming pools is that?",
    },
    options: [
      { id: "a", emoji: "🏊", label: { fr: "≈ 90 piscines", en: "≈ 90 pools" } },
      { id: "b", emoji: "🏊", label: { fr: "≈ 900 piscines", en: "≈ 900 pools" } },
      { id: "c", emoji: "🏊", label: { fr: "≈ 9 000 piscines", en: "≈ 9,000 pools" } },
    ],
    correct: "c",
    explanation: {
      fr: "L'eau sert à refroidir les serveurs et s'évapore en grande partie. Des centres de données sont construits dans des régions déjà touchées par la sécheresse (Arizona, Chili, Uruguay…), en concurrence avec l'eau potable des habitants.",
      en: "Water is used to cool servers and largely evaporates. Data centres are built in regions already hit by drought (Arizona, Chile, Uruguay…), competing with residents' drinking water.",
    },
    source: { label: "Google Environmental Report 2024", url: "https://blog.google/company-news/outreach-and-initiatives/sustainability/2024-environmental-report/" },
  },

  // 👥 Social / ⚖️ éthique : les deepfakes
  {
    id: "k_deepfakes",
    type: "gauge",
    prompt: {
      fr: "Quelle part des vidéos « deepfake » en ligne sont de la pornographie créée sans le consentement des personnes représentées ?",
      en: "What share of “deepfake” videos online are pornography made without the consent of the people shown?",
    },
    help: { fr: "Glisse le curseur", en: "Drag the slider" },
    min: 0,
    max: 100,
    unit: "%",
    correct: 96,
    tolerance: 30,
    explanation: {
      fr: "≈ 96 %, visant presque uniquement des femmes. Aujourd'hui, une seule photo suffit et des élèves en sont victimes dans des écoles, y compris au Canada. Les deepfakes servent aussi à manipuler des élections et à arnaquer des proches.",
      en: "≈ 96%, targeting almost exclusively women. Today a single photo is enough, and students have been targeted in schools, including in Canada. Deepfakes are also used to manipulate elections and scam relatives.",
    },
    source: { label: "Deeptrace (2019), The State of Deepfakes", url: "https://regmedia.co.uk/2019/10/08/deepfake_report.pdf" },
  },

  // 💰 Économie : l'emploi
  {
    id: "k_jobs",
    type: "single",
    prompt: {
      fr: "Selon le FMI, quelle part des emplois est exposée à l'IA dans les économies avancées comme le Canada ?",
      en: "According to the IMF, what share of jobs is exposed to AI in advanced economies like Canada?",
    },
    options: [
      { id: "a", label: { fr: "≈ 10 %", en: "≈ 10%" } },
      { id: "b", label: { fr: "≈ 30 %", en: "≈ 30%" } },
      { id: "c", label: { fr: "≈ 60 %", en: "≈ 60%" } },
      { id: "d", label: { fr: "≈ 90 %", en: "≈ 90%" } },
    ],
    correct: "c",
    explanation: {
      fr: "≈ 60 %. Pour environ la moitié d'entre eux, l'IA pourrait réduire la demande de travail et les salaires. Le FMI prévient que l'IA risque d'aggraver les inégalités, les gains allant surtout aux entreprises qui la contrôlent.",
      en: "≈ 60%. For about half of them, AI could reduce labour demand and wages. The IMF warns that AI is likely to worsen inequality, with gains going mostly to the companies that control it.",
    },
    source: { label: "FMI / IMF (2024), Gen-AI and the Future of Work", url: "https://www.imf.org/en/Publications/Staff-Discussion-Notes/Issues/2024/01/14/Gen-AI-Artificial-Intelligence-and-the-Future-of-Work-542379" },
  },
];
