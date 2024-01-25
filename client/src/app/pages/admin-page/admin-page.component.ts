import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Choices, Game, Question } from '@common/game';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    constructor(
        private http: HttpClient,
        private router: Router,
    ) {}

    games: Game[];
    selectedFile: File;

    getGames() {
        this.http.get("http://localhost:3000/api/admin")
            .subscribe((response: any) => {
              this.games = response;
            });
    }

    ngOnInit() {
        this.getGames();
    }
    
    onCheck(game: Game) {
        this.http.patch('http://localhost:3000/api/admin/toggleHidden', { id: game.id }).subscribe((response: any) => {});
    }

    onDeleteButtonClick(game: Game) {
        this.http.delete(`http://localhost:3000/api/admin/deletegame/${game.id}`).subscribe((response: any) => { 
            window.location.reload();
        });
    }

    onModifyButtonClick() {
        // link to create new game but with arguments
    }

    onExportButtonClick(game: Game) {
        const { isHidden, ...gameWithoutHidden }: Game = game;
        const jsonData = JSON.stringify(gameWithoutHidden);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'data.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    onCreateButtonClick() {
        // link to create new game
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

    verifyIfJSON(): boolean {
        return this.selectedFile && this.selectedFile.type === 'application/json';
    }

    handleFile(jsonArray: unknown) {
        if (this.isGame(jsonArray)) {
            const game: Game = jsonArray;
            this.http.post('http://localhost:3000/api/admin/importgame', { game }).subscribe((response: any) => {});
        } else console.log(this.isGame(jsonArray));
    }

    isArrayOfQuestions(questions: Question[]): questions is Question[] {
        return (
            Array.isArray(questions) &&
            questions.every(
                (question: Question) =>
                    typeof question.type === 'string' && // Adjusted to handle type as string
                    (question.type === 'QCM' || question.type === 'QRL') &&
                    typeof question.text === 'string' &&
                    typeof question.points === 'number' &&
                    Array.isArray(question.choices) &&
                    question.choices.every(
                        (choice: Choices) => typeof choice.text === 'string',
                        // (typeof choice.isCorrect === 'boolean' || choice.isCorrect === null )
                    ),
            )
        );
    }

    isGame(obj: any): obj is Game {
        return (
            obj &&
            typeof obj.id === 'string' &&
            typeof obj.title === 'string' &&
            typeof obj.description === 'string' &&
            typeof obj.duration === 'number' &&
            typeof obj.lastModification === 'string' &&
            // typeof obj.isHidden === 'boolean' &&
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
