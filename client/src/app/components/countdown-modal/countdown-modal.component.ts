import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

const COUNT_DOWN = 3;
const COUNT_DOWN_INTERVAL = 1000;
@Component({
    selector: 'app-countdown-modal',
    templateUrl: './countdown-modal.component.html',
    styleUrls: ['./countdown-modal.component.scss'],
})
export class CountdownModalComponent implements OnChanges {
    @Input() showModal: boolean = false;
    @Output() modalClosed: EventEmitter<void> = new EventEmitter<void>();
    countdown: number = COUNT_DOWN;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.showModal && changes.showModal.currentValue) {
            this.countdown = COUNT_DOWN;
            const interval = setInterval(() => {
                this.countdown -= 1;
                if (this.countdown === 0) {
                    clearInterval(interval);
                    this.showModal = false;
                    this.modalClosed.emit();
                }
            }, COUNT_DOWN_INTERVAL);
        }
    }
}
