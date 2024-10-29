// src/pages/print/print.js
var vm = {};
var Report = Report || {};
var Common = Common || {};
var sal = sal || {};
Report.Init = async function() {
  initSal();
  Common.Init();
  Report.Report = await Report.NewReport();
};
Report.NewReport = async function() {
  console.log("new report");
  var app = this;
  function initStaticListRefs() {
    app.listRefs = {};
    app.listRefs.Plans = new sal.NewSPList(CIItemListDef);
    app.listRefs.Actions = new sal.NewSPList(ActionListDef);
    app.listRefs.Whys = new sal.NewSPList(WhyListDef);
    app.listRefs.Rejections = new sal.NewSPList(RejectionListDef);
    app.listRefs.BusinessOffices = new sal.NewSPList(BusinessOfficeListDef);
    app.listRefs.SupportDocs = new sal.NewSPList(DocumentListDef);
    app.listRefs.TempQOs = new sal.NewSPList(TempQOListDef);
  }
  initStaticListRefs();
  function ViewModel() {
    var self = this;
    self.recordExists = ko.observable(true);
    self.selectedTitle = ko.observable();
    self.selectedRecord = Common.Utilities.observableObjectFromListDef(CIItemListDef);
    self.actions = ko.observableArray();
    self.whys = ko.observableArray();
    self.rejections = ko.observableArray();
    self.selectedDocuments = ko.observableArray();
    self.supportDocuments = ko.pureComputed(function() {
      return self.selectedDocuments().filter(function(doc) {
        return doc.DocType == "Support";
      });
    });
    self.effectivenessDocuments = ko.pureComputed(function() {
      return self.selectedDocuments().filter(function(doc) {
        return doc.DocType == "Effectiveness";
      });
    });
  }
  vm = new ViewModel();
  async function loadRecord(recordTitle) {
    var camlQ = "<View><Query><Where><Eq><FieldRef Name='Title'/><Value Type='Text'>" + recordTitle + "</Value></Eq></Where></Query></View>";
    var results = await app.listRefs.Plans.getListItemsAsync(camlQ);
    if (results.length) {
      var selectedRecordObj = results[0];
      Common.Utilities.setValuePairs(
        CIItemListDef,
        vm.selectedRecord,
        selectedRecordObj
      );
    } else {
      alert("Record not found!");
      vm.recordExists(false);
      return;
    }
    app.listRefs.Actions.getListItems(camlQ, vm.actions);
    app.listRefs.Rejections.getListItems(camlQ, vm.rejections);
    var docsCamlQ = "<View Scope='RecursiveAll'><Query><Where><Eq><FieldRef Name='Record'/><Value Type='Text'>" + recordTitle + "</Value></Eq></Where><OrderBy><FieldRef Name='Title' Ascending='FALSE'/></OrderBy></Query></View>";
    app.listRefs.SupportDocs.getListItems(docsCamlQ, vm.selectedDocuments);
    if (vm.selectedRecord.RecordType() == "CAR") {
      var camlQ = "<View><Query><Where><Contains><FieldRef Name='Title'/><Value Type='Text'>" + recordTitle + "</Value></Contains></Where><OrderBy><FieldRef Name='Number' Ascending='TRUE'/></OrderBy></Query></View>";
      app.listRefs.Whys.getListItems(camlQ, vm.whys);
    }
  }
  function initialize() {
    var capid = Common.Utilities.getUrlParam("capid");
    vm.selectedTitle(capid);
  }
  initialize();
  await loadRecord(vm.selectedTitle());
  ko.applyBindings(vm);
};
$(document).ready(function() {
  SP.SOD.executeFunc(
    "sp.js",
    "SP.ClientContext",
    ExecuteOrDelayUntilScriptLoaded(Report.Init, "SP.JS")
  );
});
//# sourceMappingURL=print.js.map
