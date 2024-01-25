import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Game, Question } from '@common/game';

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
        //link to create new game but with arguments
    }

    onExportButtonClick(game: Game) {
        const {isHidden, ...gameWithoutHidden}: Game = game;
        const jsonData = JSON.stringify(gameWithoutHidden);
        const blob = new Blob([jsonData], {type: 'application/json'});
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
        //link to create new game
    }

    onQuestionsButtonClick() {
        this.router.navigate(['/admin/questions']);
    }

    onFileSelected(event: any) {
        this.selectedFile = event.target.files[0];
    }

    verifyIfJSON(): boolean {
        return this.selectedFile && this.selectedFile.type === 'application/json';
    }

    handleFile(jsonArray: any[]) {
        if (jsonArray.length > 1) {
            console.log("Veuillez importer qu'un seul jeu à la fois");
        }
        else {
            const attributes: string[] = ["title", "description", "duration", "questions"];
            const title: string = jsonArray[0]["title"];
            const description: string = jsonArray[0]["description"];
            const duration = jsonArray[0]["duration"];
            const questions: Question[] = jsonArray[0]["questions"];
            for (const attribute of attributes) {
                if (!jsonArray[0].hasOwnProperty(attribute)) {
                    console.log(`The game is missing a ${attribute}`);
                }
            }
            if (title && description && duration && questions) {
                const game: Game = {id: "1", title: title, description: description, duration: duration, lastModification: new Date(), isHidden: true, questions: questions};
                this.http.post('http://localhost:3000/api/admin/importgame', { game: game })
                    .subscribe((response: any) => {
                    });
            }
        }
    }

    onImportButtonClick() {
        if (this.verifyIfJSON()) {
            this.readFile(this.selectedFile).then((jsonArray: any[]) => {
                this.handleFile(jsonArray);
            });
        } else {
          console.log('Type de fichier invalide. Veuillez sélectionner un fichier de type JSON.');
        } 
    }

    private readFile(file: File): Promise<any[]> {
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
