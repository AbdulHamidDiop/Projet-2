import { EventEmitter, Injectable } from '@angular/core';
import { API_URL } from '@common/consts';
import { Question, Type } from '@common/game';

@Injectable({
    providedIn: 'root',
})
export class QuestionsService {
    deleteRequest = new EventEmitter<Question>();
    questions: Question[] = [];
    /*    [
        {
            type: Type('QCM'),
            text: 'Which of the following is not a CSS preprocessor?',
            points: 30,
            choices: [
                {
                    text: 'Sass',
                    isCorrect: false,
                },
                {
                    text: 'LESS',
                    isCorrect: false,
                },
                {
                    text: 'Stylus',
                    isCorrect: false,
                },
                {
                    text: 'Angular',
                    isCorrect: true,
                },
            ],
            nbChoices: 4,
        },
        {
            type: Type('QRL'),
            text: "Explain the purpose of the 'async' keyword in JavaScript.",
            points: 50,
            nbChoices: 0,
        },
        {
            type: 'QCM',
            text: 'Which of the following is a valid HTML5 semantic element?',
            points: 20,
            choices: [
                {
                    text: 'div',
                    isCorrect: false,
                },
                {
                    text: 'section',
                    isCorrect: true,
                },
                {
                    text: 'span',
                    isCorrect: false,
                },
                {
                    text: 'font',
                    isCorrect: false,
                },
            ],
            nbChoices: 4,
        },
    ];*/
    currentQuestionIndex = 0;

    get question(): Question {
        if (this.questions.length === 0) {
            return {
                id: '',
                type: Type.QCM,
                text: '',
                points: 30,
                choices: [
                    {
                        text: '',
                        isCorrect: false,
                    },
                    {
                        text: '',
                        isCorrect: false,
                    },
                    {
                        text: '',
                        isCorrect: false,
                    },
                    {
                        text: '',
                        isCorrect: true,
                    },
                ],
                nbChoices: 4,
                lastModification: new Date(),
            };
        } else if (this.currentQuestionIndex + 1 === this.questions.length) {
            return this.questions[this.currentQuestionIndex];
        } else {
            return this.questions[this.currentQuestionIndex++];
        }
    }

    async getAllQuestions(): Promise<Question[]> {
        const response = await fetch(API_URL + 'questions');
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const questions: Question[] = await response.json();
        if (this.questions.length < questions.length) {
            this.questions = questions;
        }
        return questions;
    }

    async sortAllQuestions(): Promise<Question[]> {
        const questions: Question[] = await this.getAllQuestions();
        const sortedQuestions: Question[] = questions.sort((a, b) => new Date(a.lastModification).getTime() - new Date(b.lastModification).getTime());
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
