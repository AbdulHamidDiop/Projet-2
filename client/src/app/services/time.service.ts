import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    // TODO : Permettre plus qu'une minuterie à la fois
    private interval: number | undefined;
    private readonly tick = 1000;
    private readonly panicTick = 250; // Nouvelle vitesse pour le mode panique
    private isPanicModeActivated: boolean = false;
    private pauseFlag: boolean = false;
    timerEnded: EventEmitter<void> = new EventEmitter<void>();

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

    activatePanicMode() {
        if (this.counter >= 10 && !this.isPanicModeActivated) {
            // Vérifie si le temps restant est suffisant et si le mode panique n'est pas déjà activé
            this.isPanicModeActivated = true;
            clearInterval(this.interval);
            this.interval = window.setInterval(() => {
                if (this.counter > 0) {
                    this.counter -= 0.25; // Diminue de 0.25 chaque 250ms
                } else {
                    this.stopTimer();
                }
            }, this.panicTick);
        }
    }
}
