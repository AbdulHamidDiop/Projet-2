import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketRoomService } from '@app/services/socket-room.service';
import { of } from 'rxjs';
import { BarChartComponent } from './bar-chart.component';

describe('BarChartComponent', () => {
    let component: BarChartComponent;
    let fixture: ComponentFixture<BarChartComponent>;
    let mockSocketRoomService: jasmine.SpyObj<SocketRoomService>;

    beforeEach(async () => {
        mockSocketRoomService = jasmine.createSpyObj('SocketRoomService', ['listenForMessages']);
        mockSocketRoomService.listenForMessages.and.returnValues(
            of({}), // Mock data for QCM_STATS event
            of({}), // Mock data for UPDATE_CHART event
            of({}), // Mock data for QRL_STATS event
            of({}), // Mock data for QRL_GRADE event
        );
        await TestBed.configureTestingModule({
            declarations: [BarChartComponent],
            providers: [{ provide: SocketRoomService, useValue: mockSocketRoomService }],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        mockSocketRoomService.listenForMessages.and.returnValues(of({}), of({}), of({}), of({}));
        fixture = TestBed.createComponent(BarChartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize barChartData with labels and datasets', () => {
        component.labels = 'Test Label';
        component.datasets = [{ data: [1, 2], label: 'Test Dataset', backgroundColor: 'red' }];
        component.updateData();

        expect(component.barChartData).toEqual({
            labels: ['Test Label'],
            datasets: [{ data: [1, 2], label: 'Test Dataset', backgroundColor: 'red' }],
        });
    });
});
