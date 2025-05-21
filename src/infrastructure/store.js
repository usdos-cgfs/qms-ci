import * as ko from "knockout";
export const businessOfficeStore = ko.observableArray();

export const activeBusinessOffices = ko.pureComputed(() => {
  return ko
    .unwrap(businessOfficeStore)
    .filter((office) => office.Active.Value());
});

export const sourcesStore = ko.observableArray();
