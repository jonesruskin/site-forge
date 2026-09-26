# onboarding

A calm first-run experience for new accounts.

- **Questionnaire** at `/onboarding`: one question per screen, written in `site.config.ts`
  (single or multiple choice, or free text). Number keys pick options, <kbd>Enter</kbd>
  continues, single-choice answers advance on their own. Fully keyboard and screen-reader
  friendly, and it can be skipped.
- **First visit redirect**: accounts younger than a day that haven't answered or skipped are
  sent there when they first open the dashboard (`redirectNewUsers`).
- **Setup checklist** on the dashboard with progress. Modules add their own items through the
  `onboarding-tasks` slot: billing ("Choose a plan"), teams ("Invite a teammate"), api
  ("Create an API key"), uploads ("Upload your first file"). It disappears when everything is
  done, or when hidden.

## Setup

None. Edit the questions in `site.config.ts`:

```ts
onboarding: {
  redirectNewUsers: true,
  questions: [
    { id: "role", type: "choice", title: "What best describes you?", options: ["Founder", "Engineer"] },
    { id: "channels", type: "choice", multiple: true, title: "Where do you publish?", options: ["Blog", "Newsletter", "Social"] },
    { id: "goal", type: "text", title: "What do you want to get done first?", optional: true },
  ],
},
```

## Environment

No variables.

## Usage

```ts
import { getOnboardingAnswers } from "@/lib/onboarding/state";

const { role } = await getOnboardingAnswers(user.id);
```

Add a checklist item from any module (or in `builtInTasks` in `src/lib/onboarding/state.ts`):

```ts
export const firstProjectTask = {
  id: "first-project",
  title: "Create your first project",
  href: "/projects/new",
  done: async (userId: string) => (await countProjects(userId)) > 0,
};
```

and contribute it with `{ "slot": "onboarding-tasks", "import": "firstProjectTask", "from": "…" }`
in the module's `module.json`. `done` runs on every dashboard view: keep it to one indexed query.

## Customization

- Layout and copy: `src/app/(onboarding)/onboarding/page.tsx`; the stepper is
  `src/components/onboarding/wizard.tsx`.
- Destination afterwards: `onboarding.afterOnboarding` (default `/dashboard`).

## Removal

`pnpm site remove onboarding`. Checklist contributions from other modules are skipped.
