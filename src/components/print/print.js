import { SUPPORTINGDOCUMENTTYPES } from "../../constants.js";
import { appContext } from "../../infrastructure/app-db-context.js";
import { getRoleLinkToPlan } from "../../services/plan-service.js";

// import { printTemplate } from "./print-template.js";
const html = String.raw;

export async function printPlan(planId) {
  const plan = await appContext.Plans.FindById(planId);

  const linkToPlan = getRoleLinkToPlan(plan);

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
    recordTypeBody = capBodyTemplate({ plan });
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
    linkToPlan,
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
  linkToPlan,
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
  -->
  <style>
    .report table,
    .report th,
    .report td {
      border-collapse: collapse;
      border: 1px solid black;
      padding: 3px 7px;
      font-family: "Segoe UI", Segoe, Tahom;
      font-size: 0.9rem;
    }

    .report th {
      font-weight: 500;
    }

    .app.report {
      font-family: "Segoe UI", Segoe, Tahom;
      font-size: 0.9rem;
    }

    .section {
      margin-block-end: 1.5em;
      break
    }

    .subsection {
      break-inside: avoid;
      margin-block-end: 1em;
    }

    h1.section-title {
      font-size: 1.3rem;
    }

    .section-title {
      padding: 0;
      margin: 0;
      font-size: 1.3em;
      font-weight: 600;
    }

    .section-subtitle {
      padding: 0;
      margin: 0.2em 0;
      font-size: 1em;
      font-weight: 600;
    }

    .plan-link {
      font-size: .9em;
    }

    .nowrap {
      white-space: nowrap;
    }
  </style>
  <div class="app report">
    <h1 class="section-title">
      ${plan.Title.toString()} - ${plan.Subject.toString()}
    </h1>
    <div class="section">
      <span class="plan-link">[${linkToPlan}]</span>
      <table>
        <tbody>
          <tr>
            <td>Record ID:</td>
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
            <td>${plan.ExtensionCount.toString() ?? "0"}</td>
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
        </tbody>
      </table>
    </div>
    ${recordTypeBody}
    <div class="section">
      <h2 class="section-title">Supporting Documents:</h2>
      <ul>
        ${supportDocs.length
          ? supportDocs
              .map((doc) => html`<li>${doc.FileName.toString()}</li>`)
              .join("")
          : html`<li style="font-style: italic">No Documents.</li>`}
      </ul>
    </div>
    <div class="section">
      <h2 class="section-title">Actions:</h2>
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
    <div class="section">
      <h2 class="section-title">Office Risk Impact</h2>
      <div class="subsection">
        <h3 class="section-subtitle">
          Does this CAR/CAP impact your Office Risks, Mitigations, or Internal
          Controls?
        </h3>
        <div>${plan.OfficeImpactBool.toString()}</div>
      </div>
      <div class="subsection">
        <h3 class="section-subtitle">Please give a brief description:</h3>
        <div data-bind="html: OfficeImpactDesc">
          ${plan.OfficeImpactDesc.toString()}
        </div>
      </div>
    </div>
    <div class="section">
      <h2 class="section-title">Proof of Effectiveness:</h2>
      <div class="subsection">
        <h3 class="section-subtitle">Text Description:</h3>
        <div>${plan.EffectivenessDescription.toString()}</div>
      </div>
      <div class="subsection">
        <h3 class="section-subtitle">Effectiveness Documents:</h3>
        <ul>
          ${effectivenessDocs.length
            ? effectivenessDocs
                .map((doc) => html`<li>${doc.FileName.toString()}</li>`)
                .join("")
            : html`<li style="font-style: italic">No Documents.</li>`}
        </ul>
      </div>
    </div>
  </div>
</html>`;

const capBodyTemplate = ({ plan }) => html` <div>
  <div class="section">
    <h2 class="section-title">Opportunity for Improvement:</h2>
    <div>${plan.OFIDescription.toString()}</div>
  </div>
  <div class="section">
    <h2 class="section-title">Discovery Data and Analysis:</h2>
    <div>${plan.DiscoveryDataAnalysis.toString()}</div>
  </div>
</div>`;

const carBodyTemplate = ({ plan, whys }) => html` <div>
  <div class="section">
    <h2 class="section-title">Problem Description:</h2>
    <div>${plan.ProblemDescription.toString()}</div>
  </div>
  <div class="section">
    <h2 class="section-title">Containment Action:</h2>
    <div>${plan.ContainmentAction.toString()}</div>
  </div>
  <div class="section">
    <h2 class="section-title">Root Cause Determination:</h2>
    <div class="subsection">
      <h3 class="section-subtitle">5 whys:</h3>
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
    </div>

    <div class="subsection">
      <h3 class="section-subtitle">Root Cause Determination:</h3>
      <div>${plan.RootCauseDetermination.toString()}</div>
    </div>
  </div>
  <div class="section">
    <h2 class="section-title">Similar Nonconformities:</h2>
    <div class="subsection">
      <h3 class="section-subtitle">
        Could this noncomformance occur in another one of your office processes
        or in a corresponding office in another CGFS location?
      </h3>
      <div>${plan.SimilarNoncomformityBool.toString()}</div>
    </div>
    <div class="subsection">
      <h3 class="section-subtitle">Explanation:</h3>
      <div>${plan.SimilarNoncomformityDesc.toString()}</div>
    </div>
  </div>
</div>`;

const actionTemplate = (action) => html`
  <tr>
    <td class="nowrap">${action.ActionID.toString()}</td>
    <td>${action.ActionDescription.toString()}</td>
    <td>${action.ActionResponsiblePerson.toString()}</td>
    <td>${action.TargetDate.toString()}</td>
    <td>${action.ImplementationDate.toString()}</td>
    <td>${action.ImplementationStatus.toString()}</td>
  </tr>
`;
