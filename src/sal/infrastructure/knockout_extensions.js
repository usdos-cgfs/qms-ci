import * as ko from "knockout";
import { People } from "../entities/index.js";
import { ensureUserByKeyAsync } from "./sal.js";
import { assetsPath } from "../../env.js";
import Quill from "quill";

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

      const selectedOpts = ko.unwrap(selectedOptions) ?? [];

      const optionElements = optionItems.map((option) => {
        const optionElement = document.createElement("option");
        ko.selectExtensions.writeValue(optionElement, ko.unwrap(option));
        // optionElement.value = option;
        optionElement.innerText = optionsText(option);

        if (
          selectedOpts?.find((selectedOption) => {
            if (option.ID && selectedOption.ID == option.ID) return true;
            if (option == selectedOption) return true;
            return false;
          })
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

ko.bindingHandlers.querySelect = {
  init: function (element, valueAccessor, allBindingsAccessor) {
    const {
      searchFunction,
      selectedOptions,
      optionsText,
      onSearchInput,
      setValueFromOpts,
    } = valueAccessor();

    function mapValToOpt(result) {
      const optionElement = document.createElement("option");
      ko.selectExtensions.writeValue(optionElement, ko.unwrap(result));

      optionElement.innerText = optionsText(result);
      optionElement.value = result.ID;
      return optionElement;
    }

    element.setSearchFunction(async (searchTerm) => {
      const results = await searchFunction(searchTerm);
      return results.map(mapValToOpt);
    });

    function populateSelectedOpts() {
      // Validate that our ko selectedOptions are in the element.selectedOptions

      let selectedOpts = ko.unwrap(selectedOptions) ?? [];

      if (!Array.isArray(selectedOpts)) selectedOpts = [selectedOpts];
      const optionElements = selectedOpts
        .filter(
          (option) =>
            !element.selectedOptions.find((opt) => opt.value == option.ID)
        )
        .map((option) => {
          const optionElement = mapValToOpt(option);
          optionElement.setAttribute("selected", "");
          element.appendChild(optionElement);
          element.selectedOptions.push(optionElement);
          return optionElement;
        });
      if (optionElements.length) {
        // suppress onchange
        element.updateItems(true);
      }
      // element.replaceChildren(...optionElements);
    }

    populateSelectedOpts();

    if (ko.isObservable(selectedOptions)) {
      selectedOptions.subscribe(() => populateSelectedOpts(), this);
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
  ) {},
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

ko.bindingHandlers.richText = {
  init: function (element, valueAccessor, allBindingsAccessor) {
    const value = valueAccessor();

    element.innerHTML = value() ?? "";

    function initializeEditor() {
      const toolbarOptions = [
        ["bold", "italic", "underline", "strike"], // toggled buttons
        ["link"],
        ["blockquote", "code-block"],

        [{ header: 1 }, { header: 2 }], // custom button values
        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }], // superscript/subscript
        [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
        [{ direction: "rtl" }], // text direction

        [{ size: ["small", false, "large", "huge"] }], // custom dropdown
        [{ header: [1, 2, 3, 4, 5, 6, false] }],

        [{ color: [] }, { background: [] }], // dropdown with defaults from theme
        [{ font: [] }],
        [{ align: [] }],

        ["clean"], // remove formatting button
      ];

      // debugger;
      var editor = new Quill(element, {
        modules: { toolbar: toolbarOptions },
        theme: "snow",
      });

      value.subscribe((val) => {
        if (val != editor.root.innerHTML) {
          editor.root.innerHTML = val;
        }
      });

      editor.on("text-change", function (delta, oldDelta, source) {
        if (source == "user") {
          value(editor.getLength() > 1 ? editor.root.innerHTML : "");
        }
      });
    }

    initializeEditor();
  },
  update: function (
    element,
    valueAccessor,
    allBindings,
    viewModel,
    bindingContext
  ) {},
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

ko.bindingHandlers.dataTable = {
  init: function (element, valueAccessor, allBindingsAccessor) {
    const obsArr = valueAccessor();
    if (ko.isObservable(obsArr)) {
      obsArr.subscribe((arrayChanges) => {
        // Add timeout so html can render
        setTimeout(() => {
          if (element.update) element.update();
        }, 5);
      }, "arrayChange");
    }
  },
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
    const fileName = viewModel["fileName"];
    if (fileName) {
      element.setAttribute("download", fileName);
    }
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
        let sibling = element.nextElementSibling;
        while (sibling && !sibling.matches(classContainer)) {
          sibling.classList.toggle(classToToggle);
          sibling = sibling.nextElementSibling;
        }
      } else if (containerType && containerType == "doc") {
        var curIcon = element.getAttribute("src");
        if (curIcon == "/_layouts/images/minus.gif") {
          element.setAttribute("src", "/_layouts/images/plus.gif");
        } else {
          element.setAttribute("src", "/_layouts/images/minus.gif");
        }

        if (element.parentElement && element.parentElement.parentElement) {
          let sibling = element.parentElement.parentElement.nextElementSibling;
          while (sibling && !sibling.matches(classContainer)) {
            sibling.classList.toggle(classToToggle);
            sibling = sibling.nextElementSibling;
          }
        }
      } else if (containerType && containerType == "any") {
        const elements = document.querySelectorAll("." + classToToggle);

        elements.forEach(function (element) {
          if (element.style.display === "none") {
            element.style.display = ""; // Resets to default display value, such as 'block' or 'inline'
          } else {
            element.style.display = "none";
          }
        });
      } else {
        const containers = element.querySelectorAll(classContainer);
        containers.forEach(function (container) {
          container.classList.toggle(classToToggle);
        });
      }
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
      fetch(assetsPath() + templateConfig.fromPath)
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
          fetch(assetsPath() + templateConfig.fallback)
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
      const module = import(assetsPath() + viewModelConfig.viaLoader).then(
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
