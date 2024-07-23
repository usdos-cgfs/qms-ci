import { People } from "../sal/entities/index.js";

import { getUserPropsAsync } from "../sal/infrastructure/index.js";

class User extends People {
  constructor({
    ID,
    Title,
    LoginName = null,
    LookupValue = null,
    WorkPhone = null,
    EMail = null,
    IsGroup = null,
    IsEnsured = false,
    Groups = null,
  }) {
    super({ ID, Title, LookupValue, LoginName, IsGroup, IsEnsured });

    this.WorkPhone = WorkPhone;
    this.EMail = EMail;

    this.Groups = Groups;
  }

  Groups = [];

  isInGroup(group) {
    if (!group?.ID) return false;
    return this.getGroupIds().includes(group.ID);
  }

  getGroupIds() {
    return this.Groups.map((group) => group.ID);
  }

  IsSiteOwner = ko.pureComputed(() =>
    this.isInGroup(getDefaultGroups().owners)
  );

  hasSystemRole = (systemRole) => {
    const userIsOwner = this.IsSiteOwner();
    switch (systemRole) {
      case systemRoles.Admin:
        return userIsOwner;
        break;
      case systemRoles.ActionOffice:
        return userIsOwner || this.ActionOffices().length;
      default:
    }
  };

  static _user = null;
  static Create = async function () {
    if (User._user) return User._user;
    // TODO: Major - Switch to getUserPropertiesAsync since that includes phone # etc
    const userProps = await getUserPropsAsync();
    // const userProps2 = await UserManager.getUserPropertiesAsync();
    User._user = new User(userProps);
    return User._user;
  };
}

export const currentUser = User.Create;
