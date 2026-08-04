// Plain module-level store (not React state). The `(dashboard)` layout reads
// cookies() for auth, making every route under it dynamically re-rendered on
// each navigation — Next.js re-fetches and remounts that client subtree per
// navigation, which resets any React Context/state living inside it. A
// module-level variable survives because the JS module itself isn't reloaded
// during client-side navigation, only components remount.

type PendingAudio = {
  file: File;
  durationSec: number;
};

let pendingAudio: PendingAudio | null = null;

export function setPendingAudio(audio: PendingAudio) {
  pendingAudio = audio;
}

export function getPendingAudio(): PendingAudio | null {
  return pendingAudio;
}

export function clearPendingAudio() {
  pendingAudio = null;
}
