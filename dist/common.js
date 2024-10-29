// Common Functions and Objects
var Common = Common || {};

Common.Init = function () {
  Common.Utilities = new NewUtilities();
};

function NewUtilities() {
  function truncateText(str, len) {
    if (!str) {
      return "";
    }
    if (str.length < len) {
      return str;
    }
    return str.substring(0, len) + "...";
  }

  function incrementDateDays(startDate, days) {
    var newNextDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate() + days
    );
    return newNextDate;
  }

  function observableObjectFromListDef(listDef) {
    // Initialize our observable with isLoaded flag,
    // This will be useful when we are going through and
    // setting the value pairs.
    var obj = {
      isLoaded: ko.observable(false),
    };
    Object.keys(listDef.viewFields).forEach(function (key) {
      var fieldInfo = listDef.viewFields[key];
      switch (fieldInfo.type) {
        case "Person":
          obj[key] = new PeopleField();
          break;
        case "Date":
          obj[key] = new DateField({ type: "date" });
          break;
        case "DateTime":
          obj[key] = new DateField({ minTimeGap: 15 });
          break;
        default:
          obj[key] = ko.observable();
      }
    });
    return obj;
  }

  function validateValuePairs(listDef) {}
  function getValuePairs(listDef) {
    //Get value pairs and validate
    console.log(listDef);
    var valuePairs = [];

    var vmObj = vm[listDef.viewModelObj];
    if (!vmObj) {
      return valuePairs;
    }

    Object.keys(listDef.viewFields).forEach(function (key) {
      var fieldInfo = listDef.viewFields[key];
      var observable = vmObj[key];

      var fieldValue = null;

      switch (fieldInfo.type) {
        case "Date":
        case "DateTime":
          if (observable.date && !isNaN(observable.date())) {
            fieldValue = observable.date().toISOString();
          } else if (typeof observable === "function" && observable()) {
            fieldValue = observable().toISOString();
          }
          break;
        case "Person":
          fieldValue = observable.ensuredPeople();
          break;
        case "Group":
          if (observable()) {
            fieldValue = observable().ID;
          }
          break;
        default:
          fieldValue = observable();
      }
    });
    return valuePairs;
  }

  function setValuePairs(listDef, targetObject, jObject) {
    // The inverse of our getValuePairs function, set the KO observables
    // from our returned object.
    // Assuming we have created a viewModelObj using the observableObjectFromListDef
    // method above and reference it in the list def.
    var vmObj = targetObject;

    if (!vmObj) {
      console.error("Could not find ViewModel Object");
      return;
    }
    vmObj.isLoaded(false);
    Object.keys(listDef.viewFields).forEach(function (key) {
      var fieldInfo = listDef.viewFields[key];
      //console.log(field + " " + obj.koMap + " " );
      //console.log("Setting " + key + " to " + jObject[key] + " from " + key);
      var observable = vmObj[key];
      var value = jObject[key];
      switch (fieldInfo.type) {
        case "Person":
          observable.removeAllPeople();
          if (!value) {
            break;
          }
          if (value.constructor.getName() == "Array") {
            value.forEach(function (user) {
              observable.addPeople(user);
            });
            break;
          }

          observable.addPeople(value);
          break;
        case "Date":
        case "DateTime":
          if (!value) {
            value = new Date(0);
          }
          if (observable.date) {
            observable.date(value);
          } else {
            observable(value);
          }
          break;
        default:
          observable(value);
      }
    });
    vmObj.isLoaded(true);
  }

  function updateUrlParam(param, newval) {
    var search = window.location.search;
    //var urlParams = new URLSearchParams(queryString);

    var regex = new RegExp("([?;&])" + param + "[^&;]*[;&]?");
    var query = search.replace(regex, "$1").replace(/&$/, "");

    urlParams =
      (query.length > 2 ? query + "&" : "?") +
      (newval ? param + "=" + newval : "");

    window.history.pushState({}, "", urlParams.toString());
  }

  function getUrlParam(param) {
    var results = new RegExp("[?&]" + param + "=([^&#]*)").exec(
      window.location.href
    );
    if (results == null) {
      return null;
    } else {
      return decodeURI(results[1]) || 0;
    }
  }

  var publicMembers = {
    validateValuePairs: validateValuePairs,
    getValuePairs: getValuePairs,
    setValuePairs: setValuePairs,
    observableObjectFromListDef: observableObjectFromListDef,
    updateUrlParam: updateUrlParam,
    getUrlParam: getUrlParam,
    truncateText: truncateText,
    incrementDateDays: incrementDateDays,
  };

  return publicMembers;
}

function Incremental(entry, target, next) {
  var entry = entry === undefined ? 0 : entry;
  var target = target === undefined ? null : target;
  var next = next === undefined ? null : next;

  var self = this;
  this.val = ko.observable(entry);
  this.inc = function (increment) {
    var incrementAmt = increment === undefined ? 1 : increment;
    self.val(self.val() + incrementAmt);
  };
  this.dec = function (decrement) {
    var decrementAmt = decrement === undefined ? 1 : decrement;
    self.val(self.val() - decrementAmt);
  };
  this.val.subscribe(function (val) {
    if (target != null && val == target) {
      typeof self.callback == "function"
        ? self.callback()
        : console.log("target reached: ", val);
    }
  });
  this.callback = next;
  this.set = function (val) {
    self.val(val);
  };
  this.incTarget = function () {
    const newVal = self.val() + 1;
    self.val();
  };
  this.reset = function () {
    self.val(entry);
  };
}

/**
 * Represents a client side people picker. Holds an array of ensured objects.
 */
function PeopleField(schemaOpts) {
  var self = this;
  self.schemaOpts = schemaOpts || {};

  // This should only include SP.User and SP.Group objects
  self.ensuredPeople = ko.observableArray();

  self.getValueForWrite = function () {
    return self
      .ensuredPeople()
      .map(function (ensured) {
        return ensured.get_id() + ";#" + ensured.get_loginName() + ";#";
      })
      .join("");
  };

  self.getValueForHuman = function () {
    return self
      .ensuredPeople()
      .map(function (ensured) {
        return ensured.get_title();
      })
      .join(", ");
  };

  self.addPeople = function (value) {
    //Todo: should a null value empty?
    if (!value) return;
    switch (value.constructor.getName()) {
      case "SP.FieldUserValue":
        //First check if we can find and add the group by id.
        if (self.addGroupById(value.get_lookupId())) break;
        //Then attempt to ensure the user.
        sal.utilities.ensureUserById(value.get_lookupId(), function (user) {
          if (user.get_id && !self.containsPeopleById(user.get_id())) {
            self.ensuredPeople.push(user);
          }
        });
        break;
      case "SP.User":
      case "SP.Group":
        var people = value;
        if (people.get_id && !self.containsPeopleById(people.get_id())) {
          self.ensuredPeople.push(people);
        }
        break;
    }
  };

  self.addGroupById = function (id) {
    if (!id) return false;
    //Check if the group already exists
    if (self.containsPeopleById(id)) return true;

    //Check for group
    var foundGroup = sal.globalConfig.siteGroups.find(function (group) {
      return group.ID == id;
    });

    if (foundGroup) {
      self.ensuredPeople.push(foundGroup.group);
      return true;
    }
    return false;
    console.warn("Could not find group with id: ", id);
  };

  self.removePeopleById = function (id) {
    var filteredPeople = self.ensuredPeople().filter(function (ensured) {
      return ensured.get_id() != id;
    });
    self.ensuredPeople(filteredPeople);
  };

  self.removePeopleByLogin = function (userName) {
    var filteredPeople = self.ensuredPeople().filter(function (ensured) {
      return ensured.get_loginName() != userName;
    });
    self.ensuredPeople(filteredPeople);
  };

  self.removeAllPeople = function () {
    self.ensuredPeople([]);
  };

  self.containsPeopleById = function (id) {
    if (!id) return;
    return self.ensuredPeople().find(function (ensured) {
      return ensured.get_id && ensured.get_id() == id;
    });
  };

  self.containsPeopleByLogin = function (userName) {
    if (!userName) return null;
    return self.ensuredPeople().find(function (ensured) {
      return ensured.get_loginName && ensured.get_loginName() == userName;
    });
  };
}

ko.bindingHandlers.people = {
  init: function (element, valueAccessor, allBindingsAccessor) {
    var obs = valueAccessor();
    var schema = {};
    schema["PrincipalAccountType"] = "User,SPGroup";
    schema["SearchPrincipalSource"] = 15;
    schema["ShowUserPresence"] = true;
    schema["ResolvePrincipalSource"] = 15;
    schema["AllowEmailAddresses"] = true;
    schema["AllowMultipleValues"] = false;
    schema["MaximumEntitySuggestions"] = 50;
    schema["Width"] = "280px";
    schema["OnUserResolvedClientScript"] = function (elemId, userKeys) {
      //  get reference of People Picker Control
      var pickerElement = SPClientPeoplePicker.SPClientPeoplePickerDict[elemId];
      var addUserOrGroup = valueAccessor().addPeople;
      var userJSObjects = pickerElement.GetAllUserInfo();
      if (userJSObjects.length) {
        // Remove anyone that's no longer in our group
        valueAccessor()
          .ensuredPeople()
          .map(function (ensured) {
            if (
              !userJSObjects.find(function (user) {
                return user.Key == ensured.get_loginName();
              })
            ) {
              // We couldn't find this user any more pop them
              valueAccessor().removePeopleById(ensured.get_id());
            }
          });

        userJSObjects.forEach(function (user) {
          if (valueAccessor().containsPeopleByLogin(user.Key)) return;
          if (user.EntityType == "User") {
            sal.utilities.ensureUserByLogin(user.Key, addUserOrGroup);
            return;
          }
          //Check for SP Group
          if (user.EntityData.PrincipalType && user.EntityData.SPGroupID) {
            valueAccessor().addGroupById(user.EntityData.SPGroupID);
            return;
          }
        });
      } else {
        //Need to clear the array
        valueAccessor().removeAllPeople();
      }
      //observable(pickerElement.GetControlValueAsJSObject()[0]);
      //console.log(JSON.stringify(pickerElement.GetControlValueAsJSObject()[0]));
    };

    //  TODO: You can provide schema settings as options
    var mergedOptions = Object.assign(schema, obs.schemaOpts);

    //  Initialize the Control, MS enforces to pass the Element ID hence we need to provide
    //  ID to our element, no other options
    this.SPClientPeoplePicker_InitStandaloneControlWrapper(
      element.id,
      null,
      mergedOptions
    );
  },
  update: function (
    element,
    valueAccessor,
    allBindings,
    viewModel,
    bindingContext
  ) {
    //debugger;
    //  Force to Ensure User
    var ensuredPeople = ko.utils.unwrapObservable(
      valueAccessor().ensuredPeople
    );

    var pickerElement =
      SPClientPeoplePicker.SPClientPeoplePickerDict[element.id + "_TopSpan"];
    var editId = "#" + pickerElement.EditorElementId;

    var userJSObjects = pickerElement.GetAllUserInfo();

    if (ensuredPeople.length) {
      ensuredPeople.forEach(function (ensured) {
        // If we already have this user resolved, skip
        if (
          userJSObjects.find(function (resolvedUser) {
            return resolvedUser.Key == ensured.get_loginName();
          })
        )
          return;

        // If we don't already have the user, add them.
        jQuery(editId).val(ensured.get_loginName());

        // Resolve the User
        pickerElement.AddUnresolvedUserFromEditor(true);
      });
    }
  },
};

function DateField(newOpts, newDate) {
  newOpts =
    newOpts === undefined
      ? {
          type: "date",
        }
      : newOpts;
  newDate = newDate === undefined ? new Date(0) : newDate;

  var self = this;
  this.opts = newOpts; // These are the options sent to the datepicker
  this.format = "yyyy-MM-dd"; // This is how this will be

  self.isDate = ko.pureComputed(function () {
    return typeof self.date().getMonth === "function";
  });

  this.date = ko.observable(newDate);
  this.dateFormat = ko.pureComputed({
    read: function () {
      if (self.date().getTime()) {
        const date = self.date(); // Date in local time

        // Extract UTC components
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-based
        const day = String(date.getUTCDate()).padStart(2, "0");

        // Format the date as yyyy-MM-dd
        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate;
      }
      return "";
    },
    write: function (val) {
      self.date(new Date(val));
    },
  });
  this.setDate = function (val) {
    self.date(new Date(val));
  };
}

ko.bindingHandlers.dateField = {
  init: function (element, valueAccessor, allBindingsAccessor) {
    var dateFieldObj = valueAccessor();
    dateFieldObj.opts.selectAdjacentDays = true;

    try {
      $(element).closest(".ui.calendar").calendar(dateFieldObj.opts);
      $(element)
        .closest(".ui.calendar")
        .focusout(function (event) {
          console.log(this);
          date = new Date($(element).val());
          var value = valueAccessor().date;
          value(date);
        });
    } catch (e) {
      console.warn("error", e);
    }
  },
  update: function (
    element,
    valueAccessor,
    allBindings,
    viewModel,
    bindingContext
  ) {
    var value = valueAccessor().date;
    var valueUnwrapped = ko.unwrap(value);
    var formattedDate = new Date(valueUnwrapped); //.format("yyy-MM-ddThh:mm"); //.format("yyyy-MM-dd");
    $(element).val(valueUnwrapped);
  },
};

function JqueryDateTimeField(newDate) {
  var newDate = newDate === undefined ? "" : newDate;

  var self = this;

  self.datetime = ko.observable(newDate);

  self.isDate = ko.pureComputed(function () {
    return typeof self.datetime().getMonth === "function";
  });

  self.formatted = ko.pureComputed(function () {
    return self.isDate() ? self.datetime().format("yyyy-MM-dd") : "";
  });

  // Hold the date/year portion of our template
  self.date = ko.pureComputed({
    write: function (newDate) {
      var parsedDate = new Date(newDate);
      if (!newDate) {
        // User cleared the date field
        self.datetime("");
      } else if (!isNaN(parsedDate.getTime())) {
        if (typeof self.datetime().getMonth === "function") {
          var day = parsedDate.getDate();
          var month = parsedDate.getMonth();
          var year = parsedDate.getFullYear();
          self.datetime().setDate(day);
          self.datetime().setMonth(month);
          self.datetime().setYear(year);
        } else {
          //new Date, initialize
          self.datetime(parsedDate);
        }
      }
    },
    read: function () {
      if (typeof self.datetime().getMonth === "function") {
        return self.datetime().format("MM/dd/yyyy");
      } else {
        return "";
      }
    },
  });
  // Hold the hour of our template
  self.HH = ko.pureComputed({
    write: function (newHH) {
      if (typeof self.datetime().getMonth === "function") {
        self.datetime().setHours(newHH);
      }
    },
    read: function () {
      if (self.isDate()) {
        return self.datetime().getHours();
      }
    },
  });
  // Hold the minutes of our template
  self.mm = ko.pureComputed({
    write: function (newMm) {
      if (typeof self.datetime().getMonth === "function") {
        self.datetime().setMinutes(newMm);
      }
    },
    read: function () {
      if (self.isDate()) {
        return self.datetime().getMinutes();
      }
    },
  });
}

ko.bindingHandlers.jqueryDateField = {
  init: function (element, valueAccessor, allBindingsAccessor) {
    var dateFieldObj = valueAccessor();

    try {
      $(element).datepicker();
      $(element).change(function (event) {
        var value = valueAccessor();
        var fieldValue = $(element).val();
        var newDate = new Date(fieldValue ? fieldValue : 0);
        value.date(newDate);
      });
    } catch (e) {
      console.warn("error", e);
    }
  },
  update: function (
    element,
    valueAccessor,
    allBindings,
    viewModel,
    bindingContext
  ) {
    var value = valueAccessor();
    var valueUnwrapped = ko.unwrap(value.date);
    if (!value.isDate()) {
      $(element).val(null);
      return;
    }

    if (!valueUnwrapped.getTime()) {
      $(element).val(null);
      return;
    }

    $(element).val(valueUnwrapped.format("MM/dd/yyyy"));
    // var formattedDate = new Date(valueUnwrapped).format("MM/dd/yyyy"); //.format("yyyy-MM-dd");
  },
};

/* MODIFICATION SCRIPT
  All Scripts needed to effect change done here
*/

function Remediation() {
  function refactorAllRecordProcessStages() {
    vm.allRecordsArray().forEach(refactorProcessStage);
  }

  function refactorAcceptedRecordsProcessStage() {
    var acceptedRecords = vm.allRecordsArray().filter((record) => {
      return record.ProcessStage == "Accepted";
    });

    acceptedRecords.forEach((record) => {
      app.listRefs.Plans.updateListItem(
        record.ID,
        [["ProcessStage", "ClosedAccepted"]],
        () => {}
      );
    });
  }

  function refactorProcessStage(record) {
    // 1. Get the new corresponding key that matches the
    //    current records process stage.
    var key = record.ProcessStage;
    if (!stageDescriptions[key]) {
      console.warn(record.ProcessStage, record);
      return;
    }
    if (key) {
      app.listRefs.Plans.updateListItem(
        record.ID,
        [["ProcessStage", stageDescriptions[key].stage]],
        () => {}
      );
    }
  }

  function updateCloseDate(plans) {
    // For some reason we never had a close date?
    // Iterate all records, use qtm effectiveness date
    plans.forEach(function (plan) {
      if (plan.QTMEffectivenessAdjudicationDate) {
        console.log(
          `Updating: ${
            plan.Title
          } - ${plan.QTMEffectivenessAdjudicationDate.toDateString()}`
        );
        var vp = [["CloseDate", plan.QTMEffectivenessAdjudicationDate]];
        app.listRefs.Plans.updateListItem(plan.ID, vp, function (msg) {
          console.log(`Succesfully Updated: ${plan.Title} - ${msg}`);
        });
      }
    });
  }

  const publicMembers = {
    updateCloseDate,
  };

  return publicMembers;
}
function remediate() {
  let rem = new Remediation();
  rem.updateCloseDate(vm.allOpenRecords());
}

function getProcessStageKey(stageTitle) {
  return Object.keys(stageDescriptions).find(function (key) {
    if (stageDescriptions[key].stage == stageTitle) {
      return true;
    }
    return false;
  });
}
