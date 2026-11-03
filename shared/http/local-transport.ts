type Transport = (url: string, init?: RequestInit) => Promise<unknown>;
let active: Transport | undefined;
export function activateLocalTransport(transport: Transport) {
  active = transport;
  return () => { if (active === transport) active = undefined; };
}
export function localTransport() { return active; }
