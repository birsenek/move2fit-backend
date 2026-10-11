# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm run start:dev    # run with hot reload (development)
npm run start:prod   # run compiled output (node dist/main)
npm run build        # compile TypeScript via nest build
npm run lint         # lint and auto-fix with ESLint + Prettier
npm run format       # format all .ts files with Prettier
npm run test         # run unit tests (jest, rootDir: src, matches *.spec.ts)
npm run test:watch   # run unit tests in watch mode
npm run test:cov     # run tests with coverage report
npm run test:e2e     # run e2e tests (test/jest-e2e.json config)
```

There are currently no `*.spec.ts` files in `src/`. The real test coverage lives in the sibling frontend repo (`../move2fit-frontend/tests/`, `node:test`) and runs against the **compiled** backend:

- `tendencia.test.cjs` — unit tests that `require` `dist/avaliacoes/tendencia`.
- `trainer-students.integration.cjs` — hits the running API (`TEST_API_URL`, default `http://localhost:3000`) and the database directly.

So after changing backend code: stop the services, `npm run build`, restart, then run those tests (see `../move2fit-frontend/LOCAL_SETUP.md`).

Swagger UI is available at `http://localhost:3000/swagger` when running.

### Local environment (Windows, no Docker)

The day-to-day setup is driven from the frontend repo: `../move2fit-frontend/start-local.ps1` starts a portable PostgreSQL, this backend (**from `dist/main.js`**, not watch mode) and Vite; `stop-local.ps1` stops them; `seed-local.ps1` loads sample data. Node and PostgreSQL binaries live in `../move2fit-frontend/.local/`. The script fails if `dist/main.js` does not exist.

### Docker

`docker-compose.yml` is stale: it defines a **MySQL** container and passes `DATABASE_*` variables, while the code connects to **PostgreSQL** and reads `DB_*`. Do not rely on it without fixing it first.

## Environment Variables

There is no `.env` file committed; `DevService` falls back to these defaults (which match the local setup above):

| Variable       | Default      | Description         |
|----------------|--------------|---------------------|
| `DB_HOST`      | `localhost`  | PostgreSQL host     |
| `DB_PORT`      | `5432`       | PostgreSQL port     |
| `DB_USERNAME`  | `movetofit`  | Database user       |
| `DB_PASSWORD`  | `move2fit`   | Database password   |
| `DB_NAME`      | `movetofit`  | Database name       |
| `PORT`         | `3000`       | HTTP server port    |
| `API_KEY`      | —            | Required by `ApiKeyGuard` (`X-API-KEY` header) |

## Architecture

### Module Structure

```
src/
  auth/         # JWT + Passport (local + jwt strategies), ApiKeyGuard, Bcrypt
  usuarios/     # Usuario entity + public signup; every account lives here
  aluno/        # Trainer-scoped student management (controller, service, dto/)
  avaliacoes/   # Avaliacao entity, CreateAvaliacaoDto, tendencia.ts (ML) — no module/controller
  exercicio/    # Exercise catalog
  categoria/    # Exercise categories
  data/services/dev.service.ts  # TypeORM connection factory
```

`categoria` and `exercicio` follow the plain `module → controller → service → entity` pattern. `aluno` has **no entity of its own**: it operates on `Usuario` rows with `tipo = 'ALUNO'`. `avaliacoes` is not a Nest module — its routes are exposed by `AlunoController` and its repository is obtained through `usuarioRepository.manager.getRepository(Avaliacao)`.

### Domain Model

- **Usuario** `(tb_usuarios)` — every account: nome, usuario (email), senha, foto, `tipo` (`'ALUNO'` | `'PERSONAL_TRAINER'`), ultimoLogin, diasSeguidos (login streak). **No longer has peso/altura/imc/classificacao columns.**
  - `exercicio` — many-to-many with Exercicio (join table `tb_usuarios_exercicio_tb_exercicios`, owned by Usuario).
  - `treinadores` / `alunos` — self-referencing many-to-many through `tb_treinador_aluno (alunoId, treinadorId)`. A student can have several trainers.
  - `avaliacoes` — one-to-many with Avaliacao.
- **Avaliacao** `(tb_avaliacoes)` — one physical assessment: `alunoId`, `treinadorId` (nullable, `SET NULL`), `dataColeta`, `semanaInicio` (Monday of that week), peso, altura, imc, classificacao, `origem` (`'MANUAL'` | `'SEED'` | `'MIGRACAO'`). Unique on `(alunoId, semanaInicio)` → **one assessment per student per week**, shared across all of the student's trainers. Dates are `YYYY-MM-DD` strings; decimals go through a transformer so they come back as numbers.
- **Categoria** `(tb_categorias)` — nome, descricao, icone. One-to-many with Exercicio.
- **Exercicio** `(tb_exercicios)` — nome, descricao, carga, repeticao, tempo, foto. Many-to-one with Categoria; inverse side `aluno` of the Usuario many-to-many.

### Authentication and authorization

- **Login** — `POST /usuarios/logar` (`AuthController`, `LocalAuthGuard`) returns the user data plus `token: "Bearer <jwt>"` and updates the login streak. The response no longer carries peso/altura/imc/classificacao.
- **Signup** — `POST /usuarios/cadastrar` is public. The other `/usuarios` routes (`/all`, `/:id`, `/atualizar`) require `ApiKeyGuard` (`X-API-KEY` = `API_KEY`).
- **JWT** — `JwtStrategy.validate` reloads the account from the database on every request and sets `request.user` to `AuthenticatedUser { id, usuario, tipo }` (exported from `auth/strategy/jwt.strategy.ts`). A token for a deleted account is rejected with 401. `/alunos`, `/exercicios` and `/categorias` are all behind `JwtAuthGuard`.
- **Trainer scoping** — every `AlunoService` method takes the `AuthenticatedUser`. `assertTrainer` returns 403 unless `tipo === 'PERSONAL_TRAINER'`; `requireLinked` returns 404 (`Aluno não encontrado na sua lista.`) unless the student is linked to that trainer in `tb_treinador_aluno`. Any new student-related route must go through `requireLinked`.

`AuthModule` and `UsuarioModule` have a `forwardRef` circular dependency (`UsuarioService` is used by `AuthService` and `JwtStrategy`; `Bcrypt` from `AuthModule` is used by `UsuarioService`).

### `/alunos` routes (`AlunoController`)

| Route | Behavior |
|---|---|
| `GET /alunos` | Students linked to the authenticated trainer |
| `GET /alunos/buscar?q=` | Autocomplete over **all** students by nome/email (min 2 chars, max 10 rows). Returns only `id`, `nome`, `usuario`, `vinculado` |
| `GET /alunos/:id` | Linked student with exercises and assessment summary |
| `POST /alunos` | Create a student **or**, if the email already belongs to a student, just link it. 409 if the email belongs to a trainer. New students require nome, senha, peso, altura |
| `POST /alunos/:id/vincular` | Link an existing student to the trainer |
| `PUT /alunos` | Updates **only** `nome` and `foto` |
| `DELETE /alunos/:id` | Removes only the trainer↔student link; the account, exercises and other trainers remain |
| `POST` / `DELETE /alunos/:id/exercicios/:exercicioId` | Assign / unassign an exercise |
| `GET /alunos/:id/avaliacoes` | `{ historico, tendencia }` (`tendencia` is `null` with fewer than 5 eligible assessments) |
| `POST /alunos/:id/avaliacoes` | Body `{ dataColeta, peso, altura }`; 409 if that week already has one; future dates rejected |

`/buscar` and `/:id/avaliacoes` are declared before `/:id` on purpose — keep static segments above the param route.

Student responses go through `safeAluno`, which strips `senha`, `treinadores`, `alunos` and `avaliacoes` and adds `ultimaAvaliacao` plus `peso`, `altura`, `imc`, `classificacao` **derived from the latest assessment** (they are not stored on the user).

### Assessments and trend model

- IMC is always computed server-side by `UsuarioService.calcularIMC(peso, altura)`; a client-sent IMC is never accepted. Classification boundaries are 18.5 / 25 / 30 / 35 / 40.
- Limits: peso 1–500 kg, altura 0.3–2.7 m (`CreateAvaliacaoDto`, and repeated in `UsuarioService.create`).
- "Today" and week starts are computed in `America/Sao_Paulo`; weeks run Monday–Sunday.
- When a student is created with peso and altura (public signup or `POST /alunos`), `UsuarioService.create` writes the first `Avaliacao` in the same transaction; `AlunoService.create` then stamps `treinadorId` on it.
- `avaliacoes/tendencia.ts` is a pure function: least-squares linear regression of weight over weeks since the first measurement, walk-forward validation (train on the first 3, predict the 4th, and so on), returning `coeficiente`, `intercepto`, `mae`, `maeBaseline` (repeat-last-weight baseline), `ajuste` and a `previsao` 7 days after the last measurement. Predicted IMC is derived from predicted weight and the last height. Records with `origem = 'MIGRACAO'` are excluded because their collection date is unknown.

Full rationale: `../move2fit-frontend/AVALIACOES_ML.md`.

### Concurrency and write conventions

- Account creation and assessment registration run inside transactions guarded by `pg_advisory_xact_lock(hashtext(...))` (keyed by lowercased email, or `'avaliacao:' + alunoId`). `UsuarioService.create` accepts an optional `EntityManager` so callers can join their own transaction.
- Emails are compared with `LOWER(TRIM(...))` and stored lowercased; a duplicate signup returns **409**.
- `UsuarioService.create` builds the entity from a whitelist of fields (nome, usuario, tipo, senha, foto) — IDs and relations in the request body are ignored. `tipo` must be `ALUNO` or `PERSONAL_TRAINER`.
- Join tables (`tb_treinador_aluno`, `tb_usuarios_exercicio_tb_exercicios`) are written with raw SQL `INSERT ... ON CONFLICT DO NOTHING` / `DELETE`, which makes linking idempotent. The SQL is PostgreSQL-specific (`$1` params, `ILIKE`, advisory locks).
- `ExercicioService` is a catalog only: `create`/`update` go through `catalogFields`, which rejects any payload containing `aluno` (400) and never returns student lists. Student↔exercise links are managed exclusively through the `/alunos/:id/exercicios/:exercicioId` routes.

### Database

TypeORM runs with `synchronize: true`: entity changes are applied to the schema on startup and there is no migration workflow. **Removing or renaming a column drops its data** — when a change needs to preserve data, write a one-off script and run it *before* starting the updated backend (precedent: `../move2fit-frontend/migrate-assessments.cjs`, which moved the measurements out of `tb_usuarios` into `tb_avaliacoes`).

All entities are registered explicitly in `DevService.createTypeOrmOptions()` (`Categoria`, `Usuario`, `Exercicio`, `Avaliacao`). When adding an entity, add it to that `entities` array.

`sql/schema.sql` and `sql/seed.sql` predate the trainer links and assessments; the seed is only used as input to `../move2fit-frontend/seed-local.cjs`, which adapts it to the current model.

### Validation

`ValidationPipe` is applied globally in `main.ts` with default options. The `aluno` routes use dedicated DTOs (`aluno/dto/aluno.dto.ts`, `avaliacoes/avaliacao.dto.ts`) with a per-route `ValidationPipe({ whitelist: true })` (plus `forbidNonWhitelisted` for assessments). The older `usuarios`, `exercicio` and `categoria` routes still receive the entity class as the body, validated by the `class-validator` decorators on the entity.
