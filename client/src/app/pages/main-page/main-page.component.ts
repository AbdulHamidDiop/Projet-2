import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';
import { QuestionsService } from '@app/services/questions.service';
import { Message } from '@common/message';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'Qui(ck)zz';
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');

    constructor(
        private readonly communicationService: CommunicationService,
        private router: Router,
        private http: HttpClient,
        private questionsService: QuestionsService,
    ) {
        // Pourra être supprimé après la démo.
        this.questionsService.getAllQuestions();
    }

    userInput: string = '';

    verifyPassword() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.http.post('http://localhost:3000/api/admin/password', { password: this.userInput }).subscribe((response: any) => {
            if (response === true) {
                this.router.navigate(['/admin']);
                this.communicationService.updateSharedVariable(true);
            } else {
                alert('Incorrect password');
            }
        });
    }

    onButtonClick() {
        this.verifyPassword();
    }

    sendTimeToServer(): void {
        const newTimeMessage: Message = {
            title: 'Hello from the client',
            body: 'Time is : ' + new Date().toString(),
        };
        // Important de ne pas oublier "subscribe" ou l'appel ne sera jamais lancé puisque personne l'observe
        this.communicationService.basicPost(newTimeMessage).subscribe({
            next: (response) => {
                const responseString = `Le serveur a reçu la requête a retourné un code ${response.status} : ${response.statusText}`;
                this.message.next(responseString);
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Le serveur ne répond pas et a retourné : ${err.message}`;
                this.message.next(responseString);
            },
        });
    }

    getMessagesFromServer(): void {
        this.communicationService
            .basicGet()
            // Cette étape transforme l'objet Message en un seul string
            .pipe(
                map((message: Message) => {
                    return `${message.title} ${message.body}`;
                }),
            )
            .subscribe(this.message);
    }
}
