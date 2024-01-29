import { Injectable } from '@angular/core';
import { API_URL } from '@common/consts';
import { Question } from '@common/game';

@Injectable({
    providedIn: 'root',
})
export class QuestionsService {
    async getAllQuestions(): Promise<Question[]> {
        const response = await fetch(API_URL + 'admin/questions');
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const questions: Question[] = await response.json();
        return questions;
    }

    async sortAllQuestions(): Promise<Question[]> {
        const questions: Question[] = await this.getAllQuestions();
        const sortedQuestions: Question[] = questions.sort((a, b) => new Date(a.lastModification).getTime() - new Date(b.lastModification).getTime());
        return sortedQuestions;
    }

    // TODO ajouter delte, modify, get et add question
    async addQuestion(question: Question): Promise<void> {
        const response = await fetch(API_URL + 'admin/questions', {
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
}
