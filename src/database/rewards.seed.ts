import { RewardType } from '../days/entities/day.entity';

export interface RewardSeed {
  type: RewardType;
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
  // J1
  {
    type: RewardType.MOT_DOUX,
    content:
      'Jour 1. Vingt-six jours, et un endroit à deviner. Chaque carte nous rapproche.',
  },
  // J2
  {
    type: RewardType.ANECDOTE,
    content:
      'Malgré son nom, le Pont Neuf est le plus ancien pont de Paris encore en service, construit entre 1578 et 1607.',
  },
  // J3
  {
    type: RewardType.GAGE,
    content:
      'Envoie un vocal en chantant le refrain de notre chanson. Je sais que tu sais laquelle.',
  },
  // J4
  {
    type: RewardType.PHOTO,
    content: JSON.stringify({
      photoId: 3,
      caption:
        "La première photo de nous deux. On était encore loin d'imaginer tout ce qui nous attendait..",
    }),
  },
  // J5
  {
    type: RewardType.BON_MASSAGE,
    content: 'Un massage de quinze minutes.',
  },
  // J6
  {
    type: RewardType.INDICE_MYSTERE,
    content:
      'Indice 1/5 : l’endroit que j’ai choisi se trouve sur une terre où certains arbres ont vu passer plus de royaumes que la plupart des pays d’Europe.',
  },
  // J7
  {
    type: RewardType.MOT_DOUX,
    content:
      'Tu me manques, mais un peu moins qu’hier et bien plus que demain.',
  },
  // J8
  {
    type: RewardType.ANECDOTE,
    content:
      'Le parvis de Notre-Dame de Paris abrite le « point zéro » des routes de France : toutes les distances kilométriques du pays sont calculées depuis ce point précis.',
  },
  // J9
  {
    type: RewardType.GAGE,
    content: 'Envoie-moi un selfie en faisant ta plus belle grimace 👹',
  },
  // J10
  {
    type: RewardType.PHOTO,
    content: JSON.stringify({
      photoId: 19,
      caption:
        'Pendant que toi tu prenais ton pied avec un œuf rose vibrant 🤫',
    }),
  },
  // J11
  {
    type: RewardType.BON_MASSAGE,
    content:
      'Une lenteur déraisonnable, sur l’endroit de ton corps que tu choisiras.',
  },
  // J12
  {
    type: RewardType.INDICE_MYSTERE,
    content:
      'Indice 2/5 : là-bas, certaines plages doivent leur couleur à des fragments minuscules d’anciens habitants de la mer.',
  },
  // J13
  {
    type: RewardType.MOT_DOUX,
    content:
      'Trois choses que j’aime chez toi : ton rire, tes postures bien à toi, ta solarité.',
  },
  // J14
  {
    type: RewardType.ANECDOTE,
    content:
      'La place de la Concorde abrite le plus grand cadran solaire du monde, matérialisé au sol grâce à l’obélisque égyptien planté en son centre.',
  },
  // J15
  {
    type: RewardType.GAGE,
    content:
      'Envoie-moi une chanson sur laquelle tu oserais danser devant moi.',
  },
  // J16
  {
    type: RewardType.PHOTO,
    content: JSON.stringify({
      photoId: 18,
      caption: 'Ivres, essentiellement d’amour.',
    }),
  },
  // J17
  {
    type: RewardType.BON_MASSAGE,
    content:
      "Un cuni qui ne s'arrêtera pas avant que tu aies perdu le contrôle de ton corps.",
  },
  // J18
  {
    type: RewardType.INDICE_MYSTERE,
    content:
      'Indice 3/5 : on peut y partir d’un relief assez haut pour trouver de l’air frais, puis finir quelques heures plus tard au bord d’une eau beaucoup plus chaude.',
  },
  // J19
  {
    type: RewardType.MOT_DOUX,
    content:
      'Plus qu’une semaine. Je compte les heures, et je sais que c’est ridicule.',
  },
  // J20
  {
    type: RewardType.ANECDOTE,
    content:
      'En 1911, la Joconde a été volée au Louvre. Pendant deux ans, les gens ont fait la queue juste pour voir le mur vide.',
  },
  // J21
  {
    type: RewardType.GAGE,
    content: 'Appelle-moi et raconte-moi quelque chose en français.',
  },
  // J22
  {
    type: RewardType.PHOTO,
    content: JSON.stringify({
      photoId: 5,
      caption: 'Le sauna se souvient encore de nous 🫠',
    }),
  },
  // J23
  {
    type: RewardType.BON_MASSAGE,
    content: 'Un massage sur la partie du corps de ton choix.',
  },
  // J24
  {
    type: RewardType.INDICE_MYSTERE,
    content:
      'Indice 4/5 : cette terre est bien plus longue qu’elle n’est large ; à certains endroits, on peut la traverser d’un bord à l’autre en moins d’une heure de route.',
  },
  // J25
  {
    type: RewardType.MOT_DOUX,
    content:
      'Demain, c’est le grand jour ! Prépare-toi pour notre nuit de retrouvailles ♥️',
  },
  // J26
  {
    type: RewardType.INDICE_MYSTERE,
    content:
      'Indice 5/5 : non. Tu as tout ce qu’il te faut, et j’ai bien l’intention de te regarder hésiter jusqu’au dernier moment 😈',
  },
];
