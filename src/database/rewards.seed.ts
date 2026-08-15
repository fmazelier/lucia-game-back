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
      'Jour 1 : le compte à rebours commence. Chaque carte retournée nous rapproche.',
  },
  {
    type: RewardType.ANECDOTE,
    content:
      'Anecdote : raconte-moi le tout premier détail que tu as remarqué chez moi.',
  },
  {
    type: RewardType.GAGE,
    content: 'Gage : envoie un vocal en chantant le refrain de notre chanson.',
  },
  {
    type: RewardType.PHOTO,
    content: JSON.stringify({
      photoId: 1,
      caption: 'Notre photo préférée, celle qui a tout démarré.',
    }),
  },
  {
    type: RewardType.BON_MASSAGE,
    content:
      'Bon pour un massage des épaules de 15 minutes, valable dès nos retrouvailles.',
  },
  {
    type: RewardType.INDICE_MYSTERE,
    content: 'Indice 1/5 : ça se mange, et ça vient de très loin.',
  },
  {
    type: RewardType.MOT_DOUX,
    content:
      "Tu me manques, mais un peu moins qu'hier et bien plus que demain.",
  },
  {
    type: RewardType.ANECDOTE,
    content:
      "Anecdote : la fois où j'ai failli rater notre premier rendez-vous.",
  },
  {
    type: RewardType.GAGE,
    content: 'Gage : envoie un selfie avec la grimace la plus laide possible.',
  },
  {
    type: RewardType.PHOTO,
    content: JSON.stringify({
      photoId: 5,
      caption: 'Le jour où on riait pour rien.',
    }),
  },
  {
    type: RewardType.BON_MASSAGE,
    content: 'Bon pour un massage des pieds pendant un film entier.',
  },
  {
    type: RewardType.INDICE_MYSTERE,
    content: "Indice 2/5 : c'est doux, et ça tient dans une valise.",
  },
  {
    type: RewardType.MOT_DOUX,
    content:
      'Trois choses que j’aime chez toi : ton rire, ta patience, ta façon de dire mon prénom.',
  },
  {
    type: RewardType.ANECDOTE,
    content:
      "Anecdote : ce que j'ai pensé exactement la première fois que je t'ai vue.",
  },
  {
    type: RewardType.GAGE,
    content:
      'Gage : danse 30 secondes sur la première chanson qui passe et filme-toi.',
  },
  {
    type: RewardType.PHOTO,
    content: JSON.stringify({
      photoId: 9,
      caption: 'Souviens-toi de ce coucher de soleil.',
    }),
  },
  {
    type: RewardType.BON_MASSAGE,
    content: 'Bon pour un massage du dos complet, huile chaude incluse.',
  },
  {
    type: RewardType.INDICE_MYSTERE,
    content: "Indice 3/5 : la couleur, c'est celle de ta robe préférée.",
  },
  {
    type: RewardType.MOT_DOUX,
    content:
      "Plus que quelques jours. J'ai déjà préparé la playlist du trajet.",
  },
  {
    type: RewardType.ANECDOTE,
    content:
      'Anecdote : le surnom que je te donne dans ma tête et que tu ne connais pas.',
  },
  {
    type: RewardType.GAGE,
    content:
      "Gage : appelle-moi et raconte-moi ta journée en n'utilisant que des questions.",
  },
  {
    type: RewardType.PHOTO,
    content: JSON.stringify({
      photoId: 13,
      caption: 'Toi, exactement comme je pense à toi.',
    }),
  },
  {
    type: RewardType.BON_MASSAGE,
    content:
      'Bon pour un massage des mains, à utiliser quand tu veux, sans conditions.',
  },
  {
    type: RewardType.INDICE_MYSTERE,
    content: 'Indice 4/5 : tu en parles depuis des mois sans le savoir.',
  },
  {
    type: RewardType.MOT_DOUX,
    content: "Demain, c'est le dernier jour. Prépare ton plus beau sourire.",
  },
  {
    type: RewardType.INDICE_MYSTERE,
    content: 'Indice 5/5 : ouvre la porte. La surprise est arrivée.',
  },
];
