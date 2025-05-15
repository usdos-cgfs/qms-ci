import * as ko from "knockout";
import {
  SearchSelectModule,
  SelectModule,
} from "../components/fields/index.js";
import { BaseField } from "./BaseField.js";

export class SelectField extends BaseField {
  constructor({
    displayName,
    isRequired = false,
    Visible,
    options = [],
    optionsFilter = (val) => val,
    multiple = false,
    optionsText,
    instructions,
  }) {
    super({ Visible, displayName, isRequired, instructions });
    this.allOpts = options;
    this.optionsFilter = optionsFilter;
    this.multiple = multiple;
    this.Value = multiple ? ko.observableArray() : ko.observable();
    this.optionsText = optionsText;

    this.components = this.multiple ? SearchSelectModule : SelectModule;
  }

  toString = ko.pureComputed(() =>
    this.multiple ? this.Value().join(", ") : this.Value()
  );

  get = () => this.Value();

  set = (val) => {
    if (val && this.multiple) {
      if (Array.isArray(val)) {
        this.Value(val);
      } else {
        this.Value(val.results ?? val.split(";#"));
      }
      return;
    }
    this.Value(val);
  };

  allOpts = [];
  optionsFilter = (val) => val;

  Options = ko.pureComputed(() => {
    const optsFilter = ko.unwrap(this.optionsFilter);
    const allOpts = ko.unwrap(this.allOpts);
    return allOpts.filter(optsFilter);
  });
}
