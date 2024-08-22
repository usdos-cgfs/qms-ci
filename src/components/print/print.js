import { appContext } from "../../infrastructure/app-db-context.js";

// import { printTemplate } from "./print-template.js";
const html = String.raw;

export async function printPlan(planId) {
  const plan = await appContext.Plans.FindById(planId);

  const planTitle = plan.Title.toString();

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
    supportDocs: [],
    effectivenessDocs: [],
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
}) => html` -->
  <html>
    <head>
      <title>${plan.Title.toString()}</title>
    </head>
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
    <div class="report">
      <div>
        <div class="section-title">${plan.Title.toString()}</div>
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
            <td data-bind="text: $root.supportDocuments().length"></td>
          </tr>
          <tr>
            <td>Effectiveness Docs Count:</td>
            <td data-bind="text: $root.effectivenessDocuments().length"></td>
          </tr>
        </table>
      </div>
      ${recordTypeBody}
      <div>
        <div class="section-title">Support Docs:</div>
        <ul>
          ${supportDocs.map(
            (doc) => html` <li data-bind="text: Title">${doc.Title}</li> `
          )}
        </ul>
      </div>
      <div>
        <div class="section-title">Actions:</div>
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
          <tbody data-bind="foreach: actions">
            <tr>
              <td data-bind="text: ActionID"></td>
              <td data-bind="text: ActionDescription"></td>
              <td
                data-bind="text: ActionResponsiblePerson && ActionResponsiblePerson.get_lookupValue()"
              ></td>
              <td
                data-bind="text: TargetDate && TargetDate.format('yyyy-MM-dd')"
              ></td>
              <td
                data-bind="text: ImplementationDate && ImplementationDate.format('yyyy-MM-dd')"
              ></td>
              <td data-bind="text: ImplementationStatus"></td>
            </tr>
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
          <div data-bind="text: OfficeImpactBool">
            ${plan.Subject.toString()}
          </div>
          <div class="section-subtitle">Please give a brief description:</div>
          <div data-bind="html: OfficeImpactDesc">
            ${plan.Subject.toString()}
          </div>
        </div>
        <div>
          <div class="section-title">Proof of Effectiveness:</div>
          <div class="section-subtitle">
            Does this CAR/CAP impact your Office Risks, Mitigations, or Internal
            Controls?
          </div>
          <span data-bind="text: OfficeImpactBool"
            >${plan.Subject.toString()}</span
          >
          <div class="section-subtitle">Please give a brief description:</div>
          <div data-bind="html: OfficeImpactDesc">
            ${plan.Subject.toString()}
          </div>
          <div class="section-subtitle">Effectiveness Docs:</div>
          <ul data-bind="foreach: $root.effectivenessDocuments">
            ${effectivenessDocs.map(
              (doc) => html` <li data-bind="text: Title">${doc.Title}</li> `
            )}
          </ul>
        </div>
      </div>
    </div>
  </html>`;

const capBodyTemplate = ({ plan }) => html` <div>
  <div>
    <div class="section-title">Opportunity for Improvement:</div>
    <div data-bind="html: OFIDescription">
      ${plan.OFIDescription.toString()}
    </div>
  </div>
  <div>
    <div class="section-title">Discovery Data and Analysis:</div>
    <div data-bind="html: DiscoveryDataAnalysis">
      ${plan.DiscoveryDataAnalysis.toString()}
    </div>
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
    <div data-bind="text: SimilarNoncomformityBool"></div>
    <div class="section-subtitle">Explanation:</div>
    <div data-bind="html: SimilarNoncomformityDesc"></div>
  </div>
</div>`;
