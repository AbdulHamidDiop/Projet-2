import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameService } from '@app/services/game.service';
import { Game } from '@common/game';
import { GameCardComponent } from './game-card.component';

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;
    let gameService: GameService;
    let router: Router;
    let game: Game = { id: '1', title: 'Test Game', isHidden: false, questions: [] };

    beforeEach(() => {
        game = { id: '1', title: 'Test Game', isHidden: false, questions: [] };
        TestBed.configureTestingModule({
            declarations: [GameCardComponent],
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [GameService],
        });

        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;
        component.game = game;
        fixture.detectChanges();

        gameService = TestBed.inject(GameService);
        router = TestBed.inject(Router);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit checkEvent when onCheck is called', async () => {
        spyOn(gameService, 'toggleGameHidden').and.returnValue(Promise.resolve());
        spyOn(component.checkEvent, 'emit');

        await component.onCheck(game);

        expect(gameService.toggleGameHidden).toHaveBeenCalledWith('1');
        expect(component.checkEvent.emit).toHaveBeenCalledWith(game);
    });

    it('should call onExportButtonClick method and download a file', () => {
        const createObjectURLSpy = spyOn(URL, 'createObjectURL').and.callFake((blob) => `fake-url/${blob}`);
        const revokeObjectURLSpy = spyOn(URL, 'revokeObjectURL');

        component.onExportButtonClick(game);

        expect(createObjectURLSpy).toHaveBeenCalled();
        expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    it('should emit deleteEvent when onDeleteButtonClick is called', () => {
        spyOn(gameService, 'deleteGameByID');
        spyOn(component.deleteEvent, 'emit');

        component.onDeleteButtonClick(game);

        expect(gameService.deleteGameByID).toHaveBeenCalledWith('1');
        expect(component.deleteEvent.emit).toHaveBeenCalledWith(game);
    });

    it('should redirect to createGame page', () => {
        const navigateSpy = spyOn(router, 'navigate');

        component.onModifyButtonClick(game);

        expect(navigateSpy).toHaveBeenCalledWith([`/admin/createGame/${game.id}`]);
    });
});
