import { Alert, AlertDescription } from "@/components/ui/alert";
import type { SettingsState } from "@/lib/settings/actions";

export function FormStatus({ state }: { state: SettingsState }) {
  if (!state.message) return null;
  return (
    <Alert variant={state.status === "success" ? "success" : "destructive"}>
      <AlertDescription
        className={state.status === "success" ? "text-foreground" : "text-destructive"}
      >
        {state.message}
      </AlertDescription>
    </Alert>
  );
}
