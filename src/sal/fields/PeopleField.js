import { sortByTitle } from "../infrastructure/index.js";
import { PeopleModule } from "../components/fields/PeopleModule.js";
import { People } from "../entities/People.js";
import { getUsersByGroupName } from "../infrastructure/index.js";
import { ensureUserByKeyAsync } from "../infrastructure/sal.js";
import { BaseField } from "./index.js";

const components = {
  view: "people-view",
  edit: "people-edit",
  new: "people-edit",
};

export class PeopleField extends BaseField {
  constructor(params) {
    super(params);
    // this.pickerOptions = params.pickerOptions ?? {};
    this.spGroupName = params.spGroupName ?? null;
    this.multiple = params.multiple ?? false;
    // this.pickerOptions = params.pickerOptions ?? {};

    this.Value = this.multiple ? ko.observableArray() : ko.observable();

    if (ko.isObservable(this.spGroupName)) {
      this.spGroupName.subscribe(this.spGroupNameChangedHandler);
    }
    if (ko.unwrap(this.spGroupName)) {
      this.spGroupNameChangedHandler(ko.unwrap(this.spGroupName));
    }
  }

  spGroupId = ko.observable();
  userOpts = ko.observableArray();
  expandUsers = ko.observable(false);

  spGroupNameChangedHandler = async (groupName) => {
    if (!groupName) {
      this.userOpts.removeAll();
      this.spGroupId(null);
    }

    const group = await ensureUserByKeyAsync(groupName);
    this.spGroupId(group.ID);
    const users = await getUsersByGroupName(groupName);
    this.userOpts(users.sort(sortByTitle));
  };

  pickerOptions = ko.pureComputed(() => {
    const groupId = ko.unwrap(this.spGroupId);

    const opts = {
      AllowMultipleValues: this.multiple,
    };

    if (groupId) opts.SharePointGroupID = groupId;

    return opts;
  });

  toString = ko.pureComputed(() => {
    if (!this.multiple) return this.Value()?.Title;

    return this.Value()?.map((user) => user.Title);
  });

  set = (val) => {
    if (!this.multiple) {
      this.Value(People.Create(val));
      return;
    }

    if (!val) {
      this.Value.removeAll();
      return;
    }

    const vals = val.results ?? val;

    if (!vals.length) {
      this.Value.removeAll();
      return;
    }
    this.Value(vals.map((u) => People.Create(u)));
  };

  components = PeopleModule;
}
