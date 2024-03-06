import "../sass/project.scss";

String.prototype.supplant = function (o) {
  return this.replace(/{([^{}]*)}/g, (a, b) => {
    const r = o[b];
    return typeof r === "string" || typeof r === "number" ? r : a;
  });
};
