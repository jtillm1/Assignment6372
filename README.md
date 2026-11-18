# Triviabook

Express + Postgres (Neon) trivia API.

**Live app:** https://assignment6372.onrender.com

## Database schema

**topics**
| column | type | notes |
|--------|------|-------|
| id | SERIAL | primary key |
| name | TEXT | unique, not null |

**questions**
| column | type | notes |
|--------|------|-------|
| id | SERIAL | primary key |
| topic_id | INTEGER | foreign key -> topics(id), not null |
| question | TEXT | not null |
| answer | TEXT | not null |
| difficulty | TEXT | not null, one of `easy`, `medium`, `hard` |

## Setup

1. `npm install`
2. Create a Neon Postgres project and copy its connection string.
3. Create a `.env` file (see `.env.example`) with `DATABASE_URL=...`
4. `npm run seed` (creates tables and loads seed data; resets existing data)
5. `npm start` (runs on port 3000, or `PORT` if set)

## Endpoints

| method | path | description |
|--------|------|-------------|
| GET | `/triviabook/topics` | List all topics |
| GET | `/triviabook/topic/:topic?limit=&difficulty=` | Questions in a topic (404 if topic is unknown) |
| GET | `/triviabook/random` | One random question (no answer) |
| POST | `/triviabook/answer` | Body: `{ "id", "guess" }`. Returns `{ correct, answer }` |
| POST | `/triviabook/question/add` | Body: `{ "topic", "question", "answer", "difficulty" }`. Returns the topic's updated question list |
