# Domain Folder Templates

Files go in `src/app/{domain}/`. Replace `booking`/`Flight`/`Flights` throughout — this example (a
`booking` domain with a `Flight` entity) is the one to imitate literally when in doubt.

These templates follow Manfred Steyer's current recommended state layer — `NgRx Signal Store`
(`@ngrx/signals`) with `resource()`/`rxResource()` for backend-loaded data — layered inside the
same `entities/application/infrastructure` folders his DDD/Strategic-Design architecture always
uses. No Repository abstraction, no `Result`-wrapper: same simplicity philosophy as the classic
`@angular-architects/ddd` plugin flavor, just with a Store instead of a `BehaviorSubject` Facade.

This project's `CLAUDE.md` has no project-wide doc-comment convention decided — comment only the
non-obvious WHY, not the WHAT. The templates below follow that: no `/** ... */` on every class/
method. If you copy this skill pack into a different project that *does* have a doc-comment
convention (its `CLAUDE.md` or equivalent), follow that project's convention instead.

## Entity — plain interface, no behavior

```ts
// entities/flight.ts

export interface Flight {
  id: number;
  name: string;
  description: string;
}
```

## Data Service — concrete, injectable, calls `HttpClient` directly

```ts
// infrastructure/flight.data.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Flight } from '../entities/flight';

@Injectable({ providedIn: 'root' })
export class FlightDataService {
  private http = inject(HttpClient);

  load(): Observable<Flight[]> {
    return this.http.get<Flight[]>('/api/flights');
  }

  create(flight: Omit<Flight, 'id'>): Observable<Flight> {
    return this.http.post<Flight>('/api/flights', flight);
  }
}
```

No repository interface, no DI token abstraction over this — `FlightDataService` **is** the
data-access layer, same as before. It's `providedIn: 'root'`, so nothing needs manual
`provide`-wiring in `app.config.ts` to use it.

## Store — `signalStore()`, `resource()` for the read side, one per feature/use-case

```ts
// application/flight-search.store.ts
import { signalStore, withState, withProps, withComputed, withMethods } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Flight } from '../entities/flight';
import { FlightDataService } from '../infrastructure/flight.data.service';

export const FlightSearchStore = signalStore(
  { providedIn: 'root' },
  withProps(() => ({
    _flightDataService: inject(FlightDataService)
  })),
  withProps((store) => ({
    _flightListResource: rxResource({
      stream: () => store._flightDataService.load()
    })
  })),
  withComputed((store) => ({
    flightList: computed(() =>
      store._flightListResource.hasValue() ? store._flightListResource.value() : []
    ),
    loading: computed(() => store._flightListResource.isLoading()),
    error: computed(() => store._flightListResource.error()?.message ?? null)
  })),
  withMethods((store) => ({
    load(): void {
      store._flightListResource.reload();
    }
  }))
);
```

- The Store name matches the **feature/use-case**, not the entity (`FlightSearchStore`, not
  `FlightStore`) — a new feature folder gets a new Store, even when several features in the same
  domain share the same entity. Two features that both need flight data get two Stores, each
  wrapping the same `FlightDataService`.
- `withProps` (first block) injects dependencies; `withProps` (second block, receives `store`) is
  where the `resource()`/`rxResource()` lives — it needs `store` in scope to read reactive params
  or call the just-injected Data Service. Split into two `withProps` calls when the resource
  doesn't depend on anything computed by an earlier `withComputed`; combine/reorder if it does
  (a resource can depend on a computed signal defined earlier in the chain via `params: () =>
  ...` — check whether an existing Store in this codebase already does this with `rxResource` and
  mirror its shape).
- **`params: () => undefined` means "no params yet" and skips the loader entirely** (the resource
  goes `'idle'`, confirmed against Angular's own `resource()` implementation) — this is the correct
  way to express "don't load until an id/filter is set" (see `store-method.md` in `add-feature`).
  But if `undefined` is itself a *meaningful* value for the use case (e.g. an optional filter where
  "unset" should load an unfiltered list, not wait), don't return it bare from `params` — wrap it
  in an object so the resource always has *a* param to react to: `params: () => ({ filtro:
  store.filtro() })`, then read `params.filtro` (which can still be `undefined`) inside `stream`.
- `withComputed` exposes `flightList`/`loading`/`error` as plain signals — no `{name}$`/
  `Observable` naming, no `async` pipe. Components read `store.flightList()` directly.
- Loading/error state come from the `resource()` itself (`.isLoading()`, `.error()`) — don't
  hand-roll parallel `loading`/`error` signals for the read side; only add a *separate* error
  signal in `withMethods`/`withState` for **mutation** errors (the read resource's error is about
  the read, not about a `create`/`update` call — see `store-method.md` in `add-feature` for that
  shape).
- **Always read a resource through `.hasValue()`, never `.value() ?? fallback`.** `.value()`
  *throws* while the resource is in an `'error'` state (confirmed against Angular's own
  `resource()` implementation) — `?? []` never gets a chance to run because the throw happens
  first, so a failed load crashes the computed signal (and anything reading it) instead of falling
  back. `.hasValue()` is the non-throwing check: `computed(() => store._xResource.hasValue() ?
  store._xResource.value() : fallback)`. This matters even more once a second resource reads a
  computed derived from a first one (e.g. `params: () => store.someComputedFromAnotherResource()`)
  — an unguarded `.value()` there turns one resource's error into an unhandled exception inside a
  *different* resource's reactive params computation.
- No `Result<T>`/success-failure wrapper anywhere. The resource's `.error()` signal is exactly
  Angular's own error-channel — there's nothing to wrap.

## Barrel (`src/app/{domain}/index.ts`)

```ts
export * from './entities/flight';
export * from './infrastructure/flight.data.service';
export * from './application/flight-search.store';
```

Nothing else needs exporting — other domains only ever import entities/data-services/stores
through this barrel, never reach into `./application/...`/`./infrastructure/...` paths directly.
`feature-*/` folders in the **same** domain don't need the barrel — they can import straight from
`../application/flight-search.store` since they're inside the domain already; the barrel exists
for **other domains** and the shell.
