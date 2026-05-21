"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  text: string;
};

export function CopyPromptButton({ text }: Props) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleClick = () => {
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 1500);
    navigator.clipboard.writeText(text).catch(() => {
      setCopied(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    });
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleClick}
        variant="outline"
        size="sm"
        aria-label="시스템 프롬프트 복사"
      >
        {copied ? "복사됨" : "복사"}
      </Button>
      {copied && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-xs text-background shadow-lg"
        >
          시스템 프롬프트가 복사되었어요
        </div>
      )}
    </>
  );
}
