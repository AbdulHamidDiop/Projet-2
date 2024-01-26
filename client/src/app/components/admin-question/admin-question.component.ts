import { Component, Input } from '@angular/core';
import { Question } from './../../interfaces/game-elements';

@Component({
    selector: 'app-admin-question',
    templateUrl: './admin-question.component.html',
    styleUrls: ['./admin-question.component.scss'],
})
export class AdminQuestionComponent {
    @Input() question: Question;
    @Input() index?: number;
}
