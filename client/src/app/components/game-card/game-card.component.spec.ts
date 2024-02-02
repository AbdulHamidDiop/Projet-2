import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Game } from '@common/game';
import { of } from 'rxjs';
import { GameCardComponent } from './game-card.component';

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;
    let httpClient: HttpClient;
    let router: Router;
    const game: Game = { id: '1', title: 'Test Game', isHidden: false, questions: [] };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GameCardComponent],
            imports: [HttpClientTestingModule, RouterTestingModule],
        });

        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;
        httpClient = TestBed.inject(HttpClient);
        router = TestBed.inject(Router);

        // Mock the emit methods
        spyOn(component.deleteEvent, 'emit');
        spyOn(component.checkEvent, 'emit');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call onCheck method', () => {
        spyOn(httpClient, 'patch').and.returnValue(of({}));

        component.onCheck(game);

        expect(httpClient.patch).toHaveBeenCalledWith('http://localhost:3000/api/game/toggleHidden', { id: game.id });
        expect(component.checkEvent.emit).toHaveBeenCalledWith(component.game);
    });

    it('should call onExportButtonClick method', () => {
        const createObjectURLSpy = spyOn(URL, 'createObjectURL').and.callThrough();
        const revokeObjectURLSpy = spyOn(URL, 'revokeObjectURL');
        const fakeDownloadSpy = spyOn(component, 'onExportButtonClick').and.callFake(() => {});

        component.onExportButtonClick(game);

        expect(createObjectURLSpy).toHaveBeenCalled();
        expect(revokeObjectURLSpy).toHaveBeenCalled();
        expect(fakeDownloadSpy).toHaveBeenCalled();
    });

    it('should call onDeleteButtonClick method', () => {
        spyOn(httpClient, 'delete').and.returnValue(of({}));

        component.onDeleteButtonClick(game);

        expect(httpClient.delete).toHaveBeenCalledWith(`http://localhost:3000/api/game/deletegame/${game.id}`);
        expect(component.deleteEvent.emit).toHaveBeenCalledWith(component.game);
    });

    it('should call onModifyButtonClick method', () => {
        const navigateSpy = spyOn(router, 'navigate');

        component.onModifyButtonClick(game);

        expect(navigateSpy).toHaveBeenCalledWith([`/admin/createGame/${game.id}`]);
    });
});
