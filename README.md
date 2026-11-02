# productivity_app

A personal goal planner that runs in your browser. It keeps track of long-term
and short-term goals, breaks them into tasks, and schedules those tasks into the
free time you have each week (with Google Calendar sync planned).

## Running it

You need [Node.js](https://nodejs.org/) 20 or newer installed.

```bash
npm install     # first time only
npm run dev     # starts the app
```

Then open the address it prints (usually http://localhost:5173).

Your data is saved in your browser on this computer. Use **Settings → Export
backup** to save a copy to a file.

## Roadmap

1. ✅ Project skeleton, data model, local saving and backups
2. ✅ Goal tracking: long-term goals → short-term goals → tasks, with progress
3. Scheduler: spread tasks across your weekly free time, plus Google Calendar sync
4. Weekly view, per-goal progress view, and a short walkthrough

## Adding goals

- **In the app:** Goals → **+ New goal**. Pick *Save money*, *Learn skills for a
  job* (paste the skills from a job description) or *Something else* (list your
  milestones). You'll see a preview of the short-term goals and tasks before
  saving, and you can edit everything afterwards.
- **From a chat with Claude:** describe a goal and Claude adds its breakdown to
  `src/data/goals.json`. After you pull the change (`git pull`), the goal shows
  up the next time you open the app. Your ticked-off tasks are kept, and goals
  you delete in the app stay deleted.

## Project layout

- `src/data/types.ts` – the data model (goals, tasks, availability)
- `src/data/storage.ts` – saving to the browser, export/import
- `src/data/goals.json` – goals added outside the app (see above)
- `src/breakdown/templates.ts` – how goals are broken into short-term goals and tasks
- `src/components/` – the app's screens
- `npm test` runs the unit tests
