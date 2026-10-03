export type BookingInput = { service: string; name: string; phone: string; email: string; summary: string; rows: [string, string][] };

/**
 * Saves a request through /api/bookings. A fixed URL rather than a server action, so a page opened before a deploy can
 * still submit after it; retried because the server may be restarting at that very moment.
 */
export async function submitBooking(input: BookingInput): Promise<boolean> {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      if (r.ok) return true;
      if (r.status < 500) return false; // refused (bad number, too many requests): trying again will not help
    } catch { /* offline, or the server is restarting */ }
    await new Promise((done) => setTimeout(done, 1500 * (i + 1)));
  }
  return false;
}
