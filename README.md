# Noor Quran

We are not building another Quran application.

We are building the most peaceful Quran reading experience.

Every animation has a purpose.

Every color has a meaning.

Every button must deserve its place.

The Quran is the center.

Everything else is secondary.

---

## Status

Early foundation (v0.1). Built so far: theme tokens, a reader prototype for Al-Fatihah with verse selection and an inline toolbar, and a Quran data layer (a service with swappable sources, a verified 114-surah index and an AlQuran.cloud adapter). See [`PROJECT_STATUS.md`](PROJECT_STATUS.md) for the current task and [`docs/09_Roadmap.md`](docs/09_Roadmap.md) for the plan.

## Run

```bash
npm install
npx expo start      # then open in Expo Go, or press a / i / w
npx tsc --noEmit    # type check
```

Stack: Expo · React Native · TypeScript.

## Working on it

The product docs live in [`docs/`](docs/) (north star, design philosophy, architecture, data, screens). Work follows the roadmap in order; ideas that are not on it go to [`docs/99_IdeasParking.md`](docs/99_IdeasParking.md).
