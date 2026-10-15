'use client';

import { useEffect } from 'react';

let activeLocks = 0;
let wasLocked = false;

export function useBodyScrollLock() {
  useEffect(() => {
    if (activeLocks === 0) wasLocked = document.body.classList.contains('overflow-hidden');
    activeLocks += 1;
    document.body.classList.add('overflow-hidden');
    return () => {
      activeLocks -= 1;
      if (activeLocks === 0 && !wasLocked) document.body.classList.remove('overflow-hidden');
    };
  }, []);
}
