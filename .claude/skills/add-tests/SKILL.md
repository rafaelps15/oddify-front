---
name: add-tests
description: Backfill missing tests for an Angular Modulith domain — Signal Store unit tests (mocked Data Service) and component tests (mocked Store). Use when the user asks to add, improve, or backfill front-end test coverage.
argument-hint: <store, component, or domain to cover, e.g. "FlightSearchStore" or "the booking domain">
---

# Add Tests for an Existing Use Case

Backfill the two test types this architecture expects: **Store tests** (state/orchestration logic,
Data Service mocked) and **component tests** (rendering/interaction, Store mocked). Read the
target Store/component first, then mirror the closest existing spec.

**Test framework: Vitest**, run through Angular's `@angular/build:unit-test` builder (`ng test` /
`npm test`) — this project's actual stack (`ng new --test-runner vitest`, the Angular CLI default
since Angular 20/21; Karma is being phased out upstream). `describe`/`it`/`expect`/`vi` are global
(`tsconfig.spec.json` sets `"types": ["vitest/globals"]`), no imports needed. Mocks use `vi.fn()`/
`vi.spyOn()` instead of `jasmine.createSpy()`/`jasmine.createSpyObj()` — same
`.mockReturnValue(...)`/`.mockImplementation(...)` shape as Jest, since Vitest's mock API is
Jest-compatible.

## Workflow

1. **Locate the slice.** Find the Store method(s) or component under test. List every distinct
   outcome: the success path (signal updated with the right value) and the error path (the
   `error` callback branch / the resource's `.error()` signal).
2. **Check what already exists** in `src/app/{domain}/**/*.spec.ts` — extend existing spec files,
   don't duplicate.
3. **Write Store tests** — mock the Data Service (a plain object with `vi.fn()` per method, e.g.
   `vi.fn().mockReturnValue(of(...))` / `.mockReturnValue(throwError(() => ...))`), assert on what
   the Store's computed signals read after calling its method. `resource()`/
   `rxResource()` resolve asynchronously even when the underlying Observable is synchronous (they
   go through Angular's reactivity/microtask scheduling) — use `TestBed.flushEffects()` or
   `await fixture.whenStable()`, or wrap the assertion in `fakeAsync`/`tick()`, don't assume a
   synchronous read right after calling a method the way a `BehaviorSubject`-backed Facade would
   allow.
4. **Write component tests** — provide the Store via `TestBed`'s `providers` with a fake built
   from a plain object exposing the same signal-shaped properties (plain functions returning a
   fixed value work fine for a read-only signal stand-in; use a real `signal()` if the test needs
   to change the value mid-test and re-render), assert the template renders correctly and that
   interactions call the right Store method with the right arguments.
5. **Run** `ng test` (optionally scoped with `--include` for the changed spec, or `vitest --watch`
   directly for interactive re-runs), fix failures before finishing.

## Conventions

- **Store tests:** mock only the Data Service — the Store under test is real, created via
  `TestBed.inject(FlightSearchStore)` after providing the mock.

```ts
// flight-search.store.spec.ts
describe('FlightSearchStore', () => {
  let store: InstanceType<typeof FlightSearchStore>;
  let dataService: { load: Mock; reopen: Mock };

  beforeEach(() => {
    dataService = { load: vi.fn(), reopen: vi.fn() };
    dataService.load.mockReturnValue(of([]));

    TestBed.configureTestingModule({
      providers: [FlightSearchStore, { provide: FlightDataService, useValue: dataService }]
    });
    store = TestBed.inject(FlightSearchStore);
  });

  it('exposes the loaded flights', async () => {
    dataService.load.mockReturnValue(of([{ id: 1, name: 'LH123', description: '' }]));
    store.load(); // resource() resolves asynchronously even for a synchronous of(...)
    await TestBed.inject(ApplicationRef).whenStable();
    expect(store.flightList()).toHaveLength(1);
  });

  it('surfaces the error on a failed load', async () => {
    dataService.load.mockReturnValue(throwError(() => new Error('boom')));
    store.load();
    await TestBed.inject(ApplicationRef).whenStable();
    expect(store.error()).toBeTruthy();
  });
});
```

`Mock` is Vitest's mock-function type (`import type { Mock } from 'vitest'` — or skip the import
and let it infer, `vitest/globals` covers the runtime `vi`, not this type alias).

- **Component tests:** mock the Store with a plain object exposing the same signal-shaped
  properties (functions, since a signal is called like one) so the template's direct
  `store.flightList()` calls have something genuine to read:

```ts
// flight-search.component.spec.ts
const flightListSignal = signal<Flight[]>([]);
const storeStub = {
  flightList: flightListSignal,
  loading: signal(false),
  error: signal<string | null>(null),
  load: vi.fn(),
  reopen: vi.fn()
};

TestBed.configureTestingModule({
  imports: [FlightSearchComponent],
  providers: [{ provide: FlightSearchStore, useValue: storeStub }]
});

it('renders each flight from the store', () => {
  const fixture = TestBed.createComponent(FlightSearchComponent);
  flightListSignal.set([{ id: 1, name: 'LH123', description: 'x' }]);
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('LH123');
});
```

- **Naming:** `{Store}.spec.ts` / `{Component}.spec.ts`, `describe('{ClassName}')`, test names as
  full sentences (`it('reloads the list after a successful reopen', ...)`).
- **Assertions:** assert on what the Store's public signals return, and that mutating methods
  call the Data Service with the right arguments
  (`expect(dataService.reopen).toHaveBeenCalledWith(1)`) — don't assert on private
  `_xResource`/`withProps` internals.

Full Store/Data Service shape to mirror when writing specs for them lives in
[../add-context/references/domain-lib.md](../add-context/references/domain-lib.md) and
[../add-feature/references/store-method.md](../add-feature/references/store-method.md).
