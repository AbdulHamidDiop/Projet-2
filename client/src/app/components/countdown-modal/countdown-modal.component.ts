import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { COUNT_DOWN_MODAL_INTERVAL } from '@common/consts';

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
            }, COUNT_DOWN_MODAL_INTERVAL);
        }
    }
}
