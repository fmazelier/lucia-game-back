import { RewardType } from '../days/entities/day.entity';

export interface RewardSeed {
  type: RewardType;
  /** Texte libre, ou JSON sérialisé pour les types structurés (ex. PHOTO). */
  content: string;
}

/**
 * Catalogue des récompenses, appliqué dans l'ordre aux jours du calendrier.
 * C'EST LE SEUL FICHIER À PERSONNALISER : édite librement les contenus.
 * Si la liste est plus courte que le nombre de jours, elle est répétée en boucle.
 * Les récompenses ne sont attribuées qu'à la création de la ligne Day
 * (le seed ne réécrit jamais un jour déjà existant en base).
 */
export const REWARDS_SEED: RewardSeed[] = [
  {
    type: RewardType.MOT_DOUX,
    content:
      'Jour 1 : le compte à rebours commence. Chaque carte retournée nous rapproche 😘',
  },
  {
    type: RewardType.ANECDOTE,
    content:
      'Malgré son nom, le Pont Neuf est le plus ancien pont de Paris encore en service, construit entre 1578 et 1607.',
  },
  {
    type: RewardType.GAGE,
    content:
      'Gage : envoie un vocal en chantant le refrain de notre chanson (je sais que tu sais exactement celle dont je parle).',
  },
  {
    type: RewardType.PHOTO,
    content: JSON.stringify({
      photoId: 3,
      caption:
        'Première photo de nous deux, on ne savait pas encore que ce serait le début d’une belle histoire.',
    }),
  },
  {
    type: RewardType.BON_MASSAGE,
    content:
      'Bon pour un massage de 15 minutes, valable dès nos retrouvailles.',
  },
  {
    type: RewardType.INDICE_MYSTERE,
    content:
      'Indice 1/5 : l’endroit que j’ai choisi se trouve sur une terre où certains arbres ont vu passer plus de royaumes que la plupart des pays d’Europe.',
  },
  {
    type: RewardType.MOT_DOUX,
    content:
      "Tu me manques, mais un peu moins qu'hier et bien plus que demain.",
  },
  {
    type: RewardType.ANECDOTE,
    content:
      'Le parvis de Notre-Dame de Paris abrite le "point zéro" des routes de France : toutes les distances kilométriques du pays sont calculées depuis ce point précis.',
  },
  {
    type: RewardType.GAGE,
    content: 'Gage : envoie un selfie en faisant ta plus belle grimace 🤡',
  },
  {
    type: RewardType.PHOTO,
    content: JSON.stringify({
      photoId: 5,
      caption: 'Le sauna se souvient encore de notre ardeur 🫠',
    }),
  },
  {
    type: RewardType.BON_MASSAGE,
    content: 'Bon pour te faire dévorer la partie de ton choix 😏',
  },
  {
    type: RewardType.INDICE_MYSTERE,
    content:
      'Indice 2/5 : là-bas, certaines plages doivent leur couleur à des fragments minuscules d’anciens habitants de la mer.',
  },
  {
    type: RewardType.MOT_DOUX,
    content:
      'Trois choses que j’aime chez toi : ton rire, tes postures bien à toi et ta gentillesse. (et je ne parle même pas de toutes les parties de ton corps.., ça ferait un peu long 😘)',
  },
  {
    type: RewardType.ANECDOTE,
    content:
      "La Place de la Concorde abrite le plus grand cadran solaire du monde, matérialisé au sol grâce à l'obélisque égyptien planté en son centre.",
  },
  {
    type: RewardType.GAGE,
    content:
      'Gage : danse 30 secondes sur la première chanson qui passe et filme-toi 👀🤩',
  },
  {
    type: RewardType.PHOTO,
    content: JSON.stringify({
      photoId: 18,
      caption: "Simplement ivres d'amour, rien de plus... 🙃",
    }),
  },
  {
    type: RewardType.BON_MASSAGE,
    content: 'Bon pour un massage, huilés et entièrement nus',
  },
  {
    type: RewardType.INDICE_MYSTERE,
    content:
      'Indice 3/5 : on peut y partir d’un relief assez haut pour trouver de l’air frais, puis finir quelques heures plus tard au bord d’une eau beaucoup plus chaude.',
  },
  {
    type: RewardType.MOT_DOUX,
    content: "Plus que quelques jours. J'ai tellement hâte de te retrouver ❤️",
  },
  {
    type: RewardType.ANECDOTE,
    content:
      "La Tour Eiffel se dilate avec la chaleur : elle peut gagner jusqu'à 15 cm de hauteur en été et penche légèrement du côté opposé au soleil.",
  },
  {
    type: RewardType.GAGE,
    content: 'Gage : appelle-moi et raconte-moi quelque chose en français 😈',
  },
  {
    type: RewardType.PHOTO,
    content: JSON.stringify({
      photoId: 13,
      caption: 'Pendant que toi tu jouais avec ton oeuf 🤫',
    }),
  },
  {
    type: RewardType.BON_MASSAGE,
    content:
      'Bon pour un massage des mains, à utiliser quand tu veux, sans conditions.',
  },
  {
    type: RewardType.INDICE_MYSTERE,
    content:
      'Indice 4/5 : cette terre est bien plus longue qu’elle n’est large ; à certains endroits, on peut la traverser d’un bord à l’autre en moins d’une heure de route.',
  },
  {
    type: RewardType.MOT_DOUX,
    content: "Demain, c'est le dernier jour. Prépare ton plus beau sourire.",
  },
  {
    type: RewardType.INDICE_MYSTERE,
    content:
      "Dernier indice : il n’y en a pas (sorry 😘). Le seul vrai mystère, c’est pourquoi tu me manques autant alors que je sais déjà que je vais te serrer dans mes bras aujourd'hui",
  },
];
