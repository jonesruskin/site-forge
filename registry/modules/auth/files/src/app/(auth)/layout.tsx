import type { ReactNode } from "react";

/** Auth screens render without the marketing header and footer. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
