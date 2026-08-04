"use client";

import { useEffect, useMemo } from "react";

export function AudioPlayer({ blob }: { blob: Blob }) {
  const url = useMemo(() => URL.createObjectURL(blob), [blob]);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return <audio src={url} controls className="w-full" />;
}
