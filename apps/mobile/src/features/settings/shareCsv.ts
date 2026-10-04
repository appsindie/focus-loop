import * as Sharing from "expo-sharing";

// expo-file-system's modern File API is loaded lazily — same pattern as the
// rewarded-ad port, so jest and Expo Go keep working without the native module.
type FileLike = {
  uri: string;
  create(options?: { overwrite?: boolean; intermediates?: boolean }): void;
  write(contents: string): void;
};
type FileSystemModule = {
  File: new (parent: unknown, name: string) => FileLike;
  Paths: { cache: unknown };
};

function loadFileSystem(): FileSystemModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-file-system") as FileSystemModule;
  } catch {
    return null;
  }
}

export type ShareCsvResult = "shared" | "unavailable";

// P20: writes the CSV to the cache dir and hands it to the system share sheet.
// "unavailable" maps to the generic UI copy (ui-error-handling rule — never a
// raw native error).
export async function shareCsvFile(
  csv: string,
  filename = "focus-loop-sessions.csv",
): Promise<ShareCsvResult> {
  const fs = loadFileSystem();
  if (fs == null) {
    return "unavailable";
  }
  try {
    const file = new fs.File(fs.Paths.cache, filename);
    file.create({ overwrite: true });
    file.write(csv);
    if (!(await Sharing.isAvailableAsync())) {
      return "unavailable";
    }
    await Sharing.shareAsync(file.uri, { mimeType: "text/csv", dialogTitle: "Export sessions" });
    return "shared";
  } catch {
    return "unavailable";
  }
}
