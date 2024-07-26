import { SUPPORTINGDOCUMENTTYPES } from "../constants.js";
import {
  DateField,
  dateFieldTypes,
  PeopleField,
  SelectField,
  TextField,
} from "../sal/fields/index.js";
import { ConstrainedEntity } from "../sal/primitives/index.js";

export class SupportingDocument extends ConstrainedEntity {
  constructor(params) {
    super(params);
  }

  Record = new TextField({
    displayName: "Plan Number",
    isEditable: false,
  });

  Title = new TextField({
    displayName: "Name",
  });

  DocType = new SelectField({
    displayName: "Document Type",
    options: Object.values(SUPPORTINGDOCUMENTTYPES),
    isRequired: true,
  });

  FileName = new TextField({
    displayName: "Name",
    systemName: "FileLeafRef",
  });

  FileRef = new TextField({
    displayName: "File Link",
    systemName: "FileRef",
  });

  Modified = new DateField({
    displayName: "Modified",
    type: dateFieldTypes.datetime,
  });

  Editor = new PeopleField({
    displayName: "Modified By",
  });

  Created = new DateField({
    displayName: "Created",
    type: dateFieldTypes.datetime,
  });

  Author = new PeopleField({
    displayName: "Created By",
  });

  static Views = {
    All: [
      "ID",
      "Record",
      "Title",
      "DocType",
      "FileLeafRef",
      "FileRef",
      "Modified",
      "Editor",
      "Created",
      "Author",
    ],
  };

  static ListDef = {
    name: "SupportDocumentLibrary",
    title: "SupportDocumentLibrary",
    isLib: true,
  };
}
