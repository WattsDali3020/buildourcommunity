export function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof Response) {
    return error.status === 401;
  }
  if (error && typeof error === "object" && "status" in error) {
    return (error as { status: number }).status === 401;
  }
  if (error instanceof Error) {
    return error.message.includes("401") || error.message.toLowerCase().includes("unauthorized");
  }
  return false;
}
