import { getGroupUsers } from "./sal.js";

export async function getUsersByGroupName(groupName) {
  const users = await getGroupUsers(groupName);

  if (!users) return [];

  return users.map((userProps) => new People(userProps));
}
