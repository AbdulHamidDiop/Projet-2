import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CommunicationService } from '@app/services/communication.service';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AdminButtonComponent } from './admin-button.component';
import SpyObj = jasmine.SpyObj;

describe('AdminButtonComponent', () => {
    let component: AdminButtonComponent;
    let fixture: ComponentFixture<AdminButtonComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('ExampleService', ['basicGet', 'basicPost']);
        communicationServiceSpy.basicGet.and.returnValue(of({ title: '', body: '' }));
        communicationServiceSpy.basicPost.and.returnValue(of(new HttpResponse<string>({ status: 201, statusText: 'Created' })));

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientTestingModule],
            declarations: [],
            providers: [CommunicationService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should verify password successfully', fakeAsync(() => {
        component.userInput = 'log2990-312';

        spyOn(component.router, 'navigate');
        spyOn(component.communicationService, 'updateSharedVariable');

        spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response(null, { status: 200, headers: { contentType: 'application/json' } })));

        component.verifyPassword();
        tick();

        expect(component.router.navigate).toHaveBeenCalledWith(['/admin']);
        expect(component.communicationService.updateSharedVariable).toHaveBeenCalledWith(true);

        expect(window.fetch).toHaveBeenCalledWith(
            environment.serverUrl + 'admin/password',
            jasmine.objectContaining({
                method: 'POST',
                body: JSON.stringify({ password: component.userInput }),
            }),
        );
    }));

    it('should call verifyPassword on button click', () => {
        spyOn(component, 'verifyPassword');
        component.onButtonClick();
        expect(component.verifyPassword).toHaveBeenCalled();
    });

    it('toggleAdmin should toggle showAdminInput', () => {
        component.showAdminInput = false;
        component.toggleAdmin();
        expect(component.showAdminInput).toBeTrue();
        component.toggleAdmin();
        expect(component.showAdminInput).toBeFalse();
    });

    it('should set passwordError to true on failed password verification', fakeAsync(() => {
        component.userInput = 'log2990-312';

        spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response(null, { status: 401, headers: { contentType: 'application/json' } })));

        component.verifyPassword();
        tick();

        expect(component.passwordError).toBeTrue();
    }));
});
