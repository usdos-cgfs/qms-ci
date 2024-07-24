import { Result } from "../sal/shared/index.js";

export async function editAction(action) {
  console.log("editing action:", action);
  return Result.Success(action);
}
