// P21 tests: the three presets + custom row, save-immediately writes
// (J10-R3), and the fine-tune steppers which flip the preset to "custom".
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import { palette } from "../../shared/theme";
import { DEFAULT_SETTINGS, type Settings } from "../settings/SettingsStore";
import { RhythmScreen } from "./RhythmScreen";

const SETTINGS: Settings = {
  ...DEFAULT_SETTINGS,
  rhythmPresetId: "classic",
};

async function renderScreen(settings = SETTINGS) {
  const onChange = jest.fn();
  const screen = await render(
    <RhythmScreen
      colors={palette.light}
      settings={settings}
      onChange={onChange}
      onBack={jest.fn()}
    />,
  );
  return { ...screen, onChange };
}

describe("RhythmScreen (P21)", () => {
  it("lists the three presets plus Custom (J10-R1)", async () => {
    const { getByLabelText } = await renderScreen();
    getByLabelText("Rhythm preset Classic");
    getByLabelText("Rhythm preset Gentle start");
    getByLabelText("Rhythm preset Deep work");
    getByLabelText("Rhythm preset Custom");
  });

  it("marks the current preset as selected", async () => {
    const { getByLabelText } = await renderScreen();
    const row = getByLabelText("Rhythm preset Classic");
    const state = row.props["accessibilityState"] as { selected?: boolean } | undefined;
    expect(state?.selected).toBe(true);
  });

  it("picking Gentle saves immediately — no Save button (J10-R3)", async () => {
    const { getByLabelText, onChange } = await renderScreen();
    await fireEvent.press(getByLabelText("Rhythm preset Gentle start"));
    expect(onChange).toHaveBeenCalledWith({ rhythmPresetId: "gentle" });
  });

  it("a fine-tune stepper flips the preset to custom (J10-R1)", async () => {
    const { getByLabelText, onChange } = await renderScreen();
    await fireEvent.press(getByLabelText("Increase Focus"));
    expect(onChange).toHaveBeenCalledWith({
      rhythmPresetId: "custom",
      customRhythm: { ...SETTINGS.customRhythm, focusMinutes: 26 },
    });
  });

  it("shows the loop summary line", async () => {
    const { getByText } = await renderScreen();
    getByText(/min of focus · .*min total/);
  });
});
