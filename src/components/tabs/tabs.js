import { setUrlParam } from "../../common/router.js";

// const urlParam = "Tab";

export class TabsModule {
  constructor(tabOpts, urlParam = "Tab") {
    this.urlParam = urlParam;
    ko.utils.arrayPushAll(this.tabOpts, tabOpts);
    this.selectedTab.subscribe(this.tabChangeHandler);
    window.addEventListener("popstate", this.popStateHandler);
  }

  tabOpts = ko.observableArray();
  selectedTab = ko.observable();

  isSelected = (tab) => {
    return tab.id == this.selectedTab()?.id;
  };

  clickTabLink = (tab) => {
    this.selectedTab(tab);
    console.log("selected: " + tab.id);
  };

  selectTab = (tab) => this.selectById(tab.id);

  selectById = (tabId) => {
    const tabById =
      this.tabOpts().find((tab) => tab.id == tabId) ?? this.getDefaultTab();
    this.selectedTab(tabById);
  };

  getDefaultTab = () => this.tabOpts()[0];

  tabChangeHandler = (newTab) => {
    if (newTab) setUrlParam(this.urlParam, newTab.id);
    // window.history.pushState({ tab: { id: newTab.id } }, "", newTab.id);
  };

  popStateHandler = (event) => {
    if (event.state) {
      if (event.state[this.urlParam])
        this.selectById(event.state[this.urlParam]);
    }
  };
}

export class Tab {
  constructor(id, linkText, template, visible = true) {
    this.id = id;
    this.linkText = linkText;
    this.template = template;
    this.isVisible = visible;
  }

  visible = ko.pureComputed(() => {
    return ko.unwrap(this.isVisible);
  });
}
