import {
  Action,
  BusinessOffice,
  Notification,
  Plan,
  RecordSource,
  Rejection,
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

  Notifications = new EntitySet(Notification);

  Plans = new EntitySet(Plan);

  RecordSources = new EntitySet(RecordSource);

  Rejections = new EntitySet(Rejection);

  RootCauseWhys = new EntitySet(RootCauseWhy);

  SupportingDocuments = new EntitySet(SupportingDocument);
}

export const appContext = new ApplicationDbContext();
