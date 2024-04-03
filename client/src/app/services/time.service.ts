import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    // Limite de 1 timer, pour avoir + de 1 timer faut déclarer les éléments comme des tableaux.
    timerEnded: EventEmitter<void> = new EventEmitter<void>();
    private interval: number | undefined;
    private readonly defaultTick = 1000;
    private readonly panicTick = 250;
    private pauseFlag: boolean = false;
    private readonly panicThresholdQCM = 10;
    // private readonly panicThresholdQRL = 20;
    private panicMode: boolean = false;

    private counter: number;

    get time() {
        return this.counter;
    }
    get isPaused() {
        return this.pauseFlag;
    }
    set time(newTime: number) {
        this.counter = newTime;
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
        this.panicMode = false;
    }

    pauseTimer() {
        this.pauseFlag = !this.pauseFlag;
        if (this.pauseFlag) {
            this.stopTimer();
        } else {
            this.startTimer(this.counter);
        }
    }

    activatePanicMode() {
        if (this.time > this.panicThresholdQCM && !this.panicMode) {
            this.panicMode = true;
            this.interval = undefined;
            this.startTimer(this.counter);
        }
    }

    private getCurrentTick(): number {
        return this.panicMode ? this.panicTick : this.defaultTick;
    }
}
