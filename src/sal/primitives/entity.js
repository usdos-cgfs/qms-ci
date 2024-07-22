export class Entity {
  constructor(params) {
    if (params?.ID) this.ID = params.ID;
    if (params?.Title) this.Title = params.Title;
  }

  ObservableID = ko.observable();
  ObservableTitle = ko.observable();

  get id() {
    return this.ObservableID();
  }

  set id(val) {
    this.ObservableID(val);
  }

  get Title() {
    return this.ObservableTitle();
  }

  set Title(val) {
    this.ObservableTitle(val);
  }
}
