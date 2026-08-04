export const AUDIO_CONSTRAINTS = {
  minDurationSec: 10,
  maxDurationSec: 180,
  maxFileSizeBytes: 20 * 1024 * 1024,
  allowedExtensions: ["mp3", "wav", "m4a", "webm"] as const,
  allowedMimeTypes: [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/m4a",
    "audio/x-m4a",
    "audio/mp4",
    "audio/webm",
  ] as const,
} as const;

export type AllowedAudioExtension = (typeof AUDIO_CONSTRAINTS.allowedExtensions)[number];

export function getAudioExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export function isAllowedAudioExtension(extension: string): extension is AllowedAudioExtension {
  return (AUDIO_CONSTRAINTS.allowedExtensions as readonly string[]).includes(extension);
}
