// C'est inutile d'avoir le même enum deux fois.
// Si je supprime il va juste réapparaitre par contre, donc vaut mieux laisser ça pour la fin.
export interface Player {
    name: string;
    isHost: boolean;
    id: string;
    score: number;
    bonusCount: number;
    color?: number; // La couleur d'affichage du texte. Dépends du statut de l'utilisateur
    chatEnabled?: boolean; // Active ou désactive le chat
    outOfRoom?: boolean; // Si l'utilisateur abandonne la partie
}
