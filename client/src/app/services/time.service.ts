import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { Type } from '@common/game';
import { Events, Namespaces } from '@common/sockets';
import { Subscription } from 'rxjs';
import { SocketRoomService } from './socket-room.service';
const PANIC_TRESHOLD = 10;
const DEFAULT_TICK = 1000;
const PANIC_TICK = 250;
const PANIC_SOUND_URL = '@app/../assets/audio/pop.mp3';
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
        if (type === Type.QCM && this.counter > PANIC_TRESHOLD) {
            this.panicMode = true;
            this.panicSound.play();
        } else if (type === Type.QRL && this.counter > PANIC_TRESHOLD * 2) {
            this.panicMode = true;
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
