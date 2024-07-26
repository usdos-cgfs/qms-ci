import {
  Action,
  BusinessOffice,
  Plan,
  RecordSource,
  RootCauseWhy,
  SupportingDocument,
} from "../entities/index.js";
import { EntitySet, DbContext } from "../sal/index.js";

class ApplicationDbContext extends DbContext {
  constructor() {
    super();
  }

  Actions = new EntitySet(Action);

  BusinessOffices = new EntitySet(BusinessOffice);

  Plans = new EntitySet(Plan);

  RecordSources = new EntitySet(RecordSource);

  RootCauseWhys = new EntitySet(RootCauseWhy);

  SupportingDocuments = new EntitySet(SupportingDocument);
}

export const appContext = new ApplicationDbContext();
