import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {    
    constructor(private http: HttpClient, private router: Router) {}

    games: any[];
    selectedFile: any;

    getGames() {
        this.http.get("http://localhost:3000/api/admin")
            .subscribe((response: any) => {
              this.games = response;
            });
    }

    ngOnInit() {
        this.getGames();
    }
    
    onCheck(game: any) {
        this.http.patch('http://localhost:3000/api/admin/toggleHidden', { id: game.id })
            .subscribe((response: any) => {});
    }

    onDeleteButtonClick(game: any) {
        this.http.delete(`http://localhost:3000/api/admin/deletegame/${game.id}`)
            .subscribe((response: any) => {});
    }

    onModifyButtonClick() {
        //link to create new game but with arguments
    }

    onExportButtonClick(game: any) {
        //get game as json
    }

    onCreateButtonClick() {
        //link to create new game
    }

    onQuestionsButtonClick() {
        this.router.navigate(["/admin/questions"]);
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
