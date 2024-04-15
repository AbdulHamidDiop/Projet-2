import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { DEFAULT_TICK, PANIC_SOUND_URL, PANIC_TICK, PANIC_TRESHOLD } from '@common/consts';
import { Type } from '@common/game';
import { Events, Namespaces } from '@common/sockets';
import { Subscription } from 'rxjs';
import { SocketRoomService } from './socket-room.service';

@Injectable({
    providedIn: 'root',
})
export class TimeService implements OnDestroy {
    timerEnded: EventEmitter<void> = new EventEmitter<void>();
    pauseFlag: boolean = false;
    counter: number;
    panicMode: boolean = false;
    panicSound = new Audio(PANIC_SOUND_URL);
    private interval: number | undefined;

    private startTimerSubscription: Subscription;
    private stopTimerSubscription: Subscription;
    private pauseTimerSubscription: Subscription;
    private panicModeSubscription: Subscription;
    private panicModeOffSubscription: Subscription;

    constructor(socketService: SocketRoomService) {
        this.panicModeSubscription = socketService.listenForMessages(Namespaces.GAME, Events.PANIC_MODE).subscribe((data: unknown) => {
            const payload = data as { type: Type; room: string };
            this.activatePanicMode(payload.type);
        });

        this.panicModeOffSubscription = socketService.listenForMessages(Namespaces.GAME, Events.PANIC_MODE_OFF).subscribe(() => {
            this.deactivatePanicMode();
        });

        this.startTimerSubscription = socketService.listenForMessages(Namespaces.GAME, Events.START_TIMER).subscribe((data: unknown) => {
            const payload = data as { time: number };
            this.startTimer(payload.time);
        });

        this.stopTimerSubscription = socketService.listenForMessages(Namespaces.GAME, Events.STOP_TIMER).subscribe(() => {
            this.stopTimer();
        });

        this.pauseTimerSubscription = socketService.listenForMessages(Namespaces.GAME, Events.PAUSE_TIMER).subscribe(() => {
            this.pauseTimer();
        });
    }

    get time() {
        return this.counter;
    }
    get isPaused() {
        return this.pauseFlag;
    }
    set time(newTime: number) {
        this.counter = newTime;
    }

    init() {
        this.stopTimer();
        this.deactivatePanicMode();
    }

    startTimer(startValue: number) {
        if (this.interval) return;
        this.time = startValue;
        this.interval = window.setInterval(() => {
            if (this.time > 0) {
                this.time--;
            } else {
                this.stopTimer();
                this.timerEnded.emit();
            }
        }, this.getCurrentTick());
    }

    stopTimer() {
        clearInterval(this.interval);
        this.interval = undefined;
    }

    pauseTimer() {
        this.pauseFlag = !this.pauseFlag;
        if (this.pauseFlag) {
            this.stopTimer();
        } else {
            this.startTimer(this.counter);
        }
    }

    activatePanicMode(type: Type) {
        this.stopTimer();

        if ((type === Type.QCM && this.counter > PANIC_TRESHOLD) || (type === Type.QRL && this.counter > PANIC_TRESHOLD * 2)) {
            const audioLength = 13;
            const speedMultiplier = 4;
            this.panicMode = true;
            const remainingTimeInSeconds = this.counter / speedMultiplier;
            const audioStartTime = Math.max(0, audioLength - remainingTimeInSeconds);

            this.panicSound.currentTime = audioStartTime;
            this.panicSound.play();
        }

        if (!this.pauseFlag) {
            this.startTimer(this.counter);
        }
    }

    deactivatePanicMode() {
        this.panicMode = false;
    }

    ngOnDestroy(): void {
        this.panicModeSubscription?.unsubscribe();
        this.panicModeOffSubscription?.unsubscribe();
        this.startTimerSubscription?.unsubscribe();
        this.stopTimerSubscription?.unsubscribe();
        this.pauseTimerSubscription?.unsubscribe();
        this.stopTimer();
        this.deactivatePanicMode();
    }

    private getCurrentTick(): number {
        return this.panicMode ? PANIC_TICK : DEFAULT_TICK;
    }
}
