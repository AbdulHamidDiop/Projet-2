import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { QuestionsPageComponent } from './questions-page.component';

describe('CreateGamePageComponent', () => {
    let component: QuestionsPageComponent;
    let fixture: ComponentFixture<QuestionsPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [QuestionsPageComponent, SidebarComponent, PlayAreaComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
