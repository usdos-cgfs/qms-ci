import * as ko from "knockout";
import {
  html,
  BaseFieldModule,
  registerFieldComponents,
} from "../BaseFieldModule.js";

import viewTemplate from "./PeopleView.html";
import editTemplate from "./PeopleEdit.html";
import { ensureUserByKeyAsync } from "../../../infrastructure/sal.js";

import { People } from "../../../entities/index.js";

export class PeopleModule extends BaseFieldModule {
  constructor(params) {
    super(params);

    this.searchTerm.subscribe(this.onSearch);
  }

  ValueFunc = ko.pureComputed({
    read: () => {
      if (!this.Value()) return;
      const userOpts = ko.unwrap(this.userOpts);
      return userOpts.find((opt) => opt.ID == this.Value().ID);
    },
    write: (opt) => {
      const userOpts = ko.unwrap(this.userOpts);
      if (!userOpts) return;
      this.Value(opt);
    },
  });

  ShowUserSelect = ko.pureComputed(() => {
    // We don't care to unwrap this, since we want to know if it's set or an observable.
    const groupName = this.spGroupName;
    if (!groupName) return false;
    const options = ko.unwrap(this.userOpts);
    return options.length;
  });

  focused = ko.observable();

  focusin = () => this.focused(true);
  focusout = () => this.focused(false);

  keydown = (self, e) => {
    switch (e.code) {
      case "Escape":
        // tab
        this.focusout();
        break;
      case "ArrowDown":
        // down arrow
        this.updateActiveFilteredItem(1);
        break;
      case "ArrowUp":
        // up arrow
        this.updateActiveFilteredItem(-1);
        break;
      case "Enter":
        // Enter
        this.selectActiveFilteredItem();
        break;
      default:
        // console.log(e.keyCode);
        return true;
    }
    return true;
  };

  updateActiveFilteredItem = (keyDirection) => {
    const opts = ko.unwrap(this.userOpts);

    if (!opts.length) return;

    // find the current active index
    const activeItemIndex = opts.findIndex((opt) => opt.active());

    let nextIndex =
      (activeItemIndex + keyDirection + opts.length) % opts.length;

    if (activeItemIndex >= 0) {
      opts[activeItemIndex]?.active(false);
    } else if (keyDirection <= 0) {
      nextIndex = opts.length - 1;
    }

    opts[nextIndex]?.active(true);
  };

  selectActiveFilteredItem = () => {
    const opts = ko.unwrap(this.userOpts);

    if (!opts.length) return;

    // find the current active index
    const activeItemIndex = opts.findIndex((opt) => opt.active());

    if (activeItemIndex >= 0) {
      opts[activeItemIndex]?.active(false);
    }

    this.selectUser(opts[activeItemIndex]);

    // now set the next item to true
    opts[(activeItemIndex + 1) % opts.length]?.active(true);
  };

  searchTerm = ko.observable();
  searchResults = ko.observableArray();

  stagedUsers = ko.observableArray();

  selectedUsers = ko.pureComputed(() => {
    const staged = ko.unwrap(this.stagedUsers);

    const value = ko.unwrap(this.Value);

    const valueArr = [];
    if (value) {
      if (ko.isObservableArray(this.Value)) {
        valueArr.push(...value);
      } else {
        valueArr.push(value);
      }
    }

    return [...staged, ...valueArr];
  });

  userOpts = ko.pureComputed(() => {
    const selectedPrincipals = this.selectedUsers().map(
      (user) => user.LoginName
    );
    return this.searchResults().filter(
      (result) =>
        !selectedPrincipals.includes(result.LoginName.toLocaleLowerCase())
    );
  });

  onSearch = async (searchTerm) => {
    if (!searchTerm) {
      this.searchResults.removeAll();
      return;
    }
    // Only search for terms that are 3 letters or longer
    if (searchTerm.length < 3) return;

    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const result = await window.context.aadHttpClientFactory
      .getClient("https://graph.microsoft.com")
      .then((client) => {
        // Search for the users with givenName, surname, or displayName equal to the searchFor value
        return client.get(
          `https://graph.microsoft.com/v1.0/users?` +
            `$select=givenName,surname,displayName,mail,userPrincipalName&` +
            `$filter=startsWith(givenName, '${encodedSearchTerm}') or ` +
            `startsWith(surname, '${encodedSearchTerm}') or ` +
            `startsWith(displayName, '${encodedSearchTerm}')`,
          client.constructor.configurations.v1
        );
      })
      .then((response) => {
        if (ko.unwrap(searchTerm) != searchTerm) return;
        return response.json();
      });

    if (ko.unwrap(searchTerm) != searchTerm) return;

    if (result?.value) {
      const mappedResults = result.value.map((user) => {
        return {
          ...new People({
            Title: user.displayName,
            LoginName:
              "i:0#.f|membership|" + user.userPrincipalName.toLocaleLowerCase(),
          }),
          active: ko.observable(),
        };
      });
      this.searchResults(mappedResults);
    }
  };

  selectUser = async (user) => {
    // 1. Stage
    if (user.active()) user.active(false);

    const stagedUser = {
      resolutionStatus: ko.observable("searching"),
      resolutionMessage: ko.observable(),
      ...user,
    };

    this.stagedUsers.push(stagedUser);

    // 2. Ensure
    const result = await ensureUserByKeyAsync(user.LoginName);

    if (!result) {
      stagedUser.resolutionStatus("fail");
      stagedUser.resolutionMessage("Could not ensure user!");
      return;
    }

    // 3. Store
    this.stagedUsers.remove(stagedUser);

    const people = new People(result);

    if (ko.isObservableArray(this.Value)) {
      this.Value.push(people);
    } else {
      this.Value(people);
    }
  };

  storePeople = (people) => {};

  removeUser = (user) => {
    if (this.stagedUsers.remove(user).length) return;

    if (ko.isObservableArray(this.Value)) {
      this.Value.remove(user);
      return;
    }

    if (this.Value() == user) {
      this.Value(null);
    }
  };

  static viewTemplate = viewTemplate;
  static editTemplate = editTemplate;

  static view = "people-view";
  static edit = "people-edit";
  static new = "people-edit";
}

registerFieldComponents(PeopleModule);
