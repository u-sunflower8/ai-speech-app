import { z } from "zod";
import { AUDIO_CONSTRAINTS, getAudioExtension, isAllowedAudioExtension } from "@/config/audio";
import { getAudioDuration } from "@/lib/audio/duration";

const maxSizeMb = AUDIO_CONSTRAINTS.maxFileSizeBytes / (1024 * 1024);

export const audioFileSchema = z
  .instanceof(File)
  .refine((file) => isAllowedAudioExtension(getAudioExtension(file.name)), {
    error: `対応している音声形式は ${AUDIO_CONSTRAINTS.allowedExtensions.join(", ")} です。`,
  })
  .refine((file) => file.size <= AUDIO_CONSTRAINTS.maxFileSizeBytes, {
    error: `ファイルサイズは${maxSizeMb}MB以下にしてください。`,
  })
  .refine(
    async (file) => {
      const duration = await getAudioDuration(file);
      return (
        duration >= AUDIO_CONSTRAINTS.minDurationSec &&
        duration <= AUDIO_CONSTRAINTS.maxDurationSec
      );
    },
    {
      error: `音声の長さは${AUDIO_CONSTRAINTS.minDurationSec}秒〜${AUDIO_CONSTRAINTS.maxDurationSec}秒にしてください。`,
    }
  );
