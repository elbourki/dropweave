import { useState, useEffect, Dispatch, SetStateAction } from "react";

export const useLocalStorage = <Type>(
  key: string,
  defaultValue: Type
): [Type, Dispatch<SetStateAction<Type>>] => {
  const [value, setValue] = useState<Type>(() => {
    const saved = localStorage.getItem(key);
    const initial = saved && JSON.parse(saved);
    return initial || defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
