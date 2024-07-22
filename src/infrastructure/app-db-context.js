import { Plan } from "../entities/index.js";
import { EntitySet, DbContext } from "../sal/index.js";

class ApplicationDbContext extends DbContext {
  constructor() {
    super();
  }

  Plans = new EntitySet(Plan);
}

export const appContext = new ApplicationDbContext();
