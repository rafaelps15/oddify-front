import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { SystemStatusDataService } from '../infrastructure/system-status.data.service';
import { SystemStatusStore } from './system-status.store';

describe('SystemStatusStore', () => {
  let dataService: { getHealth: Mock };

  beforeEach(() => {
    dataService = { getHealth: vi.fn().mockReturnValue(of({ status: 'Healthy', entries: {} })) };

    TestBed.configureTestingModule({
      providers: [SystemStatusStore, { provide: SystemStatusDataService, useValue: dataService }]
    });
  });

  it('maps healthy entries from /health plus the two static mock items', async () => {
    dataService.getHealth.mockReturnValue(
      of({
        status: 'Healthy',
        entries: {
          'api-football': { status: 'Healthy', description: null },
          'the-odds-api': { status: 'Healthy', description: null },
          npgsql: { status: 'Healthy', description: null },
          redis: { status: 'Healthy', description: null }
        }
      })
    );

    const store = TestBed.inject(SystemStatusStore);
    await TestBed.inject(ApplicationRef).whenStable();

    const itens = store.itens();
    expect(itens.find((item) => item.label === 'API-Football')?.ok).toBe(true);
    expect(itens.find((item) => item.label === 'The Odds API')?.ok).toBe(true);
    expect(itens.filter((item) => item.mock)).toHaveLength(2);
  });

  it('marks an entry as not ok when missing from /health', async () => {
    dataService.getHealth.mockReturnValue(of({ status: 'Unhealthy', entries: {} }));

    const store = TestBed.inject(SystemStatusStore);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.itens().find((item) => item.label === 'API-Football')?.ok).toBe(false);
  });

  it('surfaces the error on a failed load', async () => {
    dataService.getHealth.mockReturnValue(throwError(() => new Error('boom')));

    const store = TestBed.inject(SystemStatusStore);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.error()).toBeTruthy();
  });
});
