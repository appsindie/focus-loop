// P10 must offer an exit that doesn't start the break — the focus record was
// already written before this screen showed, so "Done for now" can bail out.
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import { palette } from "../../../shared/theme";
import { CloseoutScreen } from "./CloseoutScreen";

const PROPS = {
  colors: palette.light,
  focusNumber: 2,
  focusedSeconds: 1500,
  intention: null,
  outcome: null,
  onOutcome: jest.fn(),
  autoStartBreaks: false,
  onAutoStartBreaks: jest.fn(),
  nextStep: { kind: "break" as const, roundIndex: 1, durationSeconds: 300 },
  onStartBreak: jest.fn(),
  onKeepGoing: jest.fn(),
  onDoneForNow: jest.fn(),
};

describe("CloseoutScreen", () => {
  it("'Done for now' calls its exit handler without starting the break", async () => {
    const { getByLabelText } = await render(<CloseoutScreen {...PROPS} />);
    await fireEvent.press(getByLabelText("Done for now"));
    expect(PROPS.onDoneForNow).toHaveBeenCalledTimes(1);
    expect(PROPS.onStartBreak).not.toHaveBeenCalled();
  });
});
