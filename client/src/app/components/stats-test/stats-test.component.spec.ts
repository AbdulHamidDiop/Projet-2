import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { StatsTestComponent } from './stats-test.component';

describe('StatsTestComponent', () => {
    let component: StatsTestComponent;
    let fixture: ComponentFixture<StatsTestComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [StatsTestComponent],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(StatsTestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
