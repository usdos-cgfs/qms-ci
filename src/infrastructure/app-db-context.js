import { BusinessOffice, Plan, RecordSource } from "../entities/index.js";
import { EntitySet, DbContext } from "../sal/index.js";

class ApplicationDbContext extends DbContext {
  constructor() {
    super();
  }

  Plans = new EntitySet(Plan);

  BusinessOffices = new EntitySet(BusinessOffice);

  RecordSources = new EntitySet(RecordSource);
}

export const appContext = new ApplicationDbContext();
