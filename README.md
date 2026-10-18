# DOGM.AI Quiz

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)

An interactive quiz platform built for DOGM.AI Bootcamp students. Learners practise web development topics (HTML, CSS, JavaScript, TypeScript, React, Next.js, Node.js, SQL, PostgreSQL, Git, REST APIs, GraphQL, Docker, Python and Tailwind CSS) through a set of short mini-games, either as a guest (progress kept in the browser) or with an account (progress, stats and achievements stored in the database).

Related: [dogmai-cohort](https://github.com/newmachinesph/dogmai-cohort), the bootcamp's cohort management platform.

## Features

- **19 playable games** across memory, quiz, timed, reaction, coding, typing, word, ordering, matching and challenge categories: Flip & Match, Multiple Choice, True or False, Lightning Round, Code Output, Fill in Blank, Sequence, Typing, Hangman, Match Pairs, Word Scramble, Survival, Code Debugger, Hot Potato, Memory Chain, Whack-a-Mole, Code Complete, First Letter and Avalanche. Three more (Speed Quiz, Beat the Clock, Rapid Fire) are implemented but disabled in `data/games-config.json`.
- **Guest mode**: play without signing up; sessions and stats are kept in `localStorage` and can be migrated to a new account at sign-up.
- **Accounts**: username/password sign-up and login with bcrypt-hashed passwords, JWT bearer tokens (7-day expiry) and a simple in-memory rate limiter on auth routes.
- **Progress tracking**: game sessions, per-user stats, achievements and leaderboard entries via the REST routes under `app/api/`.
- **Content in the database**: topics, game types, questions (by topic and difficulty) and achievements, seeded from `prisma/seed.ts`.

## Tech stack

- Next.js 15 (App Router, Turbopack dev server), React 19, TypeScript
- Tailwind CSS 3, Framer Motion, lucide-react
- Prisma 6 with SQLite locally and Turso (libSQL) via `@prisma/adapter-libsql` in production
- Zod validation, bcryptjs, jsonwebtoken

## Getting started

Requires Node.js and npm.

```bash
npm install
npm run db:migrate   # creates prisma/dev.db (SQLite) and generates the Prisma client
npm run db:seed      # loads topics, game types, questions, achievements and demo users
npm run dev          # http://localhost:3000
```

`npm run db:seed` deletes all existing rows before inserting. It also creates two demo accounts (`admin` / `admin123` and `player` / `player123`) for local development only; do not seed a public database with these.

### Environment variables

Create a `.env` file (ignored by git) when you need any of these:

| Variable | Purpose |
|---|---|
| `JWT_SECRET` | Secret used to sign auth tokens. Set a strong value in any deployed environment; without it the app falls back to a development-only secret. |
| `TURSO_DATABASE_URL` | libSQL/Turso database URL. When this and `TURSO_AUTH_TOKEN` are set, the app and the seed script use Turso instead of the local SQLite file. |
| `TURSO_AUTH_TOKEN` | Turso auth token. |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | `prisma generate` then `next build` |
| `npm run start` | Serve the production build |
| `npm run lint` | `eslint .` |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Run `prisma migrate dev` |
| `npm run db:push` | Push the schema without a migration |
| `npm run db:seed` | Seed the database (`prisma/seed.ts`) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset the database and re-run migrations |

There is no automated test suite yet.

## Project structure

```
app/
  api/            REST routes: auth, games, topics, questions, sessions, stats, achievements, leaderboard
  dashboard/      Signed-in / guest dashboard
  game/[gameId]/  Game runner page
  login/ signup/  Auth pages
components/
  games/          One component per mini-game
  ui/             Toast, dialogs, spinner, error message
contexts/         AuthContext (user session and guest progress)
data/             games-config.json (game list and categories), sample-questions.json
lib/              Prisma client, auth helpers, API client, game registry, guest storage, validation
prisma/           Schema, migrations and seed script
public/fonts/     Variable font used by the UI
types/            Shared TypeScript types
```

To add a game, create a component in `components/games/`, import it into the component map in `lib/game-registry.tsx` and add an entry to `data/games-config.json`.

## License

[MIT](LICENSE). The MIT license covers the code; the DOGM.AI name identifies the project.
