export function isTrueObject(object: unknown): object is Record<string, unknown> {
  return typeof object === 'object' && object !== null && !Array.isArray(object);
}
