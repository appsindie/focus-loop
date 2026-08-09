import type { ReactNode } from "react";

type AdsProviderProps = {
  children: ReactNode;
};

export function AdsProvider({ children }: AdsProviderProps) {
  return <>{children}</>;
}
