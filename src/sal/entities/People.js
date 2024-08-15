export class People {
  constructor({
    ID,
    Title,
    LoginName = null,
    Email = null,
    IsGroup = null,
    IsEnsured = false,
  }) {
    this.ID = ID;
    this.Title = Title;
    this.LookupValue = Title;
    this.LoginName = LoginName != "" ? LoginName : null;
    this.Email = Email;
    this.IsGroup = IsGroup;
    // Has the user data been fetched? Used for binding handlers.
    this.IsEnsured = IsEnsured;
  }

  ID = null;
  Title = null;
  LoginName = null;
  LookupValue = null;
  Email = null;

  getKey = () => this.LoginName ?? this.Title;

  static Create = function (props) {
    if (!props || (!props.ID && !(props.Title || props.LookupValue)))
      return null;
    return new People({
      ...props,
      Title: props.Title ?? props.LookupValue,
    });
  };
}
