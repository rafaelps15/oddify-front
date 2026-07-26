import { signalStore, withProps, withComputed } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AnaliseDataService } from '../infrastructure/analise.data.service';

export const MedicaoStore = signalStore(
  { providedIn: 'root' },
  withProps(() => ({
    _analiseDataService: inject(AnaliseDataService)
  })),
  withProps((store) => ({
    _medicaoResource: rxResource({
      stream: () => store._analiseDataService.getMedicao()
    })
  })),
  withComputed((store) => ({
    medicao: computed(() => (store._medicaoResource.hasValue() ? store._medicaoResource.value() : undefined)),
    loading: computed(() => store._medicaoResource.isLoading()),
    error: computed(() => store._medicaoResource.error()?.message ?? null)
  }))
);
