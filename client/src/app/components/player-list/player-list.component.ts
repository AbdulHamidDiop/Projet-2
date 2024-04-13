import { Component, OnChanges, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { PlayerService } from '@app/services/player.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { BLACK, GREEN, Player, RED, YELLOW } from '@common/game';
import { IconDefinition, faComment, faCommentSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-player-list',
    templateUrl: './player-list.component.html',
    styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent implements OnInit, OnChanges {
    sortOption: Sort;

    faComment: IconDefinition = faComment;
    faCommentSlash: IconDefinition = faCommentSlash;
    protected sortedData: Player[];
    constructor(
        private socket: SocketRoomService,
        public playerService: PlayerService,
    ) {
        this.sortedData = this.playerService.playersInGame.slice();
    }

    ngOnInit(): void {
        this.sortedData = this.playerService.playersInGame.slice();
    }

    ngOnChanges(): void {
        this.sortData(this.sortOption);
    }

    excludeFromChat(player: Player) {
        this.socket.excludeFromChat(player);
    }

    includeInChat(player: Player) {
        this.socket.includeInChat(player);
    }

    colorToState(color: number | undefined) {
        switch (color) {
            case RED: {
                return 'Aucune';
            }
            case YELLOW: {
                return 'En cours';
            }
            case GREEN: {
                return 'Envoyée';
            }
            case BLACK: {
                return 'Abandon';
            }
            default: {
                return 'Erreur'; // Ne devrait jamais afficher ça, mais reste utile.
            }
        }
    }

    getStyle(player: Player) {
        switch (player.color) {
            case RED: {
                return 'red-text';
            }
            case YELLOW: {
                return 'yellow-text';
            }
            case GREEN: {
                return 'green-text';
            }
            case BLACK: {
                return 'black-text';
            }
            default: {
                return 'blue-text'; // Ne devrait jamais afficher ça, mais reste utile.
            }
        }
    }

    sortData(sort: Sort) {
        this.sortOption = sort;
        const data = this.playerService.playersInGame.slice();
        if (!sort.active || sort.direction === '') {
            this.sortedData = data;
            return;
        }

        this.playerService.playersInGame = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'name':
                    return this.compare([a.name], [b.name], isAsc);
                case 'score':
                    // Trie par nom si les scores sont égaux
                    return this.compare([a.score, a.name], [b.score, b.name], isAsc);
                case 'state':
                    return this.compare([a.score, a.name], [b.score, b.score], isAsc);
                default:
                    return 0;
            }
        });
    }

    private compare(a: (number | string)[], b: (number | string)[], isAsc: boolean) {
        // Devrait être des constantes globales.
        const SORT_DECREASE = -1;
        const SORT_INCREASE = 1;
        if (a.length === 1 && b.length === 1) {
            // Code material, peut être amélioré plus tard
            return (a[0] < b[0] ? SORT_DECREASE : SORT_INCREASE) * (isAsc ? SORT_INCREASE : SORT_DECREASE);
        } else {
            // Deux paramètres, 0 = score ou etat, 1 = name
            if (a[0] !== b[0]) {
                return (a[0] < b[0] ? SORT_DECREASE : SORT_INCREASE) * (isAsc ? SORT_INCREASE : SORT_DECREASE);
            } else {
                return (a[1] < b[1] ? SORT_DECREASE : SORT_INCREASE) * SORT_INCREASE;
            }
        }
    }
}
