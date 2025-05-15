import * as ko from "knockout";
import { DateModule, dateFieldTypes } from "../components/fields/index.js";
import { BaseField } from "./BaseField.js";

// Re-export datefield types instead of allowing anything to reference the graphical component
export { dateFieldTypes } from "../components/fields/index.js";

/**
 * This field needs to convert between locale and UTC Dates stored on the server;
 */

export class DateField extends BaseField {
  constructor(params) {
    super(params);
    this.type = params.type ?? dateFieldTypes.date;
  }

  toString = ko.pureComputed(() => {
    // if this is datetime vs date we expect different things
    switch (this.type) {
      case dateFieldTypes.date:
        return this.toLocaleDateString();
      case dateFieldTypes.datetime:
        return this.toLocaleString();
      default:
        return "";
    }
  });

  toSortableDateString = () => this.Value()?.format("yyyy-MM-dd");
  toLocaleDateString = () => this.Value()?.toLocaleDateString();
  toLocaleString = () => this.Value()?.toLocaleString();

  get = ko.pureComputed(() => {
    if (!this.Value() || isNaN(this.Value().valueOf())) {
      return null;
    }

    return this.Value().toISOString();
  });

  set = (newDate) => {
    if (!newDate) return null;
    if (newDate.constructor.getName() != "Date") {
      // console.warn("Attempting to set date", newDate);
      newDate = new Date(newDate);
    }
    if (newDate.getTimezoneOffset()) {
    }
    this.Value(newDate);
  };

  components = DateModule;
}
