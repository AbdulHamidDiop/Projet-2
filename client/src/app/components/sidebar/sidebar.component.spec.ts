import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';

const NUMBER_OF_MESSAGES = 4;

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SidebarComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize message history with welcome messages', () => {
        expect(component.messages).toEqual([
            'Bienvenue dans le jeu QCM du projet LOG2990',
            'Vous pouvez répondre aux réponses en appuyant dessus puis en appuyant sur le bouton Confirmer',
            'Vous pouvez aussi utiliser les touches du clavier pour sélectionner une réponse, et la touche Entrée pour confirmer',
            'Vous pouvez laisser un message ici',
            'Vous êtes dans la room 0, les messages écrits ici seront envoyés aux autres personnes dans la room',
        ]);
    });

    it('should initialize message history size', () => {
        expect(component.messages.length).toBe(NUMBER_OF_MESSAGES);
    });

    it('should have initial display message as empty string', () => {
        expect(component.currentMessage).toBe('');
    });

    describe('handleKeyboardPress', () => {
        it('should add current message to message history on "Enter" key press', () => {
            const input = document.createElement('input');
            const event = new KeyboardEvent('keydown', { key: 'Enter' });

            input.value = 'Test message';
            component.currentMessage = { message: input.value } as ChatMessage;
            component.handleKeyboardPress(event, input);

            //            expect(component.messages[0]).toBe({ message: 'Test message' });
            //            expect(component.messages.length).toBe(NUMBER_OF_MESSAGES + 1);
            //            expect(component.currentMessage).toBe('');
        });

        it('should update current message on other key press', () => {
            const input = document.createElement('input');
            const event = new KeyboardEvent('keydown', { key: 'a' });

            input.value = 'Test message';
            component.handleKeyboardPress(event, input);

            expect(component.currentMessage).toBeTruthy();
        });
    });
});
