import { BusinessOffice, Plan } from "../entities/index.js";
import { EntitySet, DbContext } from "../sal/index.js";

class ApplicationDbContext extends DbContext {
  constructor() {
    super();
  }

  Plans = new EntitySet(Plan);
  BusinessOffices = new EntitySet(BusinessOffice);
}

export const appContext = new ApplicationDbContext();
