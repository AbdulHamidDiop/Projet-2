/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, ElementRef, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { ConfirmDialogModel } from '@app/classes/confirm-dialog-model';
import { ConfirmDialogComponent } from '@app/components/confirm-dialog/confirm-dialog.component';
import { CommunicationService } from '@app/services/communication.service';
import { GameSessionService } from '@app/services/game-session.service';
import { GameService } from '@app/services/game.service';
import { Choices, Game, Question, Type } from '@common/game';
import { GameSession } from '@common/game-session';
import { v4 } from 'uuid';
import { MAX_CHOICES, MAX_DURATION, MAX_POINTS, MIN_CHOICES, MIN_DURATION, MIN_POINTS } from './const';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
    games: Game[];
    sessions: GameSession[];
    selectedFile: File;
    isAuthentificated: boolean;
    errors: string;
    // chacun des paramètres est essentiel au fonctionnement, routage, etc... de la page admin et les séparer
    // en plusieurs fichier compliquerait le code inutillement.
    // eslint-disable-next-line max-params
    constructor(
        readonly router: Router,
        readonly communicationService: CommunicationService,
        public el: ElementRef,
        readonly gameService: GameService,
        readonly gameSessionService: GameSessionService,
        private deleteHistoryDialog: MatDialog,
    ) {}

    async getGames() {
        this.games = await this.gameService.getAllGames();
    }

    async getSessions() {
        this.sessions = await this.gameSessionService.getAllSessions();
    }

    async ngOnInit() {
        this.communicationService.sharedVariable$.subscribe((data) => {
            this.isAuthentificated = data;
        });
        if (!this.isAuthentificated) {
            this.router.navigate(['/home']);
        }
        await this.getGames();
        await this.getSessions();
    }

    onCreateButtonClick() {
        this.router.navigate(['/admin/createGame']);
    }

    onQuestionsButtonClick() {
        this.router.navigate(['/admin/questions']);
    }

    onFileSelected(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        const selectedFiles = inputElement.files;

        if (selectedFiles && selectedFiles.length > 0) {
            this.selectedFile = selectedFiles[0];
        }
    }

    onCheckGame(game: Game) {
        game.lastModification = new Date();
    }

    onDeleteGame(game: Game) {
        this.gameService.games = this.gameService.games.filter((g) => g !== game);
    }

    verifyIfJSON(): boolean {
        return this.selectedFile && this.selectedFile.type === 'application/json';
    }

    handleFile(jsonArray: unknown) {
        const handleErrorsGrid = this.el.nativeElement.querySelector('#handleErrorsGrid');
        if (this.isGame(jsonArray)) {
            const game: Game = {
                id: v4(),
                title: jsonArray.title,
                description: jsonArray.description,
                duration: jsonArray.duration,
                lastModification: new Date(),
                isHidden: true,
                questions: jsonArray.questions,
            };
            this.gameService.addGame(game);
            this.games.push(game);
            handleErrorsGrid.innerText = 'Le jeu a été importé correctement.';
        } else {
            handleErrorsGrid.innerText = this.errors;
        }
    }

    handleQCMQuestions(qcmQuestions: Question[]) {
        if (!qcmQuestions.every((question: Question) => question.choices!.length >= MIN_CHOICES && question.choices!.length <= MAX_CHOICES)) {
            this.errors += ' Les questions doivent contenir un nombre de choix compris entre 2 et 4. ';
        }
        if (
            !qcmQuestions.every((question: Question) => question.choices!.every((choice: Choices) => choice.text && typeof choice.text === 'string'))
        ) {
            this.errors += 'Les choix de réponse des questions doivent avoir un texte de type string. ';
        }
        if (
            !qcmQuestions.every(
                (question: Question) =>
                    !question.choices!.every((choice: Choices) => choice.isCorrect) &&
                    !question.choices!.every((choice: Choices) => !choice.isCorrect),
            )
        ) {
            this.errors += 'La validité des choix de réponse ne peut pas être que vraie ou que fausse.';
        }
    }

    handleQRLQuestions(qrlQuestions: Question[]) {
        if (!qrlQuestions.every((question: Question) => question.choices === undefined)) {
            this.errors += "Les questions d'un jeu de type QRL ne doivent pas avoir de choix de réponse.";
        }
    }
    handleChoicesError(questions: Question[]) {
        const qcmQuestions = [];
        const qrlQuestions = [];

        for (const question of questions) {
            if (question.type === 'QCM') {
                qcmQuestions.push(question);
            } else if (question.type === 'QRL') {
                qrlQuestions.push(question);
            }
        }

        this.handleQCMQuestions(qcmQuestions);
        this.handleQRLQuestions(qrlQuestions);
    }

    questionErrorsHandling(questions: Question[]) {
        if (questions === undefined || !questions.length) {
            this.errors += 'Le jeu doit contenir au moins une question. ';
        } else {
            if (!questions.every((question: Question) => question.type === 'QCM' || question.type === 'QRL')) {
                this.errors += 'Les questions du jeu doivent être de type QCM ou QRL. ';
            }
            if (!questions.every((question: Question) => question.text && typeof question.text === 'string')) {
                this.errors += 'Les questions doivent avoir un texte de type string. ';
            }
            if (
                !questions.every(
                    (question: Question) =>
                        question.points &&
                        typeof question.points === 'number' &&
                        question.points >= MIN_POINTS &&
                        question.points <= MAX_POINTS &&
                        question.points % MIN_POINTS === 0,
                )
            ) {
                this.errors += 'Les questions doivent avoir un nombre de points alloué compris entre 10 et 100 et être un multiple de 10. ';
            }
            this.handleChoicesError(questions);
        }
    }

    validateChoicesForQCM(question: Question): boolean {
        if (question.type === 'QCM') {
            return (
                (question.choices?.length ?? 0) >= 2 &&
                (question.choices?.length ?? 0) <= MAX_CHOICES &&
                Array.isArray(question.choices) &&
                question.choices.every((choice: Choices) => typeof choice.text === 'string') &&
                !question.choices.every((choice: Choices) => choice.isCorrect) &&
                !question.choices.every((choice: Choices) => !choice.isCorrect)
            );
        } else {
            return question.choices === undefined;
        }
    }

    isArrayOfQuestions(questions: Question[]): questions is Question[] {
        return (
            Array.isArray(questions) &&
            questions.length > 0 &&
            questions.every(
                (question: Question) =>
                    typeof question.type === 'string' &&
                    (question.type === Type.QCM || question.type === Type.QRL) &&
                    typeof question.text === 'string' &&
                    typeof question.points === 'number' &&
                    question.points >= MIN_POINTS &&
                    question.points <= MAX_POINTS &&
                    question.points % MIN_POINTS === 0 &&
                    this.validateChoicesForQCM(question),
            )
        );
    }

    handleGameError(obj: any): void {
        if (!obj.title || typeof obj.title !== 'string') {
            this.errors += 'Le jeu importé doit avoir un titre de type string. ';
        } else {
            if (this.games.some((game) => game.title === obj.title)) {
                this.errors += 'Le titre choisi existe déjà. Veuillez en choisir un nouveau. ';
            }
        }
        if (!obj.description || typeof obj.description !== 'string') {
            this.errors += 'Le jeu importé doit avoir une description de type string. ';
        }
        if (!obj.duration || typeof obj.duration !== 'number') {
            this.errors += 'Le jeu importé doit avoir un temps alloué de type int. ';
        } else {
            if (obj.duration < MIN_DURATION || obj.duration > MAX_DURATION) {
                this.errors += 'Le temps alloué pour une réponse doit être compris entre 10 et 60 secondes. ';
            }
        }
    }

    isGame(obj: any): obj is Game {
        this.handleGameError(obj);
        this.questionErrorsHandling(obj.questions);

        return (
            obj &&
            typeof obj.title === 'string' &&
            typeof obj.description === 'string' &&
            typeof obj.duration === 'number' &&
            !this.games.some((game) => game.title === obj.title) &&
            obj.duration >= MIN_DURATION &&
            obj.duration <= MAX_DURATION &&
            this.isArrayOfQuestions(obj.questions)
        );
    }

    onImportButtonClick() {
        this.errors = 'Erreurs rencontrées: \n';

        if (this.verifyIfJSON()) {
            this.readFile(this.selectedFile).then((jsonArray: unknown) => {
                this.handleFile(jsonArray);
            });
        } else {
            const handleErrorsGrid = this.el.nativeElement.querySelector('#handleErrorsGrid');
            handleErrorsGrid.innerText = 'Le type de fichier est invalide. Veuillez sélectionner un fichier de type JSON.\n';
        }
    }

    async readFile(file: File): Promise<unknown[]> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                try {
                    const jsonContent = JSON.parse(reader.result as string);
                    resolve(jsonContent);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = (error) => {
                reject(error);
            };

            reader.readAsText(file);
        });
    }

    async onDeleteHistory() {
        await this.gameSessionService.deleteHistory();
        this.sessions = [];
    }

    sortList(event: MatSelectChange) {
        const sortBy = event.value;
        this.sessions = this.sessions.filter((session) => session.timeStarted !== undefined);
        switch (sortBy) {
            case 'ascending-alphabetically':
                this.sessions.sort((a, b) => a.game.title.localeCompare(b.game.title));
                break;
            case 'descending-alphabetically':
                this.sessions.sort((a, b) => b.game.title.localeCompare(a.game.title));
                break;
            case 'ascending-date':
                this.sessions.sort((a, b) => new Date(a.timeStarted!).getTime() - new Date(b.timeStarted!).getTime());
                break;
            case 'descending-date':
                this.sessions.sort((b, a) => new Date(a.timeStarted!).getTime() - new Date(b.timeStarted!).getTime());
                break;
        }
    }

    handleDeleteHistory(): void {
        const message = "Êtes-vous sûr de vouloir supprimer l'historique?";

        const dialogData = new ConfirmDialogModel('Supprimer Historique', message);

        const dialogRef = this.deleteHistoryDialog.open(ConfirmDialogComponent, {
            maxWidth: '400px',
            data: dialogData,
        });

        dialogRef.afterClosed().subscribe((dialogResult) => {
            if (dialogResult) {
                this.onDeleteHistory();
            }
        });
    }
}
