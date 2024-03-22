import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
    constructor(
        readonly router: Router,
        readonly communicationService: CommunicationService,
        public el: ElementRef,
        readonly gameService: GameService,
        readonly gameSessionService: GameSessionService
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
        this.games = this.games.filter((g) => g !== game);
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

    handleQuestionErrors(questions: Question[]) {
        questions.forEach((question: Question) => {
            this.validateQuestionType(question);
            this.validateQuestionText(question);
            this.validateQuestionPoints(question);
            this.validateQuestionChoices(question);
            this.validateChoiceText(question);
            this.validateChoiceValidity(question);
        });
    }

    validateQuestionType(question: Question) {
        const validQuestionTypes = ['QCM', 'QRL'];
        if (!validQuestionTypes.includes(question.type)) {
            this.errors += 'Les questions du jeu doivent être de type QCM ou QRL.\n';
        }
    }

    validateQuestionText(question: Question) {
        if (!question.text || typeof question.text !== 'string') {
            this.errors += 'Les questions doivent avoir un texte de type string.\n';
        }
    }

    validateQuestionPoints(question: Question) {
        if (
            !(
                question.points &&
                typeof question.points === 'number' &&
                question.points >= MIN_POINTS &&
                question.points <= MAX_POINTS &&
                question.points % MIN_POINTS === 0
            )
        ) {
            this.errors += 'Les questions doivent avoir un nombre de points alloué compris entre 10 et 100 et être un multiple de 10.\n';
        }
    }

    validateQuestionChoices(question: Question) {
        if (!(question.choices.length >= MIN_CHOICES && question.choices.length <= MAX_CHOICES)) {
            this.errors += ' Les questions doivent contenir un nombre de choix compris entre 2 et 4.\n';
        }
    }

    validateChoiceText(question: Question) {
        if (!question.choices.every((choice: Choices) => choice.text && typeof choice.text === 'string')) {
            this.errors += 'Les choix de réponse des questions doivent avoir un texte de type string.\n';
        }
    }

    validateChoiceValidity(question: Question) {
        if (question.choices.every((choice: Choices) => choice.isCorrect) || question.choices.every((choiche: Choices) => !choiche.isCorrect)) {
            this.errors += 'La validité des choix de réponse ne peut pas être que vraie ou que fausse.\n';
        }
    }

    isArrayOfQuestions(questions: Question[]): questions is Question[] {
        return Array.isArray(questions) && questions.every((question: Question) => this.isValidQuestion(question));
    }

    isValidQuestion(question: Question): boolean {
        return (
            this.isValidQuestionType(question) &&
            this.isValidQuestionText(question) &&
            this.isValidQuestionPoints(question) &&
            this.isValidQuestionChoices(question)
        );
    }

    isValidQuestionType(question: Question): boolean {
        return question.type === Type.QCM || question.type === Type.QRL;
    }

    isValidQuestionText(question: Question): boolean {
        return typeof question.text === 'string';
    }

    isValidQuestionPoints(question: Question): boolean {
        return (
            typeof question.points === 'number' &&
            question.points >= MIN_POINTS &&
            question.points <= MAX_POINTS &&
            question.points % MIN_POINTS === 0
        );
    }

    isValidQuestionChoices(question: Question): boolean {
        return (
            Array.isArray(question.choices) &&
            (question.choices?.length ?? 0) >= MIN_CHOICES &&
            (question.choices?.length ?? 0) <= MAX_CHOICES &&
            question.choices.every((choice: Choices) => this.isValidChoice(choice)) &&
            !question.choices.every((choice: Choices) => choice.isCorrect) &&
            !question.choices.every((choice: Choices) => !choice.isCorrect)
        );
    }

    isValidChoice(choice: Choices): boolean {
        return typeof choice.text === 'string' && typeof choice.isCorrect === 'boolean';
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
    // - cdl
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isGame(obj: any): obj is Game {
        this.validateTitle(obj);
        this.validateDescription(obj);
        this.validateDuration(obj);
        if (!this.validateQuestions(obj)) {
            return false;
        }
        return this.validateGame(obj);
    }

    private validateTitle(obj: Game): void {
        if (!obj.title || typeof obj.title !== 'string') {
            this.errors += 'Le jeu importé doit avoir un titre de type string.\n';
        } else {
            if (this.games.some((game) => game.title === obj.title)) {
                this.errors += 'Le titre choisi existe déjà. Veuillez en choisir un nouveau.\n';
            }
        }
    }

    private validateDescription(obj: Game): void {
        if (!obj.description || typeof obj.description !== 'string') {
            this.errors += 'Le jeu importé doit avoir une description de type string.\n';
        }
    }

    private validateDuration(obj: Game): void {
        if (!obj.duration || typeof obj.duration !== 'number') {
            this.errors += 'Le jeu importé doit avoir un temps alloué de type int.\n';
        } else {
            if (obj.duration < MIN_DURATION || obj.duration > MAX_DURATION) {
                this.errors += 'Le temps alloué pour une réponse doit être compris entre 10 et 60 secondes.\n';
            }
        }
    }

    private validateQuestions(obj: Game): boolean {
        if (!obj.questions || obj.questions.length === 0) {
            this.errors += 'Le jeu doit contenir au moins une question.\n';
            return false;
        }
        this.handleQuestionErrors(obj.questions);
        return true;
    }

    private validateGame(obj: Game): boolean {
        return (
            typeof obj.title === 'string' &&
            typeof obj.description === 'string' &&
            typeof obj.duration === 'number' &&
            obj.duration >= MIN_DURATION &&
            obj.duration <= MAX_DURATION &&
            !this.games.some((game) => game.title === obj.title) &&
            this.isArrayOfQuestions(obj.questions)
        );
    }
}
