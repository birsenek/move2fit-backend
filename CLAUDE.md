# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm run start:dev    # run with hot reload (development)
npm run start:prod   # run compiled output
npm run build        # compile TypeScript via nest build
npm run lint         # lint and auto-fix with ESLint + Prettier
npm run format       # format all .ts files with Prettier
npm run test         # run unit tests (jest, rootDir: src, matches *.spec.ts)
npm run test:watch   # run unit tests in watch mode
npm run test:cov     # run tests with coverage report
npm run test:e2e     # run e2e tests (test/jest-e2e.json config)
```

Docker (starts MySQL + backend together):
```bash
docker compose up -d
```

Swagger UI is available at `http://localhost:3000/swagger` when running.

### Starting and stopping the server manually

Start (foreground, press `Ctrl + C` to stop):
```bash
npm run start:dev
```

Start in background:
```bash
npm run start:dev &
```

Stop background process:
```bash
# option 1
kill %1

# option 2 — find PID by port then kill
lsof -i :3000
kill <PID>
```

## Environment Variables

The app reads from `.env`. Key variables for `DevService` (database connection):

| Variable       | Default      | Description         |
|----------------|--------------|---------------------|
| `DB_HOST`      | `localhost`  | PostgreSQL host     |
| `DB_PORT`      | `5432`       | PostgreSQL port     |
| `DB_USERNAME`  | `postgres`   | Database user       |
| `DB_PASSWORD`  | `root`       | Database password   |
| `DB_NAME`      | `move2fit`   | Database name       |
| `PORT`         | `3000`       | HTTP server port    |
| `API_KEY`      | —            | Required for Swagger's `X-API-KEY` header guard |

> Note: `docker-compose.yml` defines a MySQL container but `src/data/services/dev.service.ts` connects to **PostgreSQL**. For local development without Docker, run a PostgreSQL instance with the defaults above.

## Architecture

### Module Structure

Each domain follows the same NestJS pattern: `module → controller → service → entity`.

```
src/
  auth/         # Authentication (JWT + Passport)
  usuarios/     # App users (trainers / account holders)
  aluno/        # Students/clients being trained
  exercicio/    # Individual exercises
  categoria/    # Exercise categories
  data/services/dev.service.ts  # TypeORM connection factory
```

### Domain Model

- **Categoria** `(tb_categorias)` — exercise category (nome, descricao, icone). One-to-many with Exercicio.
- **Exercicio** `(tb_exercicios)` — exercise (nome, descricao, carga, repeticao, tempo, foto). Many-to-one with Categoria; many-to-many with Aluno.
- **Aluno** `(tb_alunos)` — student (nome, email, foto, peso, altura, imc, classificacao). Many-to-many with Exercicio (owns the join table).
- **Usuario** `(tb_usuarios)` — app user (nome, usuario/email, senha, foto, peso, altura, imc, classificacao). IMC and classificacao are **auto-calculated** on create and update inside `UsuarioService`.

### Authentication Flow

Two parallel auth mechanisms:

1. **JWT (most endpoints)** — `POST /auth/logar` validates credentials via `LocalStrategy` (Passport local), then `AuthService.login` returns a `Bearer <token>`. Protected routes use `JwtAuthGuard`.
2. **API Key (Swagger)** — `ApiKeyGuard` checks the `X-API-KEY` request header against the `API_KEY` env variable.

`AuthModule` and `UsuarioModule` have a `forwardRef` circular dependency because `UsuarioService` is needed in `AuthService` and `Bcrypt` (from `AuthModule`) is needed in `UsuarioService`.

### Database

TypeORM is configured with `synchronize: true`, meaning schema changes are applied automatically on startup. There is no migration workflow — entity changes are reflected immediately.

All entities are registered explicitly in `DevService.createTypeOrmOptions()`. When adding a new entity, import and add it to the `entities` array there.

### Validation

`ValidationPipe` is applied globally in `main.ts`. Entities use `class-validator` decorators (`@IsNotEmpty`, `@IsEmail`, `@MinLength`, etc.) and `class-transformer` `@Transform` for trimming strings.
