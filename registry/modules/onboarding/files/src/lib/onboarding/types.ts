/** A setup checklist item. Contributed through the onboarding-tasks slot. */
export type OnboardingTask = {
  /** Stable id. */
  id: string;
  title: string;
  description?: string;
  /** Where to go to do it. */
  href: string;
  /** Whether this user has done it. Runs on the server for every dashboard view: keep it cheap. */
  done: (userId: string) => Promise<boolean>;
};
