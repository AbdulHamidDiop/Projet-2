import { Injectable } from '@angular/core';
import { Events, Namespaces } from '@common/sockets';
import { Subject, timer } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { SocketRoomService } from './socket-room.service';

const CHECK_INTERVAL = 5000;

@Injectable({
    providedIn: 'root',
})
export class QRLStatService {
    private stopTimer$ = new Subject<void>();
    private lastEditTime: number | null = null;
    private lastEditedStatusSent: boolean | null = null;
    private questionId: string | null = null;

    constructor(private socketService: SocketRoomService) {}

    startTimer(questionId: string) {
        this.questionId = questionId;
        timer(0, CHECK_INTERVAL)
            .pipe(
                takeUntil(this.stopTimer$),
                tap(() => {
                    const editedRecently = this.lastEditTime && Date.now() - this.lastEditTime < CHECK_INTERVAL;
                    if (this.lastEditedStatusSent !== editedRecently) {
                        this.socketService.sendMessage(Events.QRL_STATS, Namespaces.GAME_STATS, {
                            questionId: this.questionId,
                            edited: editedRecently,
                        });
                        this.lastEditedStatusSent = editedRecently || null;
                    }

                    if (!editedRecently) {
                        this.lastEditTime = null;
                    }
                }),
            )
            .subscribe();
    }

    stopTimer() {
        this.stopTimer$.next();
        this.questionId = null;
        this.lastEditTime = null;
        this.lastEditedStatusSent = null;
    }

    notifyEdit() {
        this.lastEditTime = Date.now();
    }
}
