export function isEmpty(obj: unknown) {
  return (
    [Object, Array].includes((obj || {}).constructor as ObjectConstructor | ArrayConstructor) &&
    !Object.entries(obj || {}).length
  );
}
