import { Component, OnDestroy } from '@angular/core';
import { SocketsService } from '@app/services/sockets.service';
import { QCMStats } from '@common/game-stats';
import { Namespaces as nsp } from '@common/sockets';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-stats-test',
    templateUrl: './stats-test.component.html',
    styleUrls: ['./stats-test.component.scss'],
})
export class StatsTestComponent implements OnDestroy {
    nbChoices: number[] = [0, 0, 0, 0];
    socketRoom: string = '0';
    private qcmStatsSubscription: Subscription;
    private qrlStatsSubscription: Subscription;

    constructor(public socketsService: SocketsService) {
        this.socketsService.joinRoom(nsp.GAME_STATS, this.socketRoom);
        this.qcmStatsSubscription = this.socketsService.listenForMessages('gameStats', 'qcmStats').subscribe((stats) => {
            const qcmStat = stats as QCMStats;
            if (qcmStat.selected) {
                this.nbChoices[qcmStat.choiceIndex]++;
            } else {
                this.nbChoices[qcmStat.choiceIndex]--;
            }
        });

        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-empty-function
        this.qrlStatsSubscription = this.socketsService.listenForMessages('gameStats', 'qrlStats').subscribe((stats) => {});
    }

    ngOnDestroy() {
        this.qcmStatsSubscription.unsubscribe();
        this.qrlStatsSubscription.unsubscribe();
    }
}
