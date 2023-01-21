/*
 |--------------------------------------------------------------------------------
 | Setup
 |--------------------------------------------------------------------------------
 |
 | Bootstraps application dependent steps. The steps are in strict order and
 | changing it without understanding can results in unexpected application
 | failures.
 |
 */

export async function setup(): Promise<void> {
  await import("./modules");
}
