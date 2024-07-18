var user;
var spGroup;
var collListItem;
var businessOfficeAssignments = [];
var qoCurrentMembers = [];
var qoTempCurrentMembers = [];
var qoListMembers = [];

var usersToAdd = [];
var usersToRemove = [];

function initApp() {}

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
    collListItem = listRef.getItems(camlQuery);
    clientContext.load(collListItem);
    clientContext.executeQueryAsync(
      function () {
        var listItemEnumerator = collListItem.getEnumerator();
        var users = [];
        while (listItemEnumerator.moveNext()) {
          var oListItem = listItemEnumerator.get_current();
          //console.log(oListItem);
          $.each(keys, function (idx, loc) {
            // Iterate through each office
            var user = oListItem.get_item(loc);
            var userObj = {};
            if (user != null) {
              userObj.id = user.get_lookupId();
              userObj.title = user.get_lookupValue();
              userObj.oUser = user;
              users.push(userObj);
            }
          });
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
    collListItem = listRef.getItems(camlQuery);
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
  var accessGroupMembers = qoCurrentMembers
    .concat(qtmCurrentMembers)
    .filter(filterById);
  var businessOfficeAssignments = await FetchBusinessOfficeAssignments();
  var tempQOAssignments = await FetchTempQOAssignments();
  var listAssignments = businessOfficeAssignments
    .concat(tempQOAssignments)
    .filter(filterById);

  businessOfficeAssignments.concat;
  var usersToAdd = listAssignments.filter(
    (person) => !accessGroupMembers.find((member) => member.id === person.id)
  );
  var usersToRemove = accessGroupMembers.filter(
    (member) => !listAssignments.find((person) => person.id === member.id)
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
    spGroup = siteGroups.getByName("QOs");
    var userCollection = spGroup.get_users();
    console.log("adding " + userArr.length + " users");
    $.each(userArr, function (idx, user) {
      console.log("adding: ", user.title);
      userCollection.addUser(web.getUserById(user.id));
    });
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
    spGroup = siteGroups.getByName("QOs");
    var userCollection = spGroup.get_users();
    console.log("removing " + userArr.length + " users");
    $.each(userArr, function (idx, user) {
      console.log("adding: ", user.title);
      userCollection.remove(web.getUserById(user.id));
    });
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

$(document).ready(function () {
  SP.SOD.executeFunc(
    "sp.js",
    "SP.ClientContext",
    ExecuteOrDelayUntilScriptLoaded(initApp, "sp.js")
  );
});
