export function isString(str: unknown): str is string {
  return str != null && typeof str.valueOf() === 'string';
}
