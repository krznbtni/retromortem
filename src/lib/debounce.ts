export function debounce<T extends unknown[]>(
  func: (...args: T) => void | Promise<void>,
  delay: number,
): (...args: T) => void {
  let timer: NodeJS.Timeout | null = null;

  return (...args: T) => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      void func.call(null, ...args);
    }, delay);
  };
}
