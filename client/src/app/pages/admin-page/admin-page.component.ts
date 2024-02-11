import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';
import { GameService } from '@app/services/game.service';
import { Choices, Game, Question } from '@common/game';
import { v4 } from 'uuid';

const MIN_POINTS = 10;
const MAX_POINTS = 100;

const MIN_DURATION = 10;
const MAX_DURATION = 60;

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    games: Game[];
    selectedFile: File;
    isAuthentificated: boolean;
    errors: string;
    constructor(
        readonly router: Router,
        readonly communicationService: CommunicationService,
        public el: ElementRef,
        readonly gameService: GameService,
    ) {}

    async getGames() {
        this.games = await this.gameService.getAllGames();
    }

    async ngOnInit() {
        this.communicationService.sharedVariable$.subscribe((data) => {
            this.isAuthentificated = data;
        });
        if (!this.isAuthentificated) {
            this.router.navigate(['/home']);
        }
        await this.getGames();
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

    questionErrorsHandling(questions: Question[]) {
        if (questions === undefined || questions.length === 0) {
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
            if (!questions.every((question: Question) => question.choices.length >= 2 && question.choices.length <= 4)) {
                this.errors += ' Les questions doivent contenir un nombre de choix compris entre 2 et 4. ';
            }
            if (
                !questions.every((question: Question) => question.choices.every((choice: Choices) => choice.text && typeof choice.text === 'string'))
            ) {
                this.errors += 'Les choix de réponse des questions doivent avoir un texte de type string. ';
            }
            if (
                !questions.every(
                    (question: Question) =>
                        !question.choices.every((choice: Choices) => choice.isCorrect === true) &&
                        !question.choices.every((choiche: Choices) => choiche.isCorrect === false),
                )
            ) {
                this.errors += 'La validité des choix de réponse ne peut pas être que vraie ou que fausse.';
            }
        }
    }

    isArrayOfQuestions(questions: Question[]): questions is Question[] {
        return (
            Array.isArray(questions) &&
            questions.every(
                (question: Question) =>
                    typeof question.type === 'string' &&
                    (question.type === 'QCM' || question.type === 'QRL') &&
                    typeof question.text === 'string' &&
                    typeof question.points === 'number' &&
                    question.points >= MIN_POINTS &&
                    question.points <= MAX_POINTS &&
                    question.points % MIN_POINTS === 0 &&
                    (question.choices?.length ?? 0) >= 2 &&
                    (question.choices?.length ?? 0) <= 4 &&
                    Array.isArray(question.choices) &&
                    question.choices.every((choice: Choices) => typeof choice.text === 'string') &&
                    !question.choices.every((choice: Choices) => choice.isCorrect === true) &&
                    !question.choices.every((choiche: Choices) => choiche.isCorrect === false),
            )
        );
    }
    // - cdl
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, complexity
    isGame(obj: any): obj is Game {
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
        this.errors = 'Erreurs rencontrées: ';

        if (this.verifyIfJSON()) {
            this.readFile(this.selectedFile).then((jsonArray: unknown) => {
                this.handleFile(jsonArray);
            });
        } else {
            const handleErrorsGrid = this.el.nativeElement.querySelector('#handleErrorsGrid');
            handleErrorsGrid.innerText = 'Le type de fichier est invalide. Veuillez sélectionner un fichier de type JSON.';
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
}
