const state = {};

window.history.replaceState({}, "", document.location.href);

export function setUrlParam(param, newVal) {
  // No need to reset the param if it hasn't changed
  if (getUrlParam(param) == newVal) return;

  const search = window.location.search;
  //var urlParams = new URLSearchParams(queryString);

  const regex = new RegExp("([?;&])" + param + "[^&;]*[;&]?");
  const query = search.replace(regex, "$1").replace(/&$/, "");

  const urlParams =
    (query.length > 2 ? query + "&" : "?") +
    (newVal ? param + "=" + newVal : "");

  state[param] = newVal;
  window.history.pushState(state, "", urlParams.toString());
}

export function getUrlParam(param) {
  const results = new RegExp("[?&]" + param + "=([^&#]*)").exec(
    window.location.href
  );
  if (results == null) {
    return null;
  } else {
    return decodeURI(results[1]) || 0;
  }
}
