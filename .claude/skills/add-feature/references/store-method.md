# Extending an Existing Data Service/Store

Adding a use case to a domain that already exists — e.g. "reopen a flight" in the `booking`
domain scaffolded by `add-context` (which already has `Flight`, `FlightDataService`, and
`FlightSearchStore`).

## 1. Data Service — add the method, straight `HttpClient` call, raw `Observable`

```ts
// infrastructure/flight.data.service.ts
reopen(id: number): Observable<void> {
  return this.http.post<void>(`/api/flights/${id}/reopen`, {});
}
```

No interface to update first — there's no abstraction between the Store and this class, so this
is the only edit needed on the data-access side.

## 2. Store — add a method that calls the Data Service and reloads the read resource on success

```ts
// application/flight-search.store.ts
withMethods((store) => ({
  reopen(id: number): void {
    store._flightDataService.reopen(id).subscribe({
      next: () => store._flightListResource.reload(),
      error: (err) => console.error('err', err)
    });
  }
}))
```

Re-triggering the resource's reload after a successful mutation (rather than hand-patching its
`.value()`) keeps the Store simple and the UI always showing exactly what the server persisted —
the same trade-off the read-side `resource()` already makes implicitly.

## Mutation error state a screen needs to display

If the screen needs to show a mutation error (not just log it), add a plain signal via
`withState` rather than inventing a second resource for it:

```ts
export const FlightSearchStore = signalStore(
  { providedIn: 'root' },
  withState({ mutationError: null as string | null }),
  withProps(() => ({ _flightDataService: inject(FlightDataService) })),
  withProps((store) => ({
    _flightListResource: rxResource({ stream: () => store._flightDataService.load() })
  })),
  withComputed((store) => ({
    flightList: computed(() => store._flightListResource.value() ?? [])
  })),
  withMethods((store) => ({
    reopen(id: number): void {
      patchState(store, { mutationError: null });
      store._flightDataService.reopen(id).subscribe({
        next: () => store._flightListResource.reload(),
        error: (err) => patchState(store, { mutationError: err.message ?? 'Erro ao reabrir' })
      });
    }
  }))
);
```

`mutationError` is deliberately separate from the read resource's own `.error()` — a failed
mutation shouldn't make `flightList` look like it failed to load.

## New Store for a new screen over the same entity

If the use case is a **new screen** (not just a new action on an existing one), don't add a
method to `FlightSearchStore` — create a proper new Store + feature folder instead:

```ts
// application/flight-edit.store.ts
import { signalStore, withState, withProps, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Flight } from '../entities/flight';
import { FlightDataService } from '../infrastructure/flight.data.service';

export const FlightEditStore = signalStore(
  { providedIn: 'root' },
  withState({ id: undefined as number | undefined }),
  withProps(() => ({ _flightDataService: inject(FlightDataService) })),
  withProps((store) => ({
    _flightResource: rxResource({
      params: () => store.id(),
      stream: ({ params }) => params !== undefined
        ? store._flightDataService.loadById(params)
        : of(undefined)
    })
  })),
  withComputed((store) => ({
    // .hasValue(), not .value() directly — .value() throws while the resource is in an 'error'
    // state, see the note in add-context/references/domain-lib.md.
    flight: computed(() => (store._flightResource.hasValue() ? store._flightResource.value() : undefined))
  })),
  withMethods((store) => ({
    loadById(id: number): void {
      patchState(store, { id });
    },
    save(flight: Flight): void {
      store._flightDataService.update(flight).subscribe({
        next: () => store._flightResource.reload(),
        error: (err) => console.error('err', err)
      });
    }
  }))
);
```

(`loadById`/`update` added to `FlightDataService` the same way as `reopen` above.) Note the
`params: () => store.id()` pattern: setting `id` via `patchState` is what re-triggers the
resource, rather than calling an imperative `load()` that duplicates what the resource already
does reactively.
