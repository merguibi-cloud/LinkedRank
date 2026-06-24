/**
 * Script de seed pour peupler la base de données avec 50+ posts LinkedIn
 * Run: node scripts/seed-posts.mjs
 */

import "dotenv/config";
import { createScriptClient } from "./postgres-client.mjs";

const sql = createScriptClient();

// Posts en français - Thématiques variées
const frenchPosts = [
  // RÉSILIENCE & ÉCHEC
  {
    title: "Jack Ma - 30 Rejets",
    content: `Jack Ma a été rejeté 30 fois avant de créer Alibaba.

Harvard l'a refusé 10 fois.
KFC a rejeté sa candidature.
La police ne voulait pas de lui.

Aujourd'hui, il est l'un des hommes les plus riches du monde.

La différence entre ceux qui réussissent et les autres ?

Ils ne s'arrêtent jamais.

Chaque "non" est un pas vers le "oui" qui changera tout.

Et toi, combien de "non" es-tu prêt à encaisser pour ton rêve ?

#Entrepreneuriat #Résilience #Motivation`,
    language: "FR",
    theme: "Résilience",
    category: "Motivation",
    mediaType: "video",
    videoUrl: "https://www.youtube.com/watch?v=example1",
    mediaSource: "Jack Ma Speech - YouTube"
  },
  {
    title: "L'échec n'existe pas",
    content: `L'échec n'existe pas.

Il n'y a que des leçons.

J'ai perdu de l'argent.
J'ai fait confiance aux mauvaises personnes.
J'ai pris des décisions catastrophiques.

Mais chaque erreur m'a appris quelque chose d'irremplaçable.

Aujourd'hui, je dirige plusieurs entreprises.
Pas malgré mes échecs.
GRÂCE à mes échecs.

Arrête d'avoir peur de te tromper.
Commence à avoir peur de ne rien tenter.

#Entrepreneuriat #Mindset #Échec`,
    language: "FR",
    theme: "Résilience",
    category: "Mindset"
  },
  {
    title: "Thomas Edison - 10 000 essais",
    content: `Thomas Edison a échoué 10 000 fois avant d'inventer l'ampoule.

Quand on lui a demandé comment il se sentait après tant d'échecs, il a répondu :

"Je n'ai pas échoué. J'ai trouvé 10 000 façons qui ne fonctionnent pas."

La différence entre un génie et un amateur ?

Le génie ne s'arrête pas après le premier échec.
Ni après le centième.
Ni après le millième.

Combien d'essais es-tu prêt à faire pour réaliser ton rêve ?

#Innovation #Persévérance #Succès`,
    language: "FR",
    theme: "Résilience",
    category: "Innovation"
  },

  // ACTION & EXÉCUTION
  {
    title: "Rêveurs vs Réalisateurs",
    content: `La différence entre les rêveurs et les réalisateurs ?

L'action.

Les rêveurs parlent de leurs projets.
Les réalisateurs les exécutent.

Les rêveurs attendent le moment parfait.
Les réalisateurs créent le moment parfait.

Les rêveurs cherchent des excuses.
Les réalisateurs trouvent des solutions.

Tu veux changer de vie ?

Arrête de rêver.
Commence à agir.

Maintenant.

#Action #Entrepreneuriat #Motivation`,
    language: "FR",
    theme: "Action",
    category: "Motivation"
  },
  {
    title: "1% par jour",
    content: `1% d'amélioration par jour.

Ça semble insignifiant, non ?

Pourtant, après 1 an :
→ Tu seras 37 fois meilleur qu'aujourd'hui.

Le secret des grands entrepreneurs ?

Ils ne cherchent pas la révolution.
Ils cherchent l'évolution.

Petits pas.
Chaque jour.
Sans exception.

C'est comme ça qu'on construit un empire.

Qu'est-ce que tu vas améliorer de 1% aujourd'hui ?

#Croissance #Discipline #Succès`,
    language: "FR",
    theme: "Action",
    category: "Productivité"
  },
  {
    title: "Arrête de planifier",
    content: `Tu as passé 6 mois à planifier.

Tu as créé 15 tableaux Excel.
Tu as lu 20 livres sur le sujet.
Tu as regardé 100 vidéos YouTube.

Mais tu n'as toujours pas commencé.

Voici la vérité brutale :

Le meilleur plan du monde ne vaut rien sans exécution.

Un plan médiocre exécuté bat toujours un plan parfait jamais lancé.

Ferme tes onglets.
Ouvre ton éditeur.
Et commence.

#Action #Entrepreneuriat #Productivité`,
    language: "FR",
    theme: "Action",
    category: "Productivité"
  },

  // MINDSET & MENTAL
  {
    title: "Ton mental est ton arme",
    content: `Ton mental est ton arme la plus puissante.

Pas ton diplôme.
Pas ton réseau.
Pas ton capital de départ.

Ton mental.

Celui qui te fait te lever à 5h.
Celui qui te fait continuer quand tout le monde abandonne.
Celui qui transforme les obstacles en opportunités.

Les entrepreneurs qui réussissent n'ont pas moins de problèmes.

Ils ont un mental plus fort pour les affronter.

Comment tu entraînes ton mental aujourd'hui ?

#Mindset #Entrepreneuriat #Mental`,
    language: "FR",
    theme: "Mindset",
    category: "Développement personnel"
  },
  {
    title: "La zone de confort tue",
    content: `Ta zone de confort te tue à petit feu.

Elle te donne l'illusion de la sécurité.
Pendant qu'elle assassine tes rêves.

Les plus grandes réussites de ma vie ?

Elles sont toutes venues de moments où j'ai eu peur.
Où j'ai douté.
Où j'ai failli abandonner.

Mais j'ai continué.

La magie se passe de l'autre côté de la peur.

Qu'est-ce qui te fait peur en ce moment ?

C'est probablement exactement ce que tu dois faire.

#ZoneDeConfort #Croissance #Peur`,
    language: "FR",
    theme: "Mindset",
    category: "Développement personnel"
  },

  // LEADERSHIP & ÉQUIPE
  {
    title: "Prends soin de tes équipes",
    content: `Prends soin de tes équipes.

Elles prendront soin de ton business.

Les meilleurs leaders ne sont pas ceux qui commandent.
Ce sont ceux qui servent.

Ils écoutent avant de parler.
Ils donnent avant de prendre.
Ils inspirent avant d'exiger.

Mon plus grand apprentissage en tant qu'entrepreneur ?

Une entreprise ne vaut que par les gens qui la composent.

Investis dans ton équipe.
C'est le meilleur ROI que tu feras jamais.

#Leadership #Management #Équipe`,
    language: "FR",
    theme: "Leadership",
    category: "Management"
  },
  {
    title: "Seul on va vite",
    content: `"Seul on va vite, ensemble on va loin."

Ce proverbe africain résume tout ce que j'ai appris en entrepreneuriat.

Au début, je voulais tout faire seul.
Résultat : burnout, stress, stagnation.

Puis j'ai compris :

Les plus grandes entreprises sont construites par des équipes.
Pas par des individus.

Trouve des gens meilleurs que toi.
Délègue ce que tu ne maîtrises pas.
Fais confiance.

C'est comme ça qu'on bâtit un empire.

#Équipe #Entrepreneuriat #Croissance`,
    language: "FR",
    theme: "Leadership",
    category: "Management"
  },

  // VENTE & BUSINESS
  {
    title: "La vente c'est aider",
    content: `La vente, ce n'est pas manipuler.

C'est aider.

Les meilleurs vendeurs ne vendent pas.
Ils résolvent des problèmes.

Ils écoutent.
Ils comprennent.
Ils proposent des solutions.

Si ton produit aide vraiment les gens...
Tu as le DEVOIR de le vendre.

Chaque personne que tu n'oses pas approcher...
C'est une personne que tu ne peux pas aider.

Change ta vision de la vente.
Change tes résultats.

#Vente #Business #Entrepreneuriat`,
    language: "FR",
    theme: "Vente",
    category: "Business"
  },
  {
    title: "Le prix n'est jamais le problème",
    content: `"C'est trop cher."

Cette objection cache toujours autre chose.

Le vrai problème n'est jamais le prix.
C'est la valeur perçue.

Si quelqu'un trouve ton produit trop cher :
→ Il ne comprend pas la valeur
→ Tu n'as pas bien communiqué
→ Ce n'est pas le bon client

Les gens achètent des iPhone à 1500€.
Des sacs à 3000€.
Des voitures à 100 000€.

Le prix n'est jamais le problème.
La valeur l'est toujours.

#Vente #Pricing #Business`,
    language: "FR",
    theme: "Vente",
    category: "Business"
  },

  // ÉDUCATION & APPRENTISSAGE
  {
    title: "L'école ne t'apprend pas",
    content: `L'école ne t'apprend pas à :

→ Gérer ton argent
→ Négocier un salaire
→ Créer une entreprise
→ Vendre une idée
→ Construire un réseau

Pourtant, ce sont les compétences les plus importantes pour réussir.

Je ne dis pas que l'école est inutile.
Je dis qu'elle est insuffisante.

Ta vraie éducation commence après le diplôme.

Livres. Mentors. Expériences. Échecs.

C'est ça qui forge les entrepreneurs.

#Éducation #Entrepreneuriat #Apprentissage`,
    language: "FR",
    theme: "Éducation",
    category: "Développement personnel"
  },
  {
    title: "Investis en toi",
    content: `Le meilleur investissement ?

Toi-même.

Pas la crypto.
Pas l'immobilier.
Pas la bourse.

Toi.

Chaque euro investi dans ta formation...
Te rapportera 100 fois plus que n'importe quel placement.

Les compétences que tu acquiers ne peuvent pas être volées.
Elles ne perdent pas de valeur.
Elles se multiplient avec le temps.

Combien as-tu investi dans ta formation cette année ?

#Formation #Investissement #Croissance`,
    language: "FR",
    theme: "Éducation",
    category: "Développement personnel"
  },

  // ARGENT & FINANCES
  {
    title: "L'argent n'est pas le but",
    content: `L'argent n'est pas le but.

C'est un outil.

Un outil pour :
→ Créer de l'impact
→ Aider ta famille
→ Financer tes rêves
→ Gagner ta liberté

Ceux qui courent après l'argent ne l'attrapent jamais.

Ceux qui courent après la valeur...
L'argent finit par les rattraper.

Concentre-toi sur la valeur que tu crées.
L'argent suivra.

#Argent #Entrepreneuriat #Valeur`,
    language: "FR",
    theme: "Finances",
    category: "Mindset"
  },
  {
    title: "Tes revenus = Ta valeur",
    content: `Tes revenus sont proportionnels à la valeur que tu apportes.

Pas à tes heures travaillées.
Pas à tes diplômes.
Pas à ton ancienneté.

À ta valeur.

Tu veux gagner plus ?

Apporte plus de valeur.
Résous de plus gros problèmes.
Aide plus de personnes.

C'est aussi simple que ça.
Et aussi difficile que ça.

Quelle valeur apportes-tu au monde ?

#Revenus #Valeur #Croissance`,
    language: "FR",
    theme: "Finances",
    category: "Business"
  },

  // TEMPS & PRODUCTIVITÉ
  {
    title: "Le temps est ta ressource",
    content: `Le temps est ta seule ressource non renouvelable.

L'argent perdu peut être regagné.
Les relations brisées peuvent être réparées.
La santé peut être améliorée.

Mais le temps ?

Une fois parti, il ne revient jamais.

Chaque minute que tu passes sur des choses sans importance...
C'est une minute volée à tes rêves.

Protège ton temps comme tu protèges ton argent.

Non, encore plus.

#Temps #Productivité #Priorités`,
    language: "FR",
    theme: "Productivité",
    category: "Gestion du temps"
  },
  {
    title: "Dis non plus souvent",
    content: `Le secret de la productivité ?

Dire non.

Non aux réunions inutiles.
Non aux projets sans valeur.
Non aux personnes toxiques.
Non aux distractions.

Chaque "oui" que tu donnes...
C'est un "non" à quelque chose d'autre.

Les entrepreneurs les plus productifs ne font pas plus.
Ils font moins.

Mais ils font les bonnes choses.

À quoi dois-tu dire non aujourd'hui ?

#Productivité #Focus #Priorités`,
    language: "FR",
    theme: "Productivité",
    category: "Gestion du temps"
  },

  // RÉSEAU & RELATIONS
  {
    title: "Ton réseau = Ta valeur nette",
    content: `"Ton réseau est ta valeur nette."

Cette phrase a changé ma vie.

Les opportunités ne viennent pas de nulle part.
Elles viennent des gens.

Chaque personne que tu rencontres...
Est une porte vers de nouvelles possibilités.

Mais attention :

Le networking n'est pas prendre.
C'est donner.

Aide d'abord. Sans attendre de retour.
Les opportunités viendront naturellement.

#Réseau #Networking #Relations`,
    language: "FR",
    theme: "Réseau",
    category: "Relations"
  },
  {
    title: "Tu es la moyenne",
    content: `Tu es la moyenne des 5 personnes que tu fréquentes le plus.

Regarde autour de toi.

Ces 5 personnes...
→ Gagnent-elles plus que toi ?
→ Ont-elles de plus grands rêves ?
→ Te poussent-elles vers le haut ?

Si la réponse est non...

Il est temps de changer d'entourage.

Ce n'est pas être élitiste.
C'est être stratégique.

Entoure-toi de gens qui t'inspirent.
Tu deviendras comme eux.

#Entourage #Croissance #Mindset`,
    language: "FR",
    theme: "Réseau",
    category: "Développement personnel"
  },

  // INNOVATION & TECHNOLOGIE
  {
    title: "L'IA ne te remplacera pas",
    content: `L'IA ne te remplacera pas.

Mais quelqu'un qui utilise l'IA te remplacera.

C'est la réalité de 2024.

Ceux qui refusent de s'adapter...
Seront dépassés par ceux qui embrassent le changement.

L'IA n'est pas une menace.
C'est un multiplicateur de force.

Apprends à l'utiliser.
Intègre-la dans ton travail.
Deviens irremplaçable.

Tu utilises déjà l'IA dans ton quotidien ?

#IA #Innovation #Futur`,
    language: "FR",
    theme: "Innovation",
    category: "Technologie"
  },
  {
    title: "Automatise ou meurs",
    content: `En 2024, automatise ou meurs.

Les tâches répétitives ?
Automatise-les.

Les processus manuels ?
Automatise-les.

Le temps que tu gagnes...
Investis-le dans ce qui compte vraiment.

La stratégie.
La créativité.
Les relations.

Les entrepreneurs qui gagnent ne travaillent pas plus.
Ils travaillent plus intelligemment.

Qu'est-ce que tu peux automatiser cette semaine ?

#Automatisation #Productivité #Efficacité`,
    language: "FR",
    theme: "Innovation",
    category: "Technologie"
  },

  // SANTÉ & BIEN-ÊTRE
  {
    title: "Ta santé d'abord",
    content: `J'ai failli tout perdre.

Pas mon argent.
Pas mon entreprise.

Ma santé.

À force de travailler 80h par semaine...
Mon corps a dit stop.

Burnout. Hospitalisation. Remise en question.

Aujourd'hui, je sais :

Aucun succès ne vaut ta santé.

Dors 7-8h.
Fais du sport.
Mange bien.
Prends des pauses.

Un entrepreneur en bonne santé vaut 10 entrepreneurs épuisés.

#Santé #Entrepreneuriat #Équilibre`,
    language: "FR",
    theme: "Bien-être",
    category: "Santé"
  },
  {
    title: "Le sport m'a sauvé",
    content: `Le sport a transformé mon business.

Pas directement.
Mais profondément.

Depuis que je fais du sport chaque matin :
→ Plus d'énergie
→ Plus de clarté mentale
→ Plus de discipline
→ Plus de résilience

Le corps et l'esprit sont connectés.

Un corps fort = Un esprit fort.

Les meilleurs entrepreneurs que je connais...
Prennent tous soin de leur corps.

Coïncidence ? Je ne crois pas.

#Sport #Énergie #Performance`,
    language: "FR",
    theme: "Bien-être",
    category: "Santé"
  },

  // VISION & LONG TERME
  {
    title: "Pense à 10 ans",
    content: `Pense à 10 ans.

Pas à 10 jours.
Pas à 10 semaines.
Pas à 10 mois.

10 ans.

Les décisions qui semblent difficiles aujourd'hui...
Deviennent évidentes avec une vision long terme.

Quitter un job stable pour entreprendre ?
Difficile à court terme.
Évident à long terme.

Investir dans ta formation ?
Coûteux à court terme.
Rentable à long terme.

Quelle décision prends-tu aujourd'hui pour ton toi de dans 10 ans ?

#Vision #LongTerme #Stratégie`,
    language: "FR",
    theme: "Vision",
    category: "Stratégie"
  },
  {
    title: "Construis ton empire",
    content: `Ne construis pas un business.

Construis un empire.

Un business te rend riche.
Un empire te rend libre.

Un business dépend de toi.
Un empire fonctionne sans toi.

Un business se vend.
Un empire se transmet.

Pense plus grand.
Vise plus haut.
Construis pour les générations futures.

Quel empire es-tu en train de bâtir ?

#Empire #Vision #Héritage`,
    language: "FR",
    theme: "Vision",
    category: "Stratégie"
  }
];

// Posts en anglais - Thématiques variées
const englishPosts = [
  // RESILIENCE & FAILURE
  {
    title: "Dwayne Johnson - Consistency",
    content: `Dwayne "The Rock" Johnson said:

"Success isn't always about greatness. It's about consistency."

He went from having $7 in his pocket to being one of the highest-paid actors in the world.

Not because of talent alone.
Because of relentless consistency.

Every. Single. Day.

The gym at 4am.
The work ethic.
The discipline.

Success is boring.
It's doing the same things over and over.

Are you willing to be consistent?

#Success #Consistency #Motivation`,
    language: "EN",
    theme: "Resilience",
    category: "Motivation",
    mediaType: "video",
    videoUrl: "https://www.youtube.com/watch?v=example2",
    mediaSource: "The Rock Motivation - YouTube"
  },
  {
    title: "Failure is feedback",
    content: `Failure is not the opposite of success.

It's part of success.

Every successful entrepreneur I know has failed.
Multiple times.
Spectacularly.

But they treated failure as feedback.
Not as a final verdict.

When you fail:
→ Analyze what went wrong
→ Extract the lesson
→ Apply it to the next attempt

Failure is only permanent if you stop trying.

What failure are you learning from right now?

#Failure #Success #Growth`,
    language: "EN",
    theme: "Resilience",
    category: "Mindset"
  },
  {
    title: "Steve Jobs was fired",
    content: `Steve Jobs was fired from Apple.

The company he founded.

Most people would have given up.
He came back and made Apple the most valuable company in the world.

The lesson?

Your setbacks don't define you.
Your comeback does.

Every rejection.
Every failure.
Every closed door.

They're just chapters in your story.
Not the ending.

Keep going.

#Resilience #Comeback #Success`,
    language: "EN",
    theme: "Resilience",
    category: "Motivation"
  },

  // ACTION & EXECUTION
  {
    title: "Stop planning, start doing",
    content: `Analysis paralysis is killing your dreams.

You've been "planning" for months.
You've been "researching" for years.
You've been "preparing" forever.

But you haven't started.

Here's the truth:

You'll never feel ready.
The perfect moment doesn't exist.
The only way to learn is by doing.

Close your tabs.
Open your project.
Start now.

Imperfect action beats perfect inaction.

#Action #Entrepreneurship #StartNow`,
    language: "EN",
    theme: "Action",
    category: "Productivity"
  },
  {
    title: "Done is better than perfect",
    content: `"Done is better than perfect."

This phrase changed my business.

I used to spend months perfecting products.
Now I launch in weeks and iterate.

The market doesn't reward perfection.
It rewards speed and adaptation.

Your first version will suck.
That's okay.

Ship it.
Get feedback.
Improve.
Repeat.

What are you waiting to perfect that you should just ship?

#Shipping #MVP #Entrepreneurship`,
    language: "EN",
    theme: "Action",
    category: "Productivity"
  },

  // MINDSET & MENTAL
  {
    title: "Your mindset is everything",
    content: `Your mindset determines your success.

Not your education.
Not your background.
Not your starting capital.

Your mindset.

Two people can face the same obstacle.
One sees a wall.
One sees a ladder.

The difference?
Mindset.

Train your mind like you train your body.
Read. Learn. Grow. Challenge yourself.

A strong mind builds strong businesses.

#Mindset #Success #Growth`,
    language: "EN",
    theme: "Mindset",
    category: "Personal Development"
  },
  {
    title: "Comfort zone is a death zone",
    content: `Your comfort zone is a death zone.

It feels safe.
It feels comfortable.
It feels... deadly.

Because nothing grows in comfort.

Every breakthrough in my life came from discomfort.
From fear.
From uncertainty.

The magic happens outside your comfort zone.

What's one thing you're avoiding because it scares you?

That's probably exactly what you need to do.

#ComfortZone #Growth #Fear`,
    language: "EN",
    theme: "Mindset",
    category: "Personal Development"
  },

  // LEADERSHIP & TEAM
  {
    title: "Leaders serve",
    content: `The best leaders don't command.

They serve.

They listen before speaking.
They give before taking.
They inspire before demanding.

Leadership is not about being in charge.
It's about taking care of those in your charge.

Build your team up.
Support their growth.
Celebrate their wins.

A leader's success is measured by the success of their team.

#Leadership #Team #Management`,
    language: "EN",
    theme: "Leadership",
    category: "Management"
  },
  {
    title: "Hire people smarter than you",
    content: `The smartest thing I ever did?

Hiring people smarter than me.

Ego says: "I need to be the smartest in the room."
Wisdom says: "I need the smartest room."

Your job as a founder isn't to have all the answers.
It's to find people who do.

Surround yourself with excellence.
Get out of their way.
Watch magic happen.

Who's the smartest person on your team?

#Hiring #Team #Leadership`,
    language: "EN",
    theme: "Leadership",
    category: "Management"
  },

  // SALES & BUSINESS
  {
    title: "Selling is serving",
    content: `Selling is not manipulation.

It's service.

If your product genuinely helps people...
You have a DUTY to sell it.

Every person you don't approach...
Is a person you can't help.

The best salespeople don't push.
They pull.

They listen.
They understand.
They solve problems.

Change your view of sales.
Change your results.

#Sales #Business #Service`,
    language: "EN",
    theme: "Sales",
    category: "Business"
  },
  {
    title: "Price is never the problem",
    content: `"It's too expensive."

This objection always hides something else.

The real problem is never price.
It's perceived value.

People buy $1500 iPhones.
$3000 handbags.
$100,000 cars.

If someone thinks you're too expensive:
→ They don't understand the value
→ You haven't communicated well
→ They're not your customer

Price is never the problem.
Value always is.

#Sales #Pricing #Value`,
    language: "EN",
    theme: "Sales",
    category: "Business"
  },

  // MONEY & FINANCE
  {
    title: "Money is a tool",
    content: `Money is not the goal.

It's a tool.

A tool to:
→ Create impact
→ Help your family
→ Fund your dreams
→ Buy your freedom

Those who chase money never catch it.

Those who chase value...
Money eventually catches them.

Focus on the value you create.
The money will follow.

#Money #Value #Entrepreneurship`,
    language: "EN",
    theme: "Finance",
    category: "Mindset"
  },
  {
    title: "Your income = Your value",
    content: `Your income is proportional to the value you bring.

Not your hours worked.
Not your degrees.
Not your seniority.

Your value.

Want to earn more?

Bring more value.
Solve bigger problems.
Help more people.

It's that simple.
And that hard.

What value are you bringing to the world?

#Income #Value #Growth`,
    language: "EN",
    theme: "Finance",
    category: "Business"
  },

  // TIME & PRODUCTIVITY
  {
    title: "Time is your only asset",
    content: `Time is your only non-renewable resource.

Lost money can be earned back.
Broken relationships can be repaired.
Health can be improved.

But time?

Once it's gone, it's gone forever.

Every minute spent on unimportant things...
Is a minute stolen from your dreams.

Protect your time like you protect your money.

No, even more.

#Time #Productivity #Priorities`,
    language: "EN",
    theme: "Productivity",
    category: "Time Management"
  },
  {
    title: "Say no more often",
    content: `The secret to productivity?

Saying no.

No to useless meetings.
No to worthless projects.
No to toxic people.
No to distractions.

Every "yes" you give...
Is a "no" to something else.

The most productive entrepreneurs don't do more.
They do less.

But they do the right things.

What do you need to say no to today?

#Productivity #Focus #Priorities`,
    language: "EN",
    theme: "Productivity",
    category: "Time Management"
  },

  // NETWORK & RELATIONSHIPS
  {
    title: "Your network is your net worth",
    content: `"Your network is your net worth."

This phrase changed my life.

Opportunities don't come from nowhere.
They come from people.

Every person you meet...
Is a door to new possibilities.

But remember:

Networking is not taking.
It's giving.

Help first. Without expecting return.
Opportunities will come naturally.

#Network #Relationships #Opportunities`,
    language: "EN",
    theme: "Network",
    category: "Relationships"
  },
  {
    title: "You are the average",
    content: `You are the average of the 5 people you spend the most time with.

Look around you.

Do these 5 people:
→ Earn more than you?
→ Have bigger dreams?
→ Push you to grow?

If not...

It's time to change your circle.

This isn't being elitist.
It's being strategic.

Surround yourself with people who inspire you.
You'll become like them.

#Circle #Growth #Mindset`,
    language: "EN",
    theme: "Network",
    category: "Personal Development"
  },

  // INNOVATION & TECHNOLOGY
  {
    title: "AI won't replace you",
    content: `AI won't replace you.

But someone using AI will.

That's the reality of 2024.

Those who refuse to adapt...
Will be overtaken by those who embrace change.

AI is not a threat.
It's a force multiplier.

Learn to use it.
Integrate it into your work.
Become irreplaceable.

Are you already using AI in your daily work?

#AI #Innovation #Future`,
    language: "EN",
    theme: "Innovation",
    category: "Technology"
  },
  {
    title: "Automate or die",
    content: `In 2024, automate or die.

Repetitive tasks?
Automate them.

Manual processes?
Automate them.

The time you save...
Invest it in what really matters.

Strategy.
Creativity.
Relationships.

Winning entrepreneurs don't work more.
They work smarter.

What can you automate this week?

#Automation #Productivity #Efficiency`,
    language: "EN",
    theme: "Innovation",
    category: "Technology"
  },

  // VISION & LONG TERM
  {
    title: "Think 10 years ahead",
    content: `Think 10 years ahead.

Not 10 days.
Not 10 weeks.
Not 10 months.

10 years.

Decisions that seem hard today...
Become obvious with a long-term vision.

Quitting a stable job to start a business?
Hard short-term.
Obvious long-term.

Investing in your education?
Expensive short-term.
Profitable long-term.

What decision are you making today for your future self?

#Vision #LongTerm #Strategy`,
    language: "EN",
    theme: "Vision",
    category: "Strategy"
  },
  {
    title: "Build an empire",
    content: `Don't build a business.

Build an empire.

A business makes you rich.
An empire makes you free.

A business depends on you.
An empire runs without you.

A business gets sold.
An empire gets passed down.

Think bigger.
Aim higher.
Build for generations.

What empire are you building?

#Empire #Vision #Legacy`,
    language: "EN",
    theme: "Vision",
    category: "Strategy"
  },

  // HEALTH & WELLNESS
  {
    title: "Health first",
    content: `I almost lost everything.

Not my money.
Not my business.

My health.

Working 80 hours a week...
My body said stop.

Burnout. Hospital. Wake-up call.

Now I know:

No success is worth your health.

Sleep 7-8 hours.
Exercise regularly.
Eat well.
Take breaks.

A healthy entrepreneur is worth 10 exhausted ones.

#Health #Entrepreneurship #Balance`,
    language: "EN",
    theme: "Wellness",
    category: "Health"
  },
  {
    title: "Exercise changed my business",
    content: `Exercise transformed my business.

Not directly.
But profoundly.

Since I started working out every morning:
→ More energy
→ More mental clarity
→ More discipline
→ More resilience

Body and mind are connected.

Strong body = Strong mind.

The best entrepreneurs I know...
All take care of their bodies.

Coincidence? I don't think so.

#Exercise #Energy #Performance`,
    language: "EN",
    theme: "Wellness",
    category: "Health"
  },

  // ELON MUSK INSPIRED
  {
    title: "Elon Musk Work Ethic",
    content: `Elon Musk works 80-100 hours per week.

He sleeps on factory floors.
He misses holidays.
He sacrifices comfort.

Is it healthy? Debatable.
Is it effective? Undeniable.

The point isn't to copy him exactly.

The point is:

Extraordinary results require extraordinary effort.

You can't build SpaceX working 9-5.
You can't revolutionize industries with average effort.

What are you willing to sacrifice for your dreams?

#ElonMusk #WorkEthic #Hustle`,
    language: "EN",
    theme: "Work Ethic",
    category: "Motivation",
    mediaType: "video",
    videoUrl: "https://www.youtube.com/watch?v=example3",
    mediaSource: "Elon Musk Interview - YouTube"
  },

  // WALT DISNEY INSPIRED
  {
    title: "Walt Disney - Impossible Dreams",
    content: `Walt Disney was told his ideas were "impossible."

A theme park? Crazy.
Animated movies? Childish.
A media empire? Unrealistic.

He was fired from a newspaper for "lacking imagination."

Today, Disney is worth over $200 billion.

The lesson?

"Impossible" is just an opinion.
Usually from people who never tried.

Your crazy idea might just change the world.

Don't let small minds shrink your big dreams.

#WaltDisney #Dreams #Impossible`,
    language: "EN",
    theme: "Vision",
    category: "Motivation"
  }
];

// Combiner tous les posts
const allPosts = [
  ...frenchPosts.map((post, index) => ({
    ...post,
    sortOrder: index,
    status: "draft",
    mediaType: post.mediaType || "none"
  })),
  ...englishPosts.map((post, index) => ({
    ...post,
    sortOrder: frenchPosts.length + index,
    status: "draft",
    mediaType: post.mediaType || "none"
  }))
];

console.log(`Inserting ${allPosts.length} posts into database...`);

const postColumns = [
  "title", "content", "language", "theme", "category",
  "mediaType", "videoUrl", "mediaSource", "sortOrder", "status",
];

try {
  // Insérer les posts par batch de 10
  const batchSize = 10;
  for (let i = 0; i < allPosts.length; i += batchSize) {
    const batch = allPosts.slice(i, i + batchSize).map(post => ({
      title: post.title,
      content: post.content,
      language: post.language,
      theme: post.theme,
      category: post.category || null,
      mediaType: post.mediaType,
      videoUrl: post.videoUrl || null,
      mediaSource: post.mediaSource || null,
      sortOrder: post.sortOrder,
      status: post.status,
    }));
    await sql`INSERT INTO linkedin_posts ${sql(batch, ...postColumns)}`;
    console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allPosts.length / batchSize)}`);
  }

  console.log(`✅ Successfully inserted ${allPosts.length} posts!`);
} catch (error) {
  console.error("Error inserting posts:", error);
} finally {
  await sql.end();
}
