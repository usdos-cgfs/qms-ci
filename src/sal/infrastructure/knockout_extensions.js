import { People } from "../entities/index.js";
import { ensureUserByKeyAsync } from "./index.js";
import { assetsPath } from "../../env.js";

ko.subscribable.fn.subscribeChanged = function (callback) {
  var oldValue;
  this.subscribe(
    function (_oldValue) {
      oldValue = _oldValue;
    },
    this,
    "beforeChange"
  );

  this.subscribe(function (newValue) {
    callback(newValue, oldValue);
  });
};

ko.observableArray.fn.subscribeAdded = function (callback) {
  this.subscribe(
    function (arrayChanges) {
      const addedValues = arrayChanges
        .filter((value) => value.status == "added")
        .map((value) => value.value);
      callback(addedValues);
    },
    this,
    "arrayChange"
  );
};

ko.bindingHandlers.searchSelect = {
  init: function (element, valueAccessor, allBindingsAccessor) {
    const { options, selectedOptions, optionsText, onSearchInput } =
      valueAccessor();

    function populateOpts() {
      const optionItems = ko.unwrap(options);

      const optionElements = optionItems.map((option) => {
        const optionElement = document.createElement("option");
        ko.selectExtensions.writeValue(optionElement, ko.unwrap(option));
        // optionElement.value = option;
        optionElement.innerText = optionsText(option);

        if (
          ko
            .unwrap(selectedOptions)
            ?.find((selectedOption) => selectedOption.ID == option.ID)
        ) {
          optionElement.setAttribute("selected", "");
        }
        return optionElement;
      });

      element.append(...optionElements);
    }

    populateOpts();

    if (ko.isObservable(options)) {
      options.subscribe(() => populateOpts(), this);
    }

    ko.utils.registerEventHandler(element, "change", (e) => {
      selectedOptions(
        element.selectedOptions.map((opt) => ko.selectExtensions.readValue(opt))
      );
    });

    if (onSearchInput) {
      ko.utils.registerEventHandler(element, "input", (e) => {
        onSearchInput(e.originalEvent.target.searchInputElement.value);
      });
    }
  },
  update: function (
    element,
    valueAccessor,
    allBindings,
    viewModel,
    bindingContext
  ) {
    const { selectedOptions } = valueAccessor();
    const selectedUnwrapped = ko.unwrap(selectedOptions);

    for (var i = 0; i < element.options.length; i++) {
      const o = element.options[i];
      o.toggleAttribute(
        "selected",
        selectedUnwrapped.includes(ko.selectExtensions.readValue(o))
      );
    }

    // element.selectedOptions = ko.unwrap(selectedOptions);
  },
};

ko.bindingHandlers.people = {
  init: function (element, valueAccessor, allBindingsAccessor) {
    var schema = {};
    schema["PrincipalAccountType"] = "User";
    schema["SearchPrincipalSource"] = 15;
    schema["ShowUserPresence"] = true;
    schema["ResolvePrincipalSource"] = 15;
    schema["AllowEmailAddresses"] = true;
    schema["AllowMultipleValues"] = false;
    schema["MaximumEntitySuggestions"] = 50;
    //schema["Width"] = "280px";
    schema["OnUserResolvedClientScript"] = async function (elemId, userKeys) {
      //  get reference of People Picker Control
      var pickerControl = SPClientPeoplePicker.SPClientPeoplePickerDict[elemId];
      var observable = valueAccessor();
      var userJSObject = pickerControl.GetControlValueAsJSObject()[0];
      if (!userJSObject) {
        observable(null);
        return;
      }

      if (userJSObject.IsResolved) {
        if (userJSObject.Key == observable()?.LoginName) return;
        var user = await ensureUserByKeyAsync(userJSObject.Key);
        var person = new People(user);
        observable(person);
      }
    };

    // TODO: Minor - accept schema settings as options
    //var mergedOptions = Object.assign(schema, obs.schemaOpts);

    //  Initialize the Control, MS enforces to pass the Element ID hence we need to provide
    //  ID to our element, no other options
    SPClientPeoplePicker_InitStandaloneControlWrapper(element.id, null, schema);
    // const helpDiv = document.createElement("div");
    // helpDiv.innerHTML = "Search surname first e.g. Smith, John";
    // helpDiv.classList.add("fst-italic", "fw-lighter");
    // element.appendChild(helpDiv);
  },
  update: function (
    element,
    valueAccessor,
    allBindings,
    viewModel,
    bindingContext
  ) {
    var pickerControl =
      SPClientPeoplePicker.SPClientPeoplePickerDict[element.id + "_TopSpan"];
    var userValue = ko.utils.unwrapObservable(valueAccessor());

    if (!userValue) {
      // Clear the form
      pickerControl?.DeleteProcessedUser();
      return;
    }

    if (
      userValue &&
      !pickerControl
        .GetAllUserInfo()
        .find((pickerUser) => pickerUser.DisplayText == userValue.LookupValue)
    ) {
      pickerControl.AddUserKeys(
        userValue.LoginName ?? userValue.LookupValue ?? userValue.Title
      );
    }
  },
};

ko.bindingHandlers.dateField = {
  init: function (element, valueAccessor, allBindingsAccessor) {},
  update: function (
    element,
    valueAccessor,
    allBindings,
    viewModel,
    bindingContext
  ) {},
};

ko.bindingHandlers.downloadLink = {
  update: function (
    element,
    valueAccessor,
    allBindings,
    viewModel,
    bindingContext
  ) {
    var path = valueAccessor();
    var replaced = path.replace(/:([A-Za-z_]+)/g, function (_, token) {
      return ko.unwrap(viewModel[token]);
    });
    element.href = replaced;
  },
};

ko.bindingHandlers.files = {
  init: function (element, valueAccessor) {
    function addFiles(fileList) {
      var value = valueAccessor();
      if (!fileList.length) {
        value.removeAll();
        return;
      }

      const existingFiles = ko.unwrap(value);
      const newFileList = [];
      for (let file of fileList) {
        if (!existingFiles.find((exFile) => exFile.name == file.name))
          newFileList.push(file);
      }
      ko.utils.arrayPushAll(value, newFileList);
      return;
    }

    ko.utils.registerEventHandler(element, "change", function () {
      addFiles(element.files);
    });

    const label = element.closest("label");
    if (!label) return;

    ko.utils.registerEventHandler(label, "dragover", function (event) {
      event.preventDefault();
      event.stopPropagation();
    });

    ko.utils.registerEventHandler(label, "dragenter", function (event) {
      event.preventDefault();
      event.stopPropagation();
      label.classList.add("dragging");
    });

    ko.utils.registerEventHandler(label, "dragleave", function (event) {
      event.preventDefault();
      event.stopPropagation();
      label.classList.remove("dragging");
    });

    ko.utils.registerEventHandler(label, "drop", function (event) {
      event.preventDefault();
      event.stopPropagation();
      let dt = event.originalEvent.dataTransfer;
      let files = dt.files;
      addFiles(files);
    });
  },
  update: function (
    element,
    valueAccessor,
    allBindings,
    viewModel,
    bindingContext
  ) {
    const value = valueAccessor();
    if (!value().length && element.files.length) {
      // clear all files
      element.value = null;
      return;
    }

    return;
  },
};

ko.bindingHandlers.toggleClick = {
  init: function (element, valueAccessor, allBindings) {
    var value = valueAccessor();

    ko.utils.registerEventHandler(element, "click", function () {
      var classToToggle = allBindings.get("toggleClass");
      var classContainer = allBindings.get("classContainer");
      var containerType = allBindings.get("containerType");

      if (containerType && containerType == "sibling") {
        $(element)
          .nextUntil(classContainer)
          .each(function () {
            $(this).toggleClass(classToToggle);
          });
      } else if (containerType && containerType == "doc") {
        var curIcon = $(element).attr("src");
        if (curIcon == "/_layouts/images/minus.gif")
          $(element).attr("src", "/_layouts/images/plus.gif");
        else $(element).attr("src", "/_layouts/images/minus.gif");

        if ($(element).parent() && $(element).parent().parent()) {
          $(element)
            .parent()
            .parent()
            .nextUntil(classContainer)
            .each(function () {
              $(this).toggleClass(classToToggle);
            });
        }
      } else if (containerType && containerType == "any") {
        if ($("." + classToToggle).is(":visible"))
          $("." + classToToggle).hide();
        else $("." + classToToggle).show();
      } else $(element).find(classContainer).toggleClass(classToToggle);
    });
  },
};

ko.bindingHandlers.toggles = {
  init: function (element, valueAccessor) {
    var value = valueAccessor();

    ko.utils.registerEventHandler(element, "click", function () {
      value(!value());
    });
  },
};

const fromPathTemplateLoader = {
  loadTemplate: function (name, templateConfig, callback) {
    if (templateConfig.fromPath) {
      // TODO: Minor - fix error catching and fallback flow
      fetch(assetsPath + templateConfig.fromPath)
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Error Fetching HTML Template - ${response.statusText}`
            );
          }
          return response.text();
        })
        .catch((error) => {
          if (!templateConfig.fallback) return;
          console.warn(
            "Primary template not found, attempting fallback",
            templateConfig
          );
          fetch(assetsPath + templateConfig.fallback)
            .then((response) => {
              if (!response.ok) {
                throw new Error(
                  `Error Fetching fallback HTML Template - ${response.statusText}`
                );
              }
              return response.text();
            })
            .then((text) =>
              ko.components.defaultLoader.loadTemplate(name, text, callback)
            );
        })
        .then((text) =>
          text
            ? ko.components.defaultLoader.loadTemplate(name, text, callback)
            : null
        );
    } else {
      callback(null);
    }
  },
};

ko.components.loaders.unshift(fromPathTemplateLoader);

const fromPathViewModelLoader = {
  loadViewModel: function (name, viewModelConfig, callback) {
    if (viewModelConfig.viaLoader) {
      // console.log("loading module", name);
      const module = import(assetsPath + viewModelConfig.viaLoader).then(
        (module) => {
          // console.log("imported module", name);
          const viewModelConstructor = module.default;
          // We need a createViewModel function, not a plain constructor.
          // We can use the default loader to convert to the
          // required format.
          ko.components.defaultLoader.loadViewModel(
            name,
            viewModelConstructor,
            callback
          );
        }
      );
    } else {
      // Unrecognized config format. Let another loader handle it.
      callback(null);
    }
  },
};

ko.components.loaders.unshift(fromPathViewModelLoader);
