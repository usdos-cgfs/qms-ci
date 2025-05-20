import appTemplate from "./manage-qo.html";
import * as ko from "knockout";

function initApp() {
  const vm = new ViewModel();
  ko.applyBindings(vm);
  vm.clickSyncArrays();
}

function executeQuery(currCtx) {
  return new Promise((resolve, reject) =>
    currCtx.executeQueryAsync(resolve, (sender, args) => {
      reject({ sender, args });
    })
  );
}

async function viewGroup(groupName) {
  const ctx = new SP.ClientContext.get_current();
  const web = ctx.get_web();

  const oGroup = web.get_siteGroups().getByName(groupName);
  ctx.load(oGroup);

  await executeQuery(ctx);

  const groupId = oGroup.get_id();
  if (!groupId) return;

  const uri =
    window.context.pageContext.legacyPageContext.webAbsoluteUrl +
    "/_layouts/15/people.aspx?MembershipGroupId=" +
    groupId;

  window.open(uri, "_blank");
}

function FetchGroupMembers(groupName) {
  return new Promise((resolve, reject) => {
    var currentContext = new SP.ClientContext.get_current();
    var currentWeb = currentContext.get_web();

    var currentUser = currentContext.get_web().get_currentUser();
    currentContext.load(currentUser);

    var allGroups = currentWeb.get_siteGroups();
    currentContext.load(allGroups);

    var group = allGroups.getByName(groupName);
    currentContext.load(group);

    var groupUsers = group.get_users();
    currentContext.load(groupUsers);

    currentContext.executeQueryAsync(OnSuccess, OnFailure);

    function OnSuccess(sender, args) {
      var users = [];
      var groupUserEnumerator = groupUsers.getEnumerator();
      while (groupUserEnumerator.moveNext()) {
        var user = groupUserEnumerator.get_current();
        //console.log('User: ', groupUser.get_email())
        var userObj = {};
        if (user != null) {
          userObj.id = user.get_id();
          userObj.title = user.get_title();
          userObj.oUser = user;
          users.push(userObj);
        }
      }
      resolve(users);
    }

    function OnFailure(sender, args) {
      reject(args);
    }
  });
}

function filterById(user, index, array) {
  return (
    index ===
    array.findIndex((innerUser) => {
      return user.id == innerUser.id;
    })
  );
}

function FetchBusinessOfficeAssignments() {
  return new Promise((resolve, reject) => {
    var keys = [
      "QAO",
      "QSO_Charleston",
      "QSO_Bangkok",
      "QSO_Washington",
      "QSO_Paris",
      "QSO_Sofia",
      "QSO_Manila",
    ];
    var clientContext = new SP.ClientContext.get_current();
    var website = clientContext.get_web();
    var listRef = website.get_lists().getByTitle("Business_Office");

    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml("<Query></Query>");
    const collListItem = listRef.getItems(camlQuery);
    clientContext.load(collListItem);
    clientContext.executeQueryAsync(
      function () {
        var listItemEnumerator = collListItem.getEnumerator();
        var users = [];
        while (listItemEnumerator.moveNext()) {
          var oListItem = listItemEnumerator.get_current();
          //console.log(oListItem);
          for (const loc of keys) {
            // Iterate through each office
            var user = oListItem.get_item(loc);
            var userObj = {};
            if (user != null) {
              userObj.id = user.get_lookupId();
              userObj.title = user.get_lookupValue();
              userObj.oUser = user;
              users.push(userObj);
            }
          }
        }
        resolve(users.filter(filterById));
      },
      function (sender, args) {
        reject(args);
      }
    );
  });
}

function FetchTempQOAssignments() {
  return new Promise((resolve, reject) => {
    var clientContext = new SP.ClientContext.get_current();
    var website = clientContext.get_web();
    var listRef = website.get_lists().getByTitle("Temp_QOs");

    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml("<Query></Query>");
    const collListItem = listRef.getItems(camlQuery);
    clientContext.load(collListItem);
    clientContext.executeQueryAsync(
      function () {
        var listItemEnumerator = collListItem.getEnumerator();
        var users = [];
        while (listItemEnumerator.moveNext()) {
          var oListItem = listItemEnumerator.get_current();

          var user = oListItem.get_item("Person");
          var userObj = {};
          if (user != null) {
            userObj.id = user.get_lookupId();
            userObj.title = user.get_lookupValue();
            userObj.oUser = user;
            users.push(userObj);
          }
        }
        resolve(users.filter(filterById));
        //syncArrays();
      },
      function (sender, args) {
        reject(args);
      }
    );
  });
}

async function syncArrays() {
  var qoCurrentMembers = await FetchGroupMembers("QOs");
  var qtmCurrentMembers = await FetchGroupMembers("QTM");
  var currentMembers = qoCurrentMembers
    .concat(qtmCurrentMembers)
    .filter(filterById);
  var businessOfficeAssignments = await FetchBusinessOfficeAssignments();
  var tempQOAssignments = await FetchTempQOAssignments();
  var assignedUsers = businessOfficeAssignments
    .concat(tempQOAssignments)
    .filter(filterById);

  return { assignedUsers, currentMembers };

  var usersToAdd = assignedUsers.filter(
    (person) => !currentMembers.find((member) => member.id === person.id)
  );
  var usersToRemove = currentMembers.filter(
    (member) => !assignedUsers.find((person) => person.id === member.id)
  );

  if (confirm("Add the following users:\n" + formatUserList(usersToAdd))) {
    console.log("adding");
    await AddUserToSharePointGroup(usersToAdd);
  }

  if (
    confirm("Remove the following users:\n" + formatUserList(usersToRemove))
  ) {
    console.log("removing");
    await RemoveUserFromSharePointGroup(usersToRemove);
  }
}

function AddUserToSharePointGroup(userArr) {
  return new Promise((resolve, reject) => {
    var clientContext = new SP.ClientContext.get_current();
    var siteGroups = clientContext.get_web().get_siteGroups();
    var web = clientContext.get_web();
    const spGroup = siteGroups.getByName("QOs");
    var userCollection = spGroup.get_users();
    console.log("adding " + userArr.length + " users");
    for (const user of userArr) {
      console.log("adding: ", user.title);
      userCollection.addUser(web.getUserById(user.id));
    }
    spGroup.update();
    // clientContext.load(user);
    clientContext.load(spGroup);
    clientContext.executeQueryAsync(
      function () {
        alert("Successfully Added " + userArr.length + " Users");
        resolve();
      },
      function (sender, args) {
        reject(args);
      }
    );
  });
}

function RemoveUserFromSharePointGroup(userArr) {
  return new Promise((resolve, reject) => {
    var clientContext = new SP.ClientContext.get_current();
    var siteGroups = clientContext.get_web().get_siteGroups();
    var web = clientContext.get_web();
    const spGroup = siteGroups.getByName("QOs");
    var userCollection = spGroup.get_users();
    console.log("removing " + userArr.length + " users");
    for (const user of userArr) {
      console.log("adding: ", user.title);
      userCollection.remove(web.getUserById(user.id));
    }
    spGroup.update();
    // clientContext.load(user);
    clientContext.load(spGroup);
    clientContext.executeQueryAsync(
      function () {
        alert("Successfully Removed " + userArr.length + " Users");
        resolve();
      },
      function (sender, args) {
        reject(args);
      }
    );
  });
}

function formatUserList(userArr) {
  return userArr.map((user) => `- ${user.title}\n`).join("");
}

function onQueryFailed(sender, args) {
  console.error(sender, args);
}

class ViewModel {
  constructor() {
    this.checkAllToAdd.subscribe((newVal) =>
      this.onCheckAllChange(newVal, this.usersToAdd)
    );
    this.checkAllToRemove.subscribe((newVal) =>
      this.onCheckAllChange(newVal, this.usersToRemove)
    );
  }

  checkAllToAdd = ko.observable();
  checkAllToRemove = ko.observable();

  currentMembers = ko.observableArray();
  assignedUsers = ko.observableArray();

  usersToAdd = ko.pureComputed(() => {
    return ko
      .unwrap(this.assignedUsers)
      .filter(
        (person) =>
          !ko
            .unwrap(this.currentMembers)
            .find((member) => member.id === person.id)
      )
      .map((user) => {
        return { ...user, include: ko.observable(false) };
      });
  });

  usersToRemove = ko.pureComputed(() =>
    ko
      .unwrap(this.currentMembers)
      .filter(
        (member) =>
          !ko
            .unwrap(this.assignedUsers)
            .find((person) => person.id === member.id)
      )
      .map((user) => {
        return { ...user, include: ko.observable(false) };
      })
  );

  onCheckAllChange = (newVal, users) => {
    ko.unwrap(users).map((user) => user.include(newVal));
  };

  clickSyncArrays = async () => {
    const { assignedUsers, currentMembers } = await syncArrays();
    this.currentMembers(currentMembers);
    this.assignedUsers(assignedUsers);
  };

  clickManageQOs = () => viewGroup("QOs");

  clickSubmit = async () => {
    const usersToAdd = ko
      .unwrap(this.usersToAdd)
      .filter((person) => ko.unwrap(person.include));
    const usersToRemove = ko
      .unwrap(this.usersToRemove)
      .filter((person) => ko.unwrap(person.include));

    if (confirm("Add the following users:\n" + formatUserList(usersToAdd))) {
      console.log("adding");
      await AddUserToSharePointGroup(usersToAdd);
    }

    if (
      confirm("Remove the following users:\n" + formatUserList(usersToRemove))
    ) {
      console.log("removing");
      await RemoveUserFromSharePointGroup(usersToRemove);
    }

    this.clickSyncArrays();
  };
}

export async function load(element, context) {
  /*********NOTE: the Contribute permission level needs to have manage permissions turned on ************/
  window.context = context;

  element.innerHTML = appTemplate;

  initApp();
}
