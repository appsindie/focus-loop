import AsyncStorage from "@react-native-async-storage/async-storage";

const PARKED_KEY = "focus-loop/v1/parked-thoughts";

// Spec J2-R3: parked while the timer runs; surfaced on Home, the Next-up widget, and
// at the next session.
export type ParkedThought = {
  id: string;
  text: string;
  createdAt: string;
  usedAt: string | null;
};

function isParkedThought(value: unknown): value is ParkedThought {
  if (typeof value !== "object" || value == null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate["id"] === "string" &&
    typeof candidate["text"] === "string" &&
    typeof candidate["createdAt"] === "string" &&
    (candidate["usedAt"] === null || typeof candidate["usedAt"] === "string")
  );
}

export async function loadParkedThoughts(): Promise<ParkedThought[]> {
  try {
    const raw = await AsyncStorage.getItem(PARKED_KEY);
    if (raw == null) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || !parsed.every(isParkedThought)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

async function saveParkedThoughts(thoughts: ParkedThought[]): Promise<void> {
  await AsyncStorage.setItem(PARKED_KEY, JSON.stringify(thoughts));
}

export async function addParkedThought(text: string): Promise<ParkedThought> {
  const thoughts = await loadParkedThoughts();
  const thought: ParkedThought = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text: text.trim(),
    createdAt: new Date().toISOString(),
    usedAt: null,
  };
  thoughts.push(thought);
  await saveParkedThoughts(thoughts);
  return thought;
}

export async function markThoughtUsed(id: string): Promise<void> {
  const thoughts = await loadParkedThoughts();
  const index = thoughts.findIndex((thought) => thought.id === id);
  if (index === -1) {
    return;
  }
  thoughts[index] = { ...thoughts[index]!, usedAt: new Date().toISOString() };
  await saveParkedThoughts(thoughts);
}

export async function removeParkedThought(id: string): Promise<void> {
  const thoughts = await loadParkedThoughts();
  await saveParkedThoughts(thoughts.filter((thought) => thought.id !== id));
}

// The medium "Next up" widget shows the most recent unused thought (P24).
export function mostRecentUnused(thoughts: ParkedThought[]): ParkedThought | null {
  const unused = thoughts.filter((thought) => thought.usedAt === null);
  return unused.length === 0 ? null : unused[unused.length - 1]!;
}
