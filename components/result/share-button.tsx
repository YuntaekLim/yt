"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function ShareButton() {
  const [shared, setShared] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleClick = () => {
    setShared(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShared(false), 1500);
    navigator.clipboard.writeText(window.location.href).catch(() => {
      setShared(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    });
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleClick}
        variant="outline"
        className="flex-1"
        aria-label="결과 URL 공유"
      >
        {shared ? "공유됨" : "공유"}
      </Button>
      {shared && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-xs text-background shadow-lg"
        >
          URL이 복사되었어요
        </div>
      )}
    </>
  );
}
