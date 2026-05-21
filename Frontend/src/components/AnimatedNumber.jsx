import React, { useState, useEffect } from 'react';

export default function AnimatedNumber({ value, duration = 1000, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(value);
    if (isNaN(end)) return;

    let startTime = null;
    let animationFrameId;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing out function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const currentCount = progress === 1 ? end : start + (end - start) * easeOutQuart;
      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  const displayValue = Number.isInteger(parseFloat(value)) 
    ? Math.round(count) 
    : count.toFixed(1);

  return <span>{prefix}{displayValue}{suffix}</span>;
}
