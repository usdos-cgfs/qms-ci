import { SUPPORTINGDOCUMENTTYPES } from "../../constants.js";
import { appContext } from "../../infrastructure/app-db-context.js";

// import { printTemplate } from "./print-template.js";
const html = String.raw;

export async function printPlan(planId) {
  const plan = await appContext.Plans.FindById(planId);

  const planTitle = plan.Title.toString();

  // const docs = await appContext.SupportingDocuments.GetItemsByFolderPath(
  //   planTitle
  // );
  const docsResult = await appContext.SupportingDocuments.FindByColumnValue(
    [`substringof('${planTitle}', FileRef)`],
    {},
    {}
  );

  const docs = docsResult.results;

  const supportDocs = docs.filter(
    (doc) => doc.DocType.Value() == SUPPORTINGDOCUMENTTYPES.SUPPORT
  );
  const effectivenessDocs = docs.filter(
    (doc) => doc.DocType.Value() == SUPPORTINGDOCUMENTTYPES.EFFECTIVENESS
  );

  const actionsResult = await appContext.Actions.FindByTitle(planTitle);

  const actions = actionsResult.results;

  let recordTypeBody = "";
  if (plan.isCAP()) {
    recordTypeBody = capBodyTemplate(plan);
  } else {
    const whysResult = await appContext.RootCauseWhys.FindByColumnValue(
      [`substringof('${planTitle}', Title)`],
      {},
      {}
    );
    const whys = whysResult.results ?? [];
    recordTypeBody = carBodyTemplate({ plan, whys });
  }

  const template = printTemplate({
    plan,
    recordTypeBody,
    supportDocs,
    effectivenessDocs,
    actions,
  });

  const printPage = window.open("", "Print Page");

  printPage.document.open();
  printPage.document.write(template);
  printPage.document.close();

  printPage.print();
}

const printTemplate = ({
  plan,
  recordTypeBody,
  supportDocs,
  effectivenessDocs,
  actions,
}) => html` <html>
  <head>
    <title>${plan.Title.toString()}</title>
  </head>
  <!--
  <link
    rel="stylesheet"
    type="text/css"
    href="/sites/CGFS-QMS/Style Library/apps/qms-ci/dist/styles.css"
  />
 
  <style>
    #ms-designer-ribbon,
    .min-banner,
    #sp-navigationbar {
      display: none;
    }

    .report table,
    .report th,
    .report td {
      border-collapse: collapse;
      border: 1px solid black;
      padding: 3px 7px;
    }
  </style>
  -->
  <div class="app report">
    <h1 class="section-title">${plan.Title.toString()}</h1>
    <div>
      <table>
        <tr>
          <td>Record Id:</td>
          <td>${plan.Title.toString()}</td>
        </tr>
        <tr>
          <td>Type:</td>
          <td>${plan.RecordType.toString()}</td>
        </tr>
        <tr>
          <td>Subject:</td>
          <td>${plan.Subject.toString()}</td>
        </tr>
        <tr>
          <td>Business Office:</td>
          <td>${plan.BusinessOffice.toString()}</td>
        </tr>
        <tr>
          <td>CGFS Location:</td>
          <td>${plan.CGFSLocation.toString()}</td>
        </tr>
        <tr>
          <td>QSO:</td>
          <td>${plan.QSO.toString()}</td>
        </tr>
        <tr>
          <td>QAO:</td>
          <td>${plan.QAO.toString()}</td>
        </tr>
        <tr>
          <td>Source:</td>
          <td>${plan.Source.toString()}</td>
        </tr>
        <tr>
          <td>Self-Initiated:</td>
          <td>${plan.SelfInitiated.toString()}</td>
        </tr>
        <tr>
          <td>Coordinator:</td>
          <td>${plan.CoordinatorName.toString()}</td>
        </tr>
        <tr>
          <td>Submitted Date:</td>
          <td>${plan.SubmittedDate.toString()}</td>
        </tr>
        <tr>
          <td>Submitted By:</td>
          <td>${plan.AuthorName.toString()}</td>
        </tr>
        <tr>
          <td>Extension Count:</td>
          <td>${plan.ExtensionCount.toString()}</td>
        </tr>
        <tr>
          <td>Target Implementation Date:</td>
          <td>${plan.ImplementationTargetDate.toString()}</td>
        </tr>
        <tr>
          <td>Implementation Completed Date:</td>
          <td>${plan.QSOImplementAdjudicationDate.toString()}</td>
        </tr>
        <tr>
          <td>Target Verification Date:</td>
          <td>${plan.EffectivenessVerificationTargetD.toString()}</td>
        </tr>
        <tr>
          <td>Supporting Docs Count:</td>
          <td>${supportDocs.length}</td>
        </tr>
        <tr>
          <td>Effectiveness Docs Count:</td>
          <td>${effectivenessDocs.length}</td>
        </tr>
      </table>
    </div>
    ${recordTypeBody}
    <div>
      <h2 class="section-title">Support Docs:</h2>
      <ul>
        ${supportDocs.length
          ? supportDocs
              .map((doc) => html`<li>${doc.FileName.toString()}</li>`)
              .join("")
          : html`<li style="font-style: italic">No Documents.</li>`}
      </ul>
    </div>
    <div>
      <h3 class="section-title">Actions:</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Description</th>
            <th>Responsible Person</th>
            <th>Target Date</th>
            <th>Completion Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${actions.map(actionTemplate).join("")}
        </tbody>
      </table>
    </div>
    <div data-bind="with: selectedRecord">
      <div>
        <div class="section-title">Office Risk Impact</div>
        <div class="section-subtitle">
          Does this CAR/CAP impact your Office Risks, Mitigations, or Internal
          Controls?
        </div>
        <div>${plan.OfficeImpactBool.toString()}</div>
        <div class="section-subtitle">Please give a brief description:</div>
        <div data-bind="html: OfficeImpactDesc">
          ${plan.OfficeImpactDesc.toString()}
        </div>
      </div>
      <div>
        <div class="section-title">Proof of Effectiveness:</div>
        <div class="section-subtitle">Text Description:</div>
        <div>${plan.EffectivenessDescription.toString()}</div>
        <div class="section-subtitle">Effectiveness Docs:</div>
        <ul>
          ${effectivenessDocs
            .map((doc) => html`<li>${doc.FileName.toString()}</li>`)
            .join("")}
        </ul>
      </div>
    </div>
  </div>
</html>`;

const capBodyTemplate = ({ plan }) => html` <div>
  <div>
    <div class="section-title">Opportunity for Improvement:</div>
    <div>${plan.OFIDescription.toString()}</div>
  </div>
  <div>
    <div class="section-title">Discovery Data and Analysis:</div>
    <div>${plan.DiscoveryDataAnalysis.toString()}</div>
  </div>
</div>`;

const carBodyTemplate = ({ plan, whys }) => html` <div>
  <div>
    <div class="section-title">Problem Description:</div>
    <div data-bind="html: ProblemDescription">
      ${plan.ProblemDescription.toString()}
    </div>
  </div>
  <div>
    <div class="section-title">Containment Action:</div>
    <div data-bind="html: ContainmentAction">
      ${plan.ContainmentAction.toString()}
    </div>
  </div>
  <div>
    <div class="section-title">Root Cause Determination:</div>
    <div class="section-subtitle">5 whys:</div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Question</th>
          <th>Answer</th>
        </tr>
      </thead>
      <tbody>
        ${whys.map(
          (why) => html`<tr>
            <td>${why.Number.toString()}</td>
            <td>${why.Question.toString()}</td>
            <td>${why.Answer.toString()}</td>
          </tr>`
        )}
      </tbody>
    </table>
    <div class="section-subtitle">Root Cause Determination:</div>
    <div data-bind="html: RootCauseDetermination"></div>
  </div>
  <div>
    <div class="section-title">Similar Nonconformities:</div>
    <div class="section-subtitle">
      Could this noncomformance occur in another one of your office processes or
      in a corresponding office in another CGFS location?
    </div>
    <div>${plan.SimilarNoncomformityBool.toString()}</div>
    <div class="section-subtitle">Explanation:</div>
    <div>${plan.SimilarNoncomformityDesc.toString()}</div>
  </div>
</div>`;

const actionTemplate = (action) => html`
  <tr>
    <td>${action.ActionID.toString()}</td>
    <td>${action.ActionDescription.toString()}</td>
    <td>${action.ActionResponsiblePerson.toString()}</td>
    <td>${action.TargetDate.toString()}</td>
    <td>${action.ImplementationDate.toString()}</td>
    <td>${action.ImplementationStatus.toString()}</td>
  </tr>
`;
