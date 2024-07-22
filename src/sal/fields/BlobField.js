import { BaseField } from "./index.js";
import { BlobModule } from "../components/fields/index.js";

export class BlobField extends BaseField {
  constructor(params) {
    super(params);
    this.entityType = params.entityType;
    this.multiple = params.multiple;

    if (this.multiple) {
      this.Value = ko.observableArray();
    }

    if (ko.isObservable(this.entityType)) {
      this.entityType.subscribe(this.updateEntityTypeHandler);
      // this.Value.subscribe(this.updateEntityTypeHandler);
    }
    this.updateEntityTypeHandler(ko.unwrap(this.entityType));
  }

  toString = ko.pureComputed(() => `${this.Value()?.length ?? "0"} items`);

  toJSON = ko.pureComputed(() => {
    if (!this.multiple) return this.Value()?.toJSON();
    return this.Value().map((value) => value.toJSON());
  });

  fromJSON = (input) => {
    if (!input) return;
    if (!this.multiple) {
      this.Value()?.fromJSON(input);
      return;
    }
    this.Value.removeAll();
    input.map((obj) => {
      const newEntity = new this.entityConstructor();
      newEntity.fromJSON(obj);
      this.Value.push(newEntity);
    });
  };

  // TypedValues = ko.observableArray();
  // TypedValue = ko.observable();

  // Value = ko.pureComputed(() =>
  //   this.multiple ? this.TypedValues() : this.TypedValue()
  // );

  get = () => {
    return JSON.stringify(this.toJSON());
  };

  blob;
  set = (val) => {
    if (window.DEBUG) console.log(val);
    this.blob = val;
    if (val?.constructor == BlobField) {
      // this.fromJSON(val.toJSON());
      return;
    }
    this.fromJSON(JSON.parse(val));
  };

  get entityConstructor() {
    return ko.utils.unwrapObservable(this.entityType);
  }

  // use purecomputed for memoization, fields shouldn't change
  Cols = ko.pureComputed(() => {
    const entityType = ko.unwrap(this.entityType);
    if (!entityType) return [];

    const newEntity = new this.entityConstructor();

    return newEntity.FormFields();
  });

  // ColKeys = ko.pureComputed(() =>
  //   new this.entityConstructor()?.FormFieldKeys()
  // );

  // Support multiple items
  NewItem = ko.observable();

  submit = () => {
    const errors = this.NewItem()?.validate();
    if (errors.length) return;

    this.Value.push(this.NewItem());

    this.NewItem(new this.entityConstructor());
  };

  add = (item) => this.Value.push(item);
  remove = (item) => this.Value.remove(item);

  updateEntityTypeHandler = (newType) => {
    if (!newType) return;

    if (!this.multiple) {
      this.Value(new this.entityConstructor());
    } else {
      this.NewItem(new this.entityConstructor());
    }
    if (this.blob) this.fromJSON(JSON.parse(this.blob));

    // this.applyValueToTypedValues();
  };

  applyValueToTypedValues = () => {
    // if (!this.Value() || !this.TypedValue()) return;
    // if (!this.multiple) {
    //   mapObjectToEntity(this.Value(), this.TypedValue());
    //   return;
    // }
    // const typedItems = this.Value()?.map((item) => {
    //   const newEntity = new this.entityConstructor();
    //   mapObjectToEntity(item, newEntity);
    //   return newEntity;
    // });
    // this.TypedValues(typedItems);
  };

  // Errors = ko.pureComputed(() => {
  //   if (!this.Visible()) return [];
  //   // const isRequired = ko.unwrap(this.isRequired);
  //   const isRequired =
  //     typeof this.isRequired == "function"
  //       ? this.isRequired()
  //       : this.isRequired;
  //   if (!isRequired) return [];
  //   const currentValue = this.multiple ? this.TypedValues() : this.TypedValue();
  //   return currentValue
  //     ? []
  //     : [
  //         new ValidationError(
  //           "text-field",
  //           "required-field",
  //           (typeof this.displayName == "function"
  //             ? this.displayName()
  //             : this.displayName) + ` is required!`
  //         ),
  //       ];
  // });

  components = BlobModule;
}
