import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/game-elements';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class QuestionsBankService {
    dummyQuestions: Question[] = [
        {
            type: 'QCM',
            text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
            points: 40,
            choices: [
                {
                    text: 'var',
                    isCorrect: true,
                },
                {
                    text: 'self',
                    isCorrect: false,
                },
                {
                    text: 'this',
                    isCorrect: true,
                },
                {
                    text: 'int',
                    isCorrect: false,
                },
            ],
            answer: '',
        },
        {
            type: 'QRL',
            text: "Donnez la différence entre 'let' et 'var' pour la déclaration d'une variable en JS ?",
            choices: [],
            points: 60,
            answer: '',
        },
        {
            type: 'QCM',
            text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ?",
            points: 20,
            choices: [
                {
                    text: 'Non',
                    isCorrect: true,
                },
                {
                    text: 'Oui',
                    isCorrect: false,
                },
            ],
            answer: '',
        },
        {
            type: 'QCM',
            text: "Quel méthode est utilisée pour arrondir un nombre à l'entier le plus proche en JavaScript?",
            points: 30,
            choices: [
                {
                    text: 'Math.round()',
                    isCorrect: true,
                },
                {
                    text: 'Math.ceil()',
                    isCorrect: false,
                },
                {
                    text: 'Math.floor()',
                    isCorrect: false,
                },
                {
                    text: 'Math.abs()',
                    isCorrect: false,
                },
            ],
            answer: '',
        },
        {
            type: 'QRL',
            text: "Expliquez ce que signifie 'hoisting' en JavaScript.",
            choices: [],
            points: 50,
            answer: '',
        },
        {
            type: 'QCM',
            text: "Quelle méthode permet de supprimer le dernier élément d'un tableau en JavaScript?",
            points: 25,
            choices: [
                {
                    text: 'pop()',
                    isCorrect: true,
                },
                {
                    text: 'push()',
                    isCorrect: false,
                },
                {
                    text: 'shift()',
                    isCorrect: false,
                },
                {
                    text: 'unshift()',
                    isCorrect: false,
                },
            ],
            answer: '',
        },
    ];

    getQuestions(): Observable<Question[]> {
        return of([...this.dummyQuestions]);
    }

    addQuestion(question: Question) {
        this.dummyQuestions.push(question);
    }
}
