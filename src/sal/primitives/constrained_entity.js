import { Entity } from "./index.js";
import { BaseField } from "../fields/index.js";

/**
 * Constrained Entity's are validated based on their declared fields.
 * We are expecting user input, so need to validate each input field.
 */

export class ConstrainedEntity extends Entity {
  constructor(params) {
    super(params);
  }

  toJSON = () => {
    const out = {};
    Object.keys(this.FieldMap).map(
      (key) => (out[key] = this.FieldMap[key]?.get())
    );
    return out;
  };

  fromJSON(inputObj) {
    if (window.DEBUG)
      console.log("Setting constrained entity from JSON", inputObj);
    Object.keys(inputObj).map((key) => this.FieldMap[key]?.set(inputObj[key]));
  }

  get FieldMap() {
    const fieldMap = {};
    Object.entries(this)
      .filter(([key, val]) => val instanceof BaseField)
      .map(([key, val]) => {
        key = val.systemName ?? key;
        fieldMap[key] = val;
      });
    return fieldMap;
  }

  FormFields = () => Object.values(this.FieldMap);

  // Validate the entire entity
  validate = (showErrors = true) => {
    Object.values(this.FieldMap).map(
      (field) => field?.validate && field.validate(showErrors)
    );
    return this.Errors();
  };

  Errors = ko.pureComputed(() => {
    return Object.values(this.FieldMap)
      .filter((field) => field?.Errors && field.Errors())
      .flatMap((field) => field.Errors());
  });

  IsValid = ko.pureComputed(() => !this.Errors().length);

  /**
   * Expose methods to generate default new, edit, and view forms
   * for a constrained entity. Uses the constrained
   * entity components.
   *
   * This could be broken into a separate service, but since it's
   * tightly coupled leave it here?
   */
  // static components = {
  //   new: (entity, view = null) =>
  //     new ConstrainedEntityComponent({
  //       entityView: new ConstrainedEntityView({ entity, view }),
  //       displayMode: "edit",
  //     }),
  //   edit: (entity, view = null) =>
  //     new ConstrainedEntityComponent({
  //       entityView: new ConstrainedEntityView({ entity, view }),
  //       displayMode: "edit",
  //     }),
  //   view: (entity, view = null) =>
  //     new ConstrainedEntityComponent({
  //       entityView: new ConstrainedEntityView({ entity, view }),
  //       displayMode: "view",
  //     }),
  // };
}
