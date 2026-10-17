/** A single active narrator across intro, ending, and all death panels. */
let current: { token: symbol; stop: () => void } | null = null;
export function claimNarrator(stop: () => void) {
  const previous = current;
  current = null;
  previous?.stop();
  const token = Symbol('narrator');
  current = { token, stop };
  return () => {
    if (current?.token === token) current = null;
  };
}
