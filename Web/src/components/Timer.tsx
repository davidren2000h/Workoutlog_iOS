import { useState, useEffect, useCallback } from 'react';

interface Props {
  running: boolean;
  startTime: number; // epoch ms
}

export default function Timer({ running, startTime }: Props) {
  const calcElapsed = useCallback(() => {
    if (!running || !startTime) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  }, [running, startTime]);

  const [elapsed, setElapsed] = useState(calcElapsed);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => setElapsed(calcElapsed()), 1000);
    return () => clearInterval(iv);
  }, [running, calcElapsed]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="timer-display">
      {h > 0 ? `${pad(h)}:` : ''}
      {pad(m)}:{pad(s)}
    </div>
  );
}
