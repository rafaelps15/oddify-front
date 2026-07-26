# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## What this is

The Angular front-end for **Oddify** (the sports-betting quant system whose backend also lives in
the sibling `oddify` repo). Structured as an **Angular Modulith with Strategic Design
(DDD)**: Manfred Steyer's domain/bounded-context architecture
([angulararchitects.io](https://www.angulararchitects.io/)), applied inside a single Angular CLI
project (no Nx workspace — folder convention enforces boundaries instead of Nx tags) with his
current recommended state layer, the **NgRx Signal Store** (`@ngrx/signals`). See
`.claude/skills/README.md` for exactly which of his architecture variants this is and why that
distinction matters, and `.claude/skills/` (`add-context`, `add-feature`, `add-tests`,
`ddd-review`) for the conventions and how to extend them.

Each bounded context is a top-level `src/app/{domain}/` folder (`entities/`, `application/` — the
Signal Stores, `infrastructure/` — the Data Services, plus one `feature-{useCase}/` folder per
screen); cross-cutting concerns (auth guards, the HTTP interceptor, session state, shared layouts)
live in `src/app/shared/`; the shell (`app.routes.ts`, `app.config.ts`, `app.component.ts`) is the
only place allowed to import a domain's `feature-*` folder directly. No Repository abstraction and
no `Result<T>` wrapper — Data Services call `HttpClient` directly and return raw `Observable<T>`.

This is a brand-new project: no Angular CLI workspace exists here yet (no `angular.json`,
`package.json`, `src/`), and none of the domain folders below exist yet either. Before scaffolding
the first bounded context, run `ng new` to generate the workspace and `npm i @ngrx/signals` for the
state layer. Then run `/add-context` to scaffold the first real domain.

## Bounded contexts (mirroring the backend's modules)

The backend (sibling repo `../oddify`) is a .NET modular monolith with three modules, named and
modeled entirely in Portuguese domain vocabulary. This front-end should mirror that same split —
same module names, same entity names — so the two stay easy to reason about together and the API
contracts don't need translating back and forth:

- **fixtures** — `ligas`, `equipes`, `jogadores`, `partidas`, `cotacoes`: reference/market data
  (leagues, teams, players, matches, odds). Backend entities: `LigaConfigurada`, `Equipe`,
  `Jogador`, `Partida`, `EstatisticaEquipe`, `EstatisticaJogador`, `Cotacao`.
- **analise** — `analises`: the quantitative model output (Poisson/Dixon-Coles probabilities,
  edge vs. market odds, the Claude critical-evaluator verdict) and its measurement (Brier score,
  ROI by layer). Backend entity: `AnaliseDePartida`.
- **apostas** — `bancas`, `apostas-multiplas`: bankroll, parlays/multiples (Kelly-fraction
  staking), settlement. Backend entities: `Banca`, `ApostaMultipla`, `PernaDeAposta`.

Keep entity/field names in Portuguese, matching the backend exactly (`ligaId`, `partidaId`,
`oddDeMercado`, `probDixonColes`, `decisaoDoClaude`, `saldoAtual`...) rather than translating to
English — the two repos should read as one system split across two languages of tooling (C#/
TypeScript), not two different domain vocabularies.

## Code comments

No project-wide doc-comment convention has been decided yet. Follow the general guidance of
commenting only the non-obvious WHY, not the WHAT — don't add a `/** ... */` on every
class/property/method, unless the user explicitly asks for that convention here too.
