export const sortByTitle = (a, b) => {
  if (a.Title > b.Title) {
    return 1;
  }
  if (a.Title < b.Title) {
    return -1;
  }
  return 0;
};

export const sortByField = (field) => (a, b) => {
  if (a[field] > b[field]) {
    return 1;
  }
  if (a[field] < b[field]) {
    return -1;
  }
  return 0;
};

export const createNewRequestTitle = () => {
  const ts = new Date();
  return ts.format("yyMMdd") + "-" + (ts.getTime() % 100000);
};
