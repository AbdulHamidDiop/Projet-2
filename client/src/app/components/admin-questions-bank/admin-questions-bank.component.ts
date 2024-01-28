import { CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
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
    displayQuestions: Question[] = [];
    selectedTypes: Set<string> = new Set(['QCM', 'QRL']);

    constructor(public questionsBankService: QuestionsBankService) {
        this.questionsBankService.getQuestions().subscribe((questions) => {
            this.questions = questions;
            this.updateDisplayQuestions();
        });
    }

    updateDisplayQuestions() {
        this.questions.sort((a, b) => {
            if (!a.lastModification || !b.lastModification) {
                return 1;
            }
            return b.lastModification.getTime() - a.lastModification.getTime();
        });

        if (this.selectedTypes.size === 0 || this.selectedTypes.size === 2) {
            this.displayQuestions = [...this.questions];
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

    dropQuestion(event: CdkDragDrop<Question[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
        }
    }

    reloadQuestions(): void {
        this.questionsBankService.getQuestions().subscribe((questions) => {
            this.questions = questions;
            this.updateDisplayQuestions();
        });
    }
}
