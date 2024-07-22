import {
  html,
  BaseFieldModule,
  registerFieldComponents,
} from "./BaseFieldModule.js";

const editTemplate = html`
  <div class="component field">
    <!-- ko if: isRichText -->
    <label class="fw-semibold"
      ><span data-bind="text: displayName"></span
      ><span data-bind="if: isRequired" class="fw-bold text-danger">*</span
      >:</label
    >
    <!-- ko if: instructions -->
    <div
      class="fw-lighter fst-italic text-secondary"
      data-bind="html: instructions"
    ></div>
    <!-- /ko -->
    <div
      class="richtext-field"
      data-bind="childrenComplete: childrenHaveLoaded"
    >
      <!-- Create the editor container -->
      <div
        class="form-control"
        data-bind="attr: {'id': getUniqueId()}, class: ValidationClass"
        style="height: 150px"
      >
        <div data-bind="html: Value"></div>
      </div>
    </div>
    <!-- /ko -->
    <!-- ko ifnot: isRichText -->
    <label class="fw-semibold"
      ><span data-bind="text: displayName"></span
      ><span data-bind="if: isRequired" class="fw-bold text-danger">*</span>:
      <!-- ko if: instructions -->
      <div
        class="fw-lighter fst-italic text-secondary"
        data-bind="html: instructions"
      ></div>
      <!-- /ko -->
      <textarea
        name=""
        id=""
        cols="30"
        rows="10"
        class="form-control"
        data-bind="textInput: Value, class: ValidationClass, attr: attr"
      ></textarea>
    </label>
    <!-- /ko -->
    <!-- ko if: ShowErrors -->
    <!-- ko foreach: Errors -->
    <div class="fw-semibold text-danger" data-bind="text: description"></div>
    <!-- /ko -->
    <!-- /ko -->
  </div>
`;

const viewTemplate = html`
  <div class="fw-semibold" data-bind="text: displayName"></div>
  <!-- ko if: Value -->
  <!-- ko if: isRichText -->
  <div data-bind="html: Value"></div>
  <!-- /ko -->
  <!-- ko ifnot: isRichText -->
  <div data-bind="text: Value"></div>
  <!-- /ko -->
  <!-- /ko -->
  <!-- ko ifnot: Value -->
  <div class="fst-italic">Not provided.</div>
  <!-- /ko -->
`;

export class TextAreaModule extends BaseFieldModule {
  constructor(params) {
    super(params);
  }

  childrenHaveLoaded = (nodes) => {
    this.initializeEditor();
  };

  getToolbarId = () => "toolbar-" + this.getUniqueId();

  initializeEditor() {
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
    var editor = new Quill("#" + this.getUniqueId(), {
      modules: { toolbar: toolbarOptions },
      theme: "snow",
    });

    const Value = this.Value;

    Value.subscribe((val) => {
      if (val == "") {
        editor.setText("");
      }
    });

    editor.on("text-change", function (delta, oldDelta, source) {
      Value(editor.root.textContent ? editor.root.innerHTML : "");
    });
  }

  static viewTemplate = viewTemplate;
  static editTemplate = editTemplate;

  static view = "text-area-view";
  static edit = "text-area-edit";
  static new = "text-area-edit";
}

registerFieldComponents(TextAreaModule);
