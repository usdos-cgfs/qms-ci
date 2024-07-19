import { getUrlParam, setUrlParam } from "../../common/router.js";

// const urlParam = "Tab";

export class TabsModule {
  constructor(tabOpts, urlParam = "tab") {
    this.urlParam = urlParam;
    ko.utils.arrayPushAll(this.tabOpts, tabOpts);
    this.selectedTab.subscribe(this.tabChangeHandler);
    window.addEventListener("popstate", this.popStateHandler);

    // Set default tab
    const defaultTabId = getUrlParam(urlParam);
    this.selectById(this.selectById(defaultTabId));
  }

  tabOpts = ko.observableArray();
  selectedTab = ko.observable();

  visibleTabs = ko.pureComputed(() => {
    const visibleTabs = this.tabOpts().filter((tab) => tab.visible());
    return visibleTabs;
  });

  isSelected = (tab) => {
    return tab.id == this.selectedTab()?.id;
  };

  clickTabLink = (tab) => {
    this.selectedTab(tab);
  };

  selectTab = (tab) => this.selectById(tab?.id);

  selectById = (tabId) => {
    const tabById =
      this.tabOpts().find((tab) => tab.id == tabId) ?? this.getDefaultTab();
    this.selectedTab(tabById);
  };

  selectDefault = () => {
    this.selectedTab(this.getDefaultTab());
  };

  getDefaultTab = () => this.visibleTabs()[0];

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
  constructor({ urlKey, linkText, template, visible = true }) {
    this.id = urlKey;
    this.linkText = linkText;
    this.template = template;
    this.isVisible = visible;
  }

  visible = ko.pureComputed(() => {
    return ko.unwrap(this.isVisible);
  });
}
