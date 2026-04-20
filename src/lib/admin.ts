/**
 * Comma-separated emails in ADMIN_EMAILS env var get access to /admin.
 * Example in .env: ADMIN_EMAILS="z.yaakov@hotmail.com,other@admin.com"
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}
