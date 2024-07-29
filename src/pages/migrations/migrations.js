import { appContext } from "../../infrastructure/app-db-context.js";
import { InitSal } from "../../sal/infrastructure/index.js";
import {
  businessOfficeStore,
  sourcesStore,
} from "../../infrastructure/store.js";

function flattenPlan(plan) {
  console.log("Flattening Plan: ", plan.Title.Value());

  const coordinatorName = ko.unwrap(plan.ProblemResolverName.Value)?.Title;
  plan.CoordinatorName.Value(coordinatorName);

  const qaoName = ko.unwrap(plan.QAO.Value)?.Title;
  plan.QAOName.Value(qaoName);

  const qsoName = ko.unwrap(plan.QSO.Value)?.Title;
  plan.QSOName.Value(qsoName);

  const authorName = ko.unwrap(plan.Author.Value)?.Title;
  plan.AuthorName.Value(authorName);

  return appContext.Plans.UpdateEntity(plan, [
    "CoordinatorName",
    "QSOName",
    "QAOName",
    "AuthorName",
  ]);
}

class App {
  constructor() {}

  async clickMigrate() {
    console.log("fetching plans");
    const allPlans = await appContext.Plans.ToList();

    await Promise.all(allPlans.map(flattenPlan));
  }

  async init() {
    stores: {
      const businessOfficesPromise =
        await appContext.BusinessOffices.ToList().then(businessOfficeStore);

      const recordSourcesPromise = await appContext.RecordSources.ToList().then(
        sourcesStore
      );

      await Promise.all([businessOfficeStore, recordSourcesPromise]);
    }
  }

  static async Create() {
    const app = new App();
    await app.init();
    return app;
  }
}

async function initApp() {
  await InitSal();
  const vm = await App.Create();
  ko.applyBindings(vm);
}

if (document.readyState === "ready" || document.readyState === "complete") {
  initApp();
} else {
  document.onreadystatechange = () => {
    if (document.readyState === "complete" || document.readyState === "ready") {
      ExecuteOrDelayUntilScriptLoaded(function () {
        SP.SOD.executeFunc("sp.js", "SP.ClientContext", initApp);
      }, "sp.js");
    }
  };
}
