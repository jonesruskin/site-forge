"use client";

import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { completeOnboardingAction } from "@/lib/onboarding/actions";
import type { OnboardingQuestion } from "@/lib/onboarding/config";
import { cn } from "@/lib/utils";

type Answers = Record<string, string | string[]>;

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Saving…" : "Finish"}
      <CheckIcon aria-hidden />
    </Button>
  );
}

/**
 * One question per screen. Number keys pick options (single choice advances on
 * its own), Enter continues, and every control is a native input underneath.
 */
export function OnboardingWizard({
  questions,
  initial = {},
}: {
  questions: OnboardingQuestion[];
  initial?: Answers;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initial);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const firstRender = useRef(true);

  const question = questions[step]!;
  const isLast = step === questions.length - 1;
  const value = answers[question.id];
  const answered =
    question.type === "text"
      ? question.optional || (typeof value === "string" && value.trim().length > 0)
      : Array.isArray(value)
        ? value.length > 0
        : typeof value === "string";

  useEffect(() => {
    // Move focus to the new question so screen readers announce it.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  const go = (next: number) => {
    clearTimeout(advanceTimer.current);
    setStep(Math.max(0, Math.min(questions.length - 1, next)));
  };

  const choose = (option: string) => {
    if (question.type !== "choice") return;
    if (question.multiple) {
      const current = Array.isArray(value) ? value : [];
      setAnswers({
        ...answers,
        [question.id]: current.includes(option)
          ? current.filter((item) => item !== option)
          : [...current, option],
      });
      return;
    }
    setAnswers({ ...answers, [question.id]: option });
    if (!isLast) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => go(step + 1), 280);
    }
  };

  // Listen on the window so shortcuts work before anything is focused.
  const onKeyDown = useEffectEvent((event: globalThis.KeyboardEvent) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    const typing = target instanceof HTMLInputElement && target.type === "text";
    const onButton = target instanceof HTMLButtonElement || target instanceof HTMLAnchorElement;
    if (event.key === "Enter" && !isLast && !onButton) {
      event.preventDefault();
      if (answered) go(step + 1);
      return;
    }
    if (!typing && question.type === "choice" && /^[1-9]$/.test(event.key)) {
      const option = question.options[Number(event.key) - 1];
      if (option) {
        event.preventDefault();
        choose(option);
      }
    }
  });

  useEffect(() => {
    const listener = (event: globalThis.KeyboardEvent) => onKeyDown(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  return (
    <form action={completeOnboardingAction} className="flex flex-col gap-10">
      <input type="hidden" name="answers" value={JSON.stringify(answers)} />

      <ol className="flex gap-1.5" aria-label={`Question ${step + 1} of ${questions.length}`}>
        {questions.map((item, index) => (
          <li
            key={item.id}
            aria-current={index === step ? "step" : undefined}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              index < step ? "bg-primary" : index === step ? "bg-primary/60" : "bg-muted",
            )}
          />
        ))}
      </ol>

      <fieldset key={question.id} className="animate-in flex min-h-80 flex-col gap-6">
        <legend className="contents">
          <span className="text-eyebrow text-muted-foreground">
            {step + 1} / {questions.length}
          </span>
          <h1 ref={headingRef} tabIndex={-1} className="text-heading mt-3 block outline-none">
            {question.title}
          </h1>
        </legend>
        {question.description && (
          <p className="text-muted-foreground -mt-3">{question.description}</p>
        )}

        {question.type === "choice" ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {question.options.map((option, index) => {
              const checked = Array.isArray(value) ? value.includes(option) : value === option;
              return (
                <label
                  key={option}
                  className={cn(
                    "border-input bg-card hover:border-foreground/40 has-focus-visible:ring-ring/50 flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors has-focus-visible:ring-3",
                    checked && "border-primary bg-primary/5 hover:border-primary",
                  )}
                >
                  <input
                    type={question.multiple ? "checkbox" : "radio"}
                    name={`question-${question.id}`}
                    value={option}
                    checked={checked}
                    onChange={() => choose(option)}
                    className="sr-only"
                  />
                  <Kbd aria-hidden className={cn(checked && "border-primary text-primary")}>
                    {index + 1}
                  </Kbd>
                  <span className="flex-1">{option}</span>
                  {checked && <CheckIcon aria-hidden className="text-primary size-4" />}
                </label>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-2">
            <label htmlFor={`question-${question.id}`} className="sr-only">
              {question.title}
            </label>
            <Input
              id={`question-${question.id}`}
              value={typeof value === "string" ? value : ""}
              placeholder={question.placeholder}
              maxLength={500}
              onChange={(event) => setAnswers({ ...answers, [question.id]: event.target.value })}
              className="h-12 text-base"
            />
            {question.optional && <p className="text-muted-foreground text-sm">Optional.</p>}
          </div>
        )}
      </fieldset>

      <div className="flex items-center justify-between gap-4">
        <Button type="button" variant="ghost" onClick={() => go(step - 1)} disabled={step === 0}>
          <ArrowLeftIcon aria-hidden />
          Back
        </Button>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground hidden text-xs sm:inline">
            press <Kbd>Enter</Kbd>
          </span>
          {isLast ? (
            <SubmitButton disabled={!answered} />
          ) : (
            <Button type="button" onClick={() => go(step + 1)} disabled={!answered}>
              Continue
              <ArrowRightIcon aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
