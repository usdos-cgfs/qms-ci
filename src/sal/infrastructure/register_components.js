import * as ko from "knockout";
export const html = String.raw;

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
