/*
 * Banque de Publications LinkedIn - Youssef Koutari
 * 10 publications inspirantes (5 FR + 5 EN) basées sur des contenus viraux
 */

export interface Post {
  id: number;
  title: string;
  content: string;
  language: "FR" | "EN";
  theme: string;
  mediaType?: "video" | "image";
  mediaSource?: string;
}

export const posts: Post[] = [
  // PUBLICATIONS EN FRANÇAIS
  {
    id: 1,
    title: "Post FR #1 — Résilience (Jack Ma)",
    content: `On me demande souvent le secret de la réussite.

La vérité, c'est qu'il n'y en a pas.

Mais il y a un ingrédient que tous les grands entrepreneurs partagent : la résilience.

Jack Ma, le fondateur d'Alibaba, a été rejeté de plus de 30 jobs, y compris chez KFC. Il a postulé 10 fois à Harvard, 10 fois il a été refusé.

La plupart des gens auraient abandonné.

Lui, il a continué. Il a construit un empire de 460 milliards de dollars.

La prochaine fois que vous faites face à un échec, souvenez-vous de Jack Ma.

L'échec n'est pas la fin. C'est une étape sur le chemin.

#entrepreneuriat #résilience #motivation #mindset #succès`,
    language: "FR",
    theme: "Résilience",
    mediaType: "video",
    mediaSource: "Jack Ma - Secret to Success (9.9M vues)"
  },
  {
    id: 2,
    title: "Post FR #2 — Action",
    content: `Il y a deux types de personnes dans ce monde.

Ceux qui rêvent de réussite.

Et ceux qui se lèvent chaque matin pour la créer.

Les rêves, c'est bien. Mais sans action, ça reste des rêves.

L'ambition sans exécution, c'est une hallucination.

Arrêtez d'attendre le moment parfait. Il n'arrivera jamais.

Commencez maintenant. Avec ce que vous avez.

C'est le seul moyen de transformer vos rêves en réalité.

Quel est le premier pas que vous allez faire AUJOURD'HUI ?

#action #proactivité #entrepreneuriat #succès #motivation`,
    language: "FR",
    theme: "Action",
    mediaType: "image",
    mediaSource: "Citation Wayne Huizenga"
  },
  {
    id: 3,
    title: "Post FR #3 — Consistance",
    content: `On voit toujours le sommet de l'iceberg.

Les millions, les yachts, les gros titres.

Mais on ne voit jamais les milliers d'heures de travail dans l'ombre.

Les nuits blanches. Les sacrifices. Les doutes.

Chaque grande réussite est le résultat d'une discipline de fer et d'une consistance à toute épreuve.

C'est le travail que personne ne voit qui produit les résultats que tout le monde admire.

Ne soyez pas obsédé par le résultat final.

Soyez obsédé par le processus.

Chaque jour, une brique. Et à la fin, vous aurez construit un empire.

#discipline #consistance #workethic #entrepreneuriat #succès`,
    language: "FR",
    theme: "Consistance",
    mediaType: "image",
    mediaSource: "Citation Gandhi"
  },
  {
    id: 4,
    title: "Post FR #4 — Mindset",
    content: `Votre plus grand ennemi n'est pas la concurrence.

Ce n'est pas le marché.

Ce n'est pas le manque de financement.

Votre plus grand ennemi, c'est la petite voix dans votre tête qui vous dit que vous n'êtes pas assez bon.

Qui vous dit d'abandonner au premier obstacle.

Qui vous dit de rester dans votre zone de confort.

Le jour où vous maîtriserez votre propre esprit, vous deviendrez inarrêtable.

Entraînez votre mental comme vous entraînez votre corps.

C'est le levier le plus puissant pour atteindre vos objectifs.

#mindset #motivation #développementpersonnel #entrepreneuriat #succès`,
    language: "FR",
    theme: "Mindset",
    mediaType: "video",
    mediaSource: "Denzel Washington Motivational Speech (66M vues)"
  },
  {
    id: 5,
    title: "Post FR #5 — Leadership",
    content: `Le leadership, ce n'est pas un titre.

Ce n'est pas être le chef.

Le vrai leadership, c'est de prendre soin des gens à votre charge.

C'est de créer un environnement où les gens se sentent en sécurité, inspirés et valorisés.

Un leader ne dit pas "Allez-y". Il dit "Allons-y".

Il montre l'exemple. Il est sur le terrain. Il se bat avec ses équipes.

Si vous voulez construire une grande entreprise, ne vous concentrez pas sur les chiffres.

Concentrez-vous sur les gens. Les chiffres suivront.

#leadership #management #entrepreneuriat #culture #équipe`,
    language: "FR",
    theme: "Leadership",
    mediaType: "video",
    mediaSource: "Simon Sinek - Leadership & Passion (8.6M vues)"
  },

  // PUBLICATIONS EN ANGLAIS
  {
    id: 6,
    title: "Post EN #1 — Consistency (The Rock)",
    content: `Success isn't a lottery ticket.

It's a staircase.

You don't jump to the top.
You climb, step by step, day by day.

As Dwayne "The Rock" Johnson said, "Success isn't overnight. It's when every day you get a little better than before. It adds up."

Most people quit on the first few steps.

They don't have the patience for the climb.

But the view from the top is reserved for those who embrace the daily grind.

Stop looking for the elevator. Start climbing your staircase.

#success #consistency #motivation #mindset #entrepreneurship`,
    language: "EN",
    theme: "Consistency",
    mediaType: "image",
    mediaSource: "Quote from Dwayne Johnson"
  },
  {
    id: 7,
    title: "Post EN #2 — Taking Action",
    content: `Analysis paralysis is the #1 killer of dreams.

You have a great idea. You're excited.

Then you start overthinking.

"What if it fails?"
"I don't have enough experience."
"The market is too crowded."

Stop.

Just start.

You don't need to have all the answers. Nobody ever does.

Clarity comes from action, not from thought.

Launch the product. Make the call. Post the video.

Done is better than perfect.

What's one action you've been postponing that you can take TODAY?

#action #justdoit #entrepreneurship #startups #motivation`,
    language: "EN",
    theme: "Taking Action",
    mediaType: "image",
    mediaSource: "Quote from Alli Webb"
  },
  {
    id: 8,
    title: "Post EN #3 — Impossible Dreams (Walt Disney)",
    content: `They will call you crazy.

They will say it's impossible.

They will tell you to be realistic.

Good.

That's how you know you're on the right track.

As Walt Disney said, "It's quite fun to do the impossible."

Every major innovation, every world-changing company, started as an "impossible" idea.

If your dreams don't scare you, they are not big enough.

Embrace the crazy. Chase the impossible.

That's where the magic happens.

#innovation #vision #entrepreneurship #dreams #motivation`,
    language: "EN",
    theme: "Impossible Dreams",
    mediaType: "image",
    mediaSource: "Quote from Walt Disney"
  },
  {
    id: 9,
    title: "Post EN #4 — Work Ethic (Elon Musk)",
    content: `Everyone wants to be a beast...

Until it's time to do what real beasts do.

Elon Musk works 80-100 hours a week. He has for decades.

He didn't build Tesla and SpaceX by wishing for it.

He built them with an insane work ethic and an unbreakable will.

Talent is overrated. Passion is common.

What's rare is the discipline to show up every single day, especially on the days you don't feel like it.

Your work ethic is your biggest competitive advantage.

Outwork everyone.

#workethic #discipline #elonmusk #entrepreneurship #success`,
    language: "EN",
    theme: "Work Ethic",
    mediaType: "video",
    mediaSource: "Elon Musk Advice to Young Entrepreneurs (3.2M vues)"
  },
  {
    id: 10,
    title: "Post EN #5 — Long-Term Vision (Steve Jobs)",
    content: `Most people play checkers.

Great entrepreneurs play chess.

They're not thinking about the next move. They're thinking 10 moves ahead.

Steve Jobs wasn't just building a computer. He was building a tool to change the world.

He was obsessed with the user experience, the design, the details that nobody else cared about.

Because he had a long-term vision.

Don't get caught up in short-term gains.

Build for the long run. Create value that lasts.

Leave a legacy.

What's your long-term vision?

#vision #strategy #stevejobs #entrepreneurship #legacy`,
    language: "EN",
    theme: "Long-Term Vision",
    mediaType: "video",
    mediaSource: "Steve Jobs Motivational Speech"
  }
];
