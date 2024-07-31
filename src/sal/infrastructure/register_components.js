export const html = String.raw;

export function registerComponent({
  name,
  folder,
  module = null,
  moduleFilename = null,
  template: templateFilename,
}) {
  if (ko.components.isRegistered(name)) {
    return;
  }
  if (moduleFilename || module) {
    ko.components.register(name, {
      template: {
        fromPath: `/components/${folder}/${templateFilename}.html`,
      },
      viewModel: module ?? {
        viaLoader: `/components/${folder}/${moduleFilename}.js`,
      },
    });
  } else {
    ko.components.register(name, {
      template: {
        fromPath: `/components/${folder}/${templateFilename}.html`,
      },
    });
  }
}

export function directRegisterComponent(name, { template, viewModel = null }) {
  ko.components.register(name, {
    template,
    viewModel,
  });
}

export function registerFieldComponent({
  name,
  components,
  viewModel = null,
  folder = null,
}) {
  // register both our view and edit
  folder = folder ?? name;

  Object.keys(components).map((view) => {
    const componentName = components[view];
    if (ko.components.isRegistered(componentName)) {
      return;
    }

    // See if we already have this element in the dom
    const elementName = `field-` + componentName;
    const fieldViewElement = document.getElementById(elementName);

    if (!viewModel) {
      debugger;
    }
    ko.components.register(componentName, {
      template: fieldViewElement
        ? {
            element: fieldViewElement,
          }
        : {
            fromPath: `/sal/components/fields/${folder}/${name}${view}.html`,
          },
      viewModel: viewModel ?? {
        viaLoader: `/sal/components/fields/${folder}/${name}Module.js`,
      },
    });
  });
}
