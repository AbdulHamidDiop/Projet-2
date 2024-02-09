import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';
import { QuestionsService } from '@app/services/questions.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'Qui(ck)zz';
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');

    constructor(
        readonly communicationService: CommunicationService,
        readonly router: Router,
        private http: HttpClient,
        readonly questionsService: QuestionsService,
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
}
