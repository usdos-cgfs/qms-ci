import { PeopleField, TextField } from "../sal/fields/index.js";
import { ConstrainedEntity } from "../sal/primitives/index.js";
import { LOCATION } from "./plan.js";

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

  QSO_Bangkok = new PeopleField({
    displayName: "QSO Bangkok",
  });

  QSO_Washington = new PeopleField({
    displayName: "QSO Washington",
  });

  QSO_Paris = new PeopleField({
    displayName: "QSO Paris",
  });

  QSO_Sofia = new PeopleField({
    displayName: "QSO Sofia",
  });

  QSO_Manilla = new PeopleField({
    displayName: "QSO Manilla",
  });

  getQSOByLocation(location) {
    switch (location) {
      case LOCATION.CHARLESTON:
        return this.QSO_Charleston;
      case LOCATION.BANGKOK:
        return this.QSO_Bangkok;
      case LOCATION.WASHINGTON:
        return this.QSO_Washington;
      case LOCATION.PARIS:
        return this.QSO_Paris;
      case LOCATION.SOFIA:
        return this.QSO_Sofia;
      case LOCATION.MANILA:
        return this.QSO_Manilla;
    }
  }

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
