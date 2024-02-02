import { EventEmitter, Injectable } from '@angular/core';
import { API_URL } from '@common/consts';
import { Question } from '@common/game';

@Injectable({
    providedIn: 'root',
})
export class QuestionsService {
    deleteRequest = new EventEmitter<Question>();
    questions: Question[] = [];

    constructor() {
        this.getAllQuestions().then((questions: Question[]) => {
            this.questions = questions;
        });
    }

    async getAllQuestions(): Promise<Question[]> {
        const response = await fetch(API_URL + 'questions');
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const questions: Question[] = await response.json();
        return questions;
    }

    sortAllQuestions(): Question[] {
        const sortedQuestions: Question[] = this.questions.sort(
            (a, b) => new Date(a.lastModification).getTime() - new Date(b.lastModification).getTime(),
        );
        return sortedQuestions;
    }

    async addQuestion(question: Question): Promise<void> {
        const response = await fetch(API_URL + 'questions/add', {
            method: 'POST',
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(question),
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
    }

    async editQuestion(question: Question): Promise<void> {
        const response = await fetch(API_URL + 'questions/edit', {
            method: 'PUT',
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(question),
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
    }

    async deleteQuestion(question: Question): Promise<void> {
        const response = await fetch(API_URL + 'questions/delete/' + question.id, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        this.deleteRequest.emit(question);
    }
}
