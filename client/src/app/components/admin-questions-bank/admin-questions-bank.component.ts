import { CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Input, ViewChild } from '@angular/core';
import { QuestionsService } from '@app/services/questions.service';
import { Question, Type } from '@common/game';

@Component({
    selector: 'app-admin-questions-bank',
    templateUrl: './admin-questions-bank.component.html',
    styleUrls: ['./admin-questions-bank.component.scss'],
})
export class AdminQuestionsBankComponent {
    @ViewChild(CdkDropList) questionsBankList!: CdkDropList;
    @Input() questionsList!: CdkDropList;
    @Input() editable?: boolean = false;

    questions: Question[];
    displayQuestions: Question[] = [];
    selectedTypes: Set<string> = new Set([Type.QCM, Type.QRL]);
    currentType: string = Type.QCM;

    constructor(public questionsBankService: QuestionsService) {
        this.questionsBankService.getAllQuestions().then((questions) => {
            this.questions = questions;
            this.updateDisplayQuestions();
        });
    }

    updateDisplayQuestions() {
        this.questions.sort((a, b) => {
            if (!a.lastModification || !b.lastModification) {
                return 1;
            }
            const dateA = new Date(a.lastModification);
            const dateB = new Date(b.lastModification);
            return dateB.getTime() - dateA.getTime();
        });

        this.displayQuestions = this.questions.filter((question) => question.type === this.currentType);
    }

    toggleQuestionType(type: string): void {
        if (this.selectedTypes.has(type)) {
            this.currentType = type;
            this.updateDisplayQuestions();
        }
    }

    dropQuestion(event: CdkDragDrop<Question[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
        }
    }

    reloadQuestions(): void {
        this.questionsBankService.getAllQuestions().then((questions) => {
            this.questions = questions;
            this.updateDisplayQuestions();
        });
    }
}
