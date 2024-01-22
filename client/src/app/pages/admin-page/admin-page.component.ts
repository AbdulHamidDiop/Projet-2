import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    password: string = '';
    
    constructor(private http: HttpClient, private router: Router) {}

    verifyPassword() {
        this.http.post('http://localhost:3000/verify-password', { password: this.password })
            .subscribe((response: any) => {
                if (response.success) {
                    // Password is correct, navigate to the admin page
                    window.location.href = '/admin';
                } else {
                    alert('Incorrect password');
                }
            });
    }

    games = [{
        "id": "1a2b3c",
        "title": "Questionnaire sur le JS",
        "description" : "Questions de pratique sur le langage JavaScript",
        "duration": 60,
        "lastModification": "2018-11-13T20:20:39+00:00",
        "isHidden": true,
        "questions": [
            {
                "type": "QCM",
                "text": "Parmi les mots suivants, lesquels sont des mots clés réservés en JS?",
                "points": 40,
                "choices": [
                    {
                        "text": "var",
                        "isCorrect": true
                    },
                    {
                        "text": "self",
                        "isCorrect": false
                    },
                    {
                        "text": "this",
                        "isCorrect": true
                    },
                    {
                        "text": "int"
                    }
                ]
            },
            {
                "type": "QRL",
                "text": "Donnez la différence entre 'let' et 'var' pour la déclaration d'une variable en JS ?",
                "points": 60
            },
            {
                "type": "QCM",
                "text": "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
                "points": 20,
                "choices": [
                    {
                        "text": "Non",
                        "isCorrect": true
                    },
                    {
                        "text": "Oui",
                        "isCorrect": null
                    }
                ]
            }
        ]
    }]

    selectedFile: any;
    
    onCheck(game: any) {
        //post game.hidden 
    }

    onDeleteButtonClick() {
        //delete game
    }

    onModifyButtonClick() {
        
    }

    onExportButtonClick(game: any) {
        //get game as json
    }

    onCreateButtonClick() {
        //link to create new game
    }

    onQuestionsButtonClick() {
        this.router.navigate(["/admin/questions"])
    }

    onFileSelected(event: any) {
        this.selectedFile = event.target.files[0];
    }

    verifyIfJSON(): boolean {
        if (this.selectedFile && this.selectedFile.type === 'application/json') {
            return true;
          } else {
            return false;
        }
    }

    onImportButtonClick() {
        if (this.verifyIfJSON()) {
            
        } else {
          console.log('Invalid file type. Please select a JSON file.');
        } 
    }
}
