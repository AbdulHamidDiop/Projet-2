import { TestBed } from '@angular/core/testing';

import { QRLStatsService } from './qrl-stats.service';

describe('QRLStatsService', () => {
  let service: QRLStatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QRLStatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
