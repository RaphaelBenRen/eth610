export const fr = {
  meta: {
    title: "IA : ce qu'on ne voit pas | ÉTS",
    description: "Un sondage et un quiz de 5 minutes sur les enjeux éthiques, environnementaux et sociaux de l'intelligence artificielle.",
  },
  home: {
    kicker: "Projet étudiant · ÉTS Montréal",
    title: "L'IA, ce qu'on ne voit pas",
    subtitle:
      "Chaque requête à une IA a un coût : énergie, eau, matériel, travail humain. Teste tes connaissances et fais le point sur ton usage.",
    pills: ["⏱️ 5 minutes", "🔒 100 % anonyme", "📱 Sans inscription"],
    steps: [
      { title: "Sondage", text: "Ton avis et tes habitudes" },
      { title: "Quiz", text: "8 questions, avec les réponses expliquées" },
      { title: "Sondage", text: "Ton avis a-t-il changé ?" },
    ],
    consent:
      "Je comprends que mes réponses sont anonymes (aucune donnée personnelle, aucune adresse IP) et qu'elles serviront à des statistiques dans le cadre d'un cours d'éthique à l'ÉTS.",
    start: "Commencer",
    resume: "Reprendre où j'en étais",
  },
  flow: {
    phases: { pre: "Sondage", quiz: "Quiz", post: "Sondage" },
    question: "Question",
    of: "sur",
    back: "Retour",
    validate: "Valider",
    next: "Suivant",
    finish: "Voir les résultats",
    postHint: "Ton avis a-t-il changé ?",
    multiHint: "Plusieurs choix possibles",
    true: "Vrai",
    false: "Faux",
    or: "ou",
    dragHint: "Glisse les éléments ou utilise les flèches",
    moveUp: "Monter",
    moveDown: "Descendre",
    estimateHint: "Échelle logarithmique : chaque graduation multiplie par 10",
    breaks: {
      quiz: {
        emoji: "🧠",
        title: "Place au quiz !",
        text: "8 questions pour tester tes connaissances. Après chaque réponse, on t'explique la bonne réponse.",
        cta: "C'est parti",
      },
      post: {
        emoji: "🔁",
        title: "Dernière étape",
        text: "On te repose quelques questions du début. Réponds selon ce que tu penses maintenant.",
        cta: "Continuer",
      },
    },
    score: "Ton score au quiz :",
    feedback: {
      right: "Bonne réponse !",
      close: "Pas loin !",
      wrong: "Pas tout à fait…",
      answerIs: "Réponse :",
      yourAnswer: "Ta réponse :",
      source: "Source :",
    },
  },
  end: {
    title: "Merci pour ta participation ! 🌱",
    subtitle: "Quelques gestes simples pour utiliser l'IA de façon plus responsable :",
    scoreLabel: "Ton score au quiz",
    share: "Partager le site",
    copied: "Lien copié !",
    restart: "Recommencer",
    footer: "Projet réalisé dans le cadre d'un cours d'éthique de l'ingénieur à l'ÉTS (Montréal).",
  },
  common: {
    switchLang: "English",
  },
};

export type Dict = typeof fr;
