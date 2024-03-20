import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    timerEnded: EventEmitter<void> = new EventEmitter<void>();
    private interval: number | undefined;
    private readonly tick = 1000;
    private pauseFlag: boolean = false;

    private counter: number;

    get time() {
        return this.counter;
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
        }, this.tick);
    }

    stopTimer() {
        clearInterval(this.interval);
        this.interval = undefined;
    }
    pauseTimer() {
        if (!this.pauseFlag) {
            this.stopTimer();
        } else {
            this.startTimer(this.counter);
        }
    }
}
