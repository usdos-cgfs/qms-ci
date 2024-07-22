import { PeopleField, TextField } from "../sal/fields/index.js";
import { ConstrainedEntity } from "../sal/primitives/index.js";

export class BusinessOffice extends ConstrainedEntity {
  constructor(params) {
    super(params);
  }

  Title = new TextField({
    displayName: "Title",
  });

  QAO = new PeopleField({
    displayName: "Quality Area Ownew",
  });

  QSO_Charleston = new PeopleField({
    displayName: "QSO Charleston",
  });

  // QSO_ = new PeopleField({
  //     displayName: "QSO "
  // })

  static Views = {
    All: [
      "ID",
      "Title",
      "QAO",
      "QSO_Charleston",
      "QSO_Bangkok",
      "QSO_Washington",
      "QSO_Paris",
      "QSO_Sofia",
      "QSO_Manila",
    ],
  };

  static ListDef = {
    name: "Business_Office",
    title: "Business_Office",
  };
}
