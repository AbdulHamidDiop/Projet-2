import { Injectable, OnDestroy } from '@angular/core';
import { Events, Namespaces } from '@common/sockets';
import { Subject, Subscription, timer } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { SocketRoomService } from './socket-room.service';

const CHECK_INTERVAL = 5000;

@Injectable({
    providedIn: 'root',
})
export class QRLStatService implements OnDestroy {
    lastEditTime: number | null = null;
    lastEditedStatusSent: boolean | null = null;
    questionId: string | null = null;
    private timerSubscription: Subscription;
    private stopTimer$ = new Subject<void>();

    constructor(private socketService: SocketRoomService) {}

    startTimer(questionId: string) {
        this.questionId = questionId;
        this.timerSubscription = timer(0, CHECK_INTERVAL)
            .pipe(
                takeUntil(this.stopTimer$),
                tap(() => {
                    this.handleTap();
                }),
            )
            .subscribe();
    }

    handleTap() {
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

    ngOnDestroy() {
        this.stopTimer$.complete();
        this.timerSubscription?.unsubscribe();
    }
}
