import { useState, useEffect } from 'react';

// Custom hook — counts up from 0 to `target` over `duration` ms
// Written from scratch with useEffect + setInterval (no library)
export function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }

    let current = 0;
    // How much to add each tick (60fps ~= 16ms intervals)
    const tickMs   = 16;
    const steps    = duration / tickMs;
    const increment = target / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, tickMs);

    return () => clearInterval(timer); // cleanup on unmount
  }, [target, duration]);

  return count;
}
