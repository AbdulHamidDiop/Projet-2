import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

const COUNT_DOWN_INTERVAL = 1000;
@Component({
    selector: 'app-countdown-modal',
    templateUrl: './countdown-modal.component.html',
    styleUrls: ['./countdown-modal.component.scss'],
})
export class CountdownModalComponent implements OnChanges {
    @Input() showModal: boolean = false;
    @Output() modalClosed: EventEmitter<void> = new EventEmitter<void>();
    @Input() countdown: number;
    @Input() message: string;
    time: number;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.showModal && changes.showModal.currentValue) {
            this.time = this.countdown;
            const interval = setInterval(() => {
                this.time -= 1;
                if (!this.time) {
                    clearInterval(interval);
                    this.showModal = false;
                    this.modalClosed.emit();
                }
            }, COUNT_DOWN_INTERVAL);
        }
    }
}
