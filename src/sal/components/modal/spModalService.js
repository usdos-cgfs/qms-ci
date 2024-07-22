export async function showModal(options) {
  return new Promise((resolve, reject) => {
    const dlgOptions = SP.UI.$create_DialogOptions();

    dlgOptions.dialogReturnValueCallback = resolve;

    Object.assign(dlgOptions, options);

    SP.UI.ModalDialog.showModalDialog(dlgOptions);
  });
}
