import { CdkDropList } from '@angular/cdk/drag-drop';
import { Component, Input, ViewChild } from '@angular/core';
import { Question } from '@app/interfaces/game-elements';
import { QuestionsBankService } from '@app/services/questions-bank.service';

@Component({
    selector: 'app-admin-questions-bank',
    templateUrl: './admin-questions-bank.component.html',
    styleUrls: ['./admin-questions-bank.component.scss'],
})
export class AdminQuestionsBankComponent {
    @ViewChild(CdkDropList) questionsBankList!: CdkDropList;
    @Input() questionsList!: CdkDropList;

    questions: Question[];
    displayQuestions: Question[];
    selectedTypes: Set<string> = new Set(['QCM', 'QRL']);

    constructor(public questionsBankService: QuestionsBankService) {
        this.questions = questionsBankService.getQuestions();
        this.updateDisplayQuestions();
    }

    updateDisplayQuestions() {
        if (this.selectedTypes.size === 0 || this.selectedTypes.size === 2) {
            this.displayQuestions = this.questions;
        } else {
            const type = Array.from(this.selectedTypes)[0];
            this.displayQuestions = this.questions.filter((question) => question.type === type);
        }
    }

    toggleQuestionType(type: string): void {
        if (this.selectedTypes.has(type)) {
            this.selectedTypes.delete(type);
        } else {
            this.selectedTypes.add(type);
        }
        this.updateDisplayQuestions();
    }
}
