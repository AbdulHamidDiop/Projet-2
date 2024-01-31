import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/game-elements';
import { API_URL } from '@common/consts';

@Injectable({
    providedIn: 'root',
})
export class QuestionsBankService {
    questions: Question[];
    constructor() {
        this.getQuestions().then((questions: Question[]) => {
            this.questions = questions;
        });
    }

    async getQuestions(): Promise<Question[]> {
        const response = await fetch(API_URL + 'questions');
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const questions: Question[] = await response.json();
        return questions;
    }
}
