import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  addParkedThought,
  loadParkedThoughts,
  markThoughtUsed,
  mostRecentUnused,
  removeParkedThought,
} from "./parkedThoughts";

describe("parkedThoughts", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("parks a thought and returns the most recent unused one (P24 Next up)", async () => {
    await addParkedThought("email An");
    const second = await addParkedThought("call mom");
    const thoughts = await loadParkedThoughts();
    expect(thoughts).toHaveLength(2);
    expect(mostRecentUnused(thoughts)!.id).toBe(second.id);
  });

  it("trims the text and marks a thought used so it leaves Next up", async () => {
    const thought = await addParkedThought("  buy milk  ");
    expect(thought.text).toBe("buy milk");
    await markThoughtUsed(thought.id);
    const thoughts = await loadParkedThoughts();
    expect(thoughts[0]!.usedAt).not.toBeNull();
    expect(mostRecentUnused(thoughts)).toBeNull();
  });

  it("removes a thought", async () => {
    const thought = await addParkedThought("drop this");
    await removeParkedThought(thought.id);
    expect(await loadParkedThoughts()).toEqual([]);
  });
});
