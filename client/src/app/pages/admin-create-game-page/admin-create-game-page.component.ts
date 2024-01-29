import { CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AdminQuestionsBankComponent } from '@app/components/admin-questions-bank/admin-questions-bank.component';
import { CreateQuestionDialogComponent } from '@app/components/create-question-dialog/create-question-dialog.component';
import { GameService } from '@app/services/game.service';
import { Game, Question } from '@common/game';
import { v4 } from 'uuid';

const MIN_DURATION = 10;
const MAX_DURATION = 60;
@Component({
    selector: 'app-admin-create-game-page',
    templateUrl: './admin-create-game-page.component.html',
    styleUrls: ['./admin-create-game-page.component.scss'],
})
export class AdminCreateGamePageComponent {
    @ViewChild(AdminQuestionsBankComponent) questionsBankComponent!: AdminQuestionsBankComponent;
    questionsBankList!: CdkDropList;

    gameForm: FormGroup;
    game: Game;
    id: string;
    questions: Question[] = [];

    // eslint-disable-next-line max-params
    constructor(
        public dialog: MatDialog,
        private fb: FormBuilder,
        private cd: ChangeDetectorRef, // to avoid ExpressionChangedAfterItHasBeenCheckedError
        private gameService: GameService,
        private route: ActivatedRoute,
    ) {}

    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngAfterViewInit(): void {
        // Access the cdkDropList from the child component after view initialization
        this.questionsBankList = this.questionsBankComponent.questionsBankList;
        this.cd.detectChanges();
    }

    // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
    ngOnInit(): void {
        this.gameForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            duration: [null, [Validators.required, Validators.min(MIN_DURATION), Validators.max(MAX_DURATION)]],
        });

        this.route.paramMap.subscribe((params) => {
            const gameId = params.get('id');
            if (gameId) {
                this.loadGameData(gameId);
                this.id = gameId;
            } else {
                this.id = v4();
            }
        });
    }

    loadGameData(gameId: string): void {
        this.gameService.getGameByID(gameId).then((game: Game) => {
            this.populateForm(game);
        });
    }

    populateForm(game: Game): void {
        this.gameForm.setValue({
            title: game.title,
            description: game.description,
            duration: game.duration,
        });

        this.questions = [...game.questions];
    }

    openDialog(): void {
        const dialogRef = this.dialog.open(CreateQuestionDialogComponent, {});

        dialogRef.afterClosed().subscribe((result: Question) => {
            if (result) {
                this.questions.push(result);
            }
        });
    }

    dropQuestion(event: CdkDragDrop<Question[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
        }
    }

    handleDeleteQuestion(index: number): void {
        this.questions.splice(index, 1);
    }

    handleSaveQuestion(updatedQuestion: Question, index: number): void {
        if (index >= 0 && index < this.questions.length) {
            this.questions[index] = updatedQuestion;
        }
    }

    saveQuiz(): void {
        this.game = {
            id: this.id,
            lastModification: new Date(),
            title: this.gameForm.value.title,
            description: this.gameForm.value.description,
            duration: this.gameForm.value.duration,
            questions: this.questions,
            isHidden: true,
        };

        this.gameService.addGame(this.game);
    }
}
