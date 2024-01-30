import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';
import { Choices, Game, Question } from '@common/game';
import { v4 } from 'uuid';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    constructor(
        private http: HttpClient,
        private router: Router,
        private communicationService: CommunicationService,
    ) {}

    games: Game[];
    selectedFile: File;
    isAuthentificated: boolean;

    getGames() {
        // - cdl
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.http.get('http://localhost:3000/api/game').subscribe((response: any) => {
            this.games = response;
        });
    }

    ngOnInit() {
        this.communicationService.sharedVariable$.subscribe((data) => {
            this.isAuthentificated = data;
        });
        if (!this.isAuthentificated) {
            this.router.navigate(['/home']);
        }
        this.getGames();
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

    onDeleteGame(game: Game) {
        this.games = this.games.filter((g) => g !== game);
    }

    verifyIfJSON(): boolean {
        return this.selectedFile && this.selectedFile.type === 'application/json';
    }

    handleFile(jsonArray: unknown) {
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
            this.http.post('http://localhost:3000/api/game/importgame', { game }).subscribe((response: unknown) => {});
        }
    }

    isArrayOfQuestions(questions: Question[]): questions is Question[] {
        if (questions.length === 0) {
            console.log('Le jeu doit contenir au moins une question.');
        }
        if (!questions.every((question: Question) => question.type === 'QCM' || question.type === 'QRL')) {
            console.log('Les questions du jeu doivent être de type QCM ou QRL.');
        }
        if (!questions.every((question: Question) => question.text && typeof question.text === 'string')) {
            console.log('Les questions doivent avoir un texte de type string.');
        }
        if (
            !questions.every(
                (question: Question) =>
                    question.points &&
                    typeof question.points === 'number' &&
                    question.points >= 10 &&
                    question.points <= 100 &&
                    question.points % 10 === 0,
            )
        ) {
            console.log('Les questions doivent avoir un nombre de points alloué compris entre 10 et 100 et être un multiple de 10.');
        }
        if (!questions.every((question: Question) => question.choices.length >= 2 && question.choices.length <= 4)) {
            console.log('Les questions doivent contenir un nombre de choix compris entre 2 et 4.');
        }
        if (!questions.every((question: Question) => question.choices.every((choice: Choices) => choice.text && typeof choice.text === 'string'))) {
            console.log('Les choix de réponse des questions doivent avoir un texte de type string.');
        }

        return (
            Array.isArray(questions) &&
            questions.every(
                (question: Question) =>
                    typeof question.type === 'string' &&
                    (question.type === 'QCM' || question.type === 'QRL') &&
                    typeof question.text === 'string' &&
                    typeof question.points === 'number' &&
                    question.points >= 10 &&
                    question.points <= 100 &&
                    question.points % 10 === 0 &&
                    question.choices.length >= 2 &&
                    question.choices.length <= 4 &&
                    Array.isArray(question.choices) &&
                    question.choices.every((choice: Choices) => typeof choice.text === 'string'),
            )
        );
    }
    // - cdl
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isGame(obj: any): obj is Game {
        if (!obj.title || typeof obj.title !== 'string') {
            console.log('Le jeu importé doit avoir un titre de type string.');
        } else {
            if (this.games.some((game) => game.title === obj.title)) {
                console.log('Le titre choisi existe déjà. Veuillez en choisir un nouveau.');
            }
        }
        if (!obj.description || typeof obj.description !== 'string') {
            console.log('Le jeu importé doit avoir une description de type string.');
        }
        if (!obj.duration || typeof obj.duration !== 'number') {
            console.log('Le jeu importé doit avoir un temps alloué de type int.');
        } else {
            if (obj.duration < 10 || obj.duration > 60) {
                console.log('Le temps alloué pour une réponse doit être compris entre 10 et 60 secondes.');
            }
        }

        return (
            obj &&
            typeof obj.title === 'string' &&
            typeof obj.description === 'string' &&
            typeof obj.duration === 'number' &&
            !this.games.some((game) => game.title === obj.title) &&
            obj.duration >= 10 &&
            obj.duration <= 60 &&
            this.isArrayOfQuestions(obj.questions)
        );
    }

    onImportButtonClick() {
        if (this.verifyIfJSON()) {
            this.readFile(this.selectedFile).then((jsonArray: unknown) => {
                this.handleFile(jsonArray);
            });
        } else {
            console.log('Type de fichier invalide. Veuillez sélectionner un fichier de type JSON.');
        }
    }

    private async readFile(file: File): Promise<unknown[]> {
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
