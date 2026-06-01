/**
 * ФАЙЛ: useBodyClass.js
 * ЧТО ЭТО: Хук CSS-класса body.
 * ЗА ЧТО ОТВЕЧАЕТ: класс на document.body.
 */
import { useEffect } from 'react';

/** Toggle a class on document.body while a modal/overlay is open. */
export function useBodyClass(className, active) {
  useEffect(() => {
    if (!active) return undefined;
    document.body.classList.add(className);
    return () => document.body.classList.remove(className);
  }, [className, active]);
}
