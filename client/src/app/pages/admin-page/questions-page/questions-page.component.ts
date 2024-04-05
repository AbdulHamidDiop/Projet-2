import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CreateQuestionDialogComponent } from '@app/components/create-question-dialog/create-question-dialog.component';
import { CommunicationService } from '@app/services/communication.service';
import { QuestionsService } from '@app/services/questions.service';
import { Question, Type } from '@common/game';

@Component({
    selector: 'app-questions-page',
    templateUrl: './questions-page.component.html',
    styleUrls: ['./questions-page.component.scss'],
})
export class QuestionsPageComponent implements OnInit {
    questions: Question[];
    displayQuestions: Question[];
    isAuthentificated: boolean;
    selectedTypes: Set<string> = new Set([Type.QCM, Type.QRL]);
    currentType: string = Type.QCM;

    // Les services ont tous des fonctionnalités différentes, ce n'est pas possible
    // de réduire le nombre de dépendances sans perdre en fonctionnalités,
    // et la classe a déja très peu de code.
    // eslint-disable-next-line max-params
    constructor(
        public dialog: MatDialog,
        readonly communicationService: CommunicationService,
        readonly router: Router,
        readonly questionsService: QuestionsService,
    ) {
        
    }

    async getQuestions() {
        this.questions = await this.questionsService.getAllQuestions();
        this.displayQuestions = this.questions;
    }

    async ngOnInit() {
        this.communicationService.sharedVariable$.subscribe((data) => {
            this.isAuthentificated = data;
        });
        if (!this.isAuthentificated) {
            this.router.navigate(['/home']);
        }
        await this.getQuestions();
        this.questionsService.deleteRequest.subscribe(async () => {
            await this.getQuestions();
        });
        this.updateDisplayQuestions();
    }
    openDialog(): void {
        const dialogRef = this.dialog.open(CreateQuestionDialogComponent, {});

        dialogRef.afterClosed().subscribe((result: Question) => {
            if (result) {
                this.questions.push(result);
            }
        });
    }

    toggleQuestionType(type: string) {
        if (this.selectedTypes.has(type)) {
            this.selectedTypes.delete(type);
        } else {
            this.selectedTypes.add(type);
        }
        this.updateDisplayQuestions();
    }

    updateDisplayQuestions() {
        if (this.selectedTypes.size === 0) {
            this.displayQuestions = [];
        } else if (this.selectedTypes.size === 2) {
            this.displayQuestions = this.questions;
        } else {
            const selectedType = this.selectedTypes.values().next().value;
            this.displayQuestions = this.questions.filter(question => question.type === selectedType);
        }
    }
}
