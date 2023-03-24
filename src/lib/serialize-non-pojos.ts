export const serializeNonPOJOs = <T>(obj: T): T =>
  /// Native JS.
  /// Creates a deep clone of an object.
  /// It is equivalent to JSON.parse(JSON.stringify)
  /// but better.
  structuredClone(obj);
