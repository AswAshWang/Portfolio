(function () {
  function toggleEmptyState() {
    const grid = document.getElementById("other-projects");
    const empty = document.getElementById("other-empty");
    if (!grid || !empty) return;
    const hasCards = grid.querySelector(".project-card");
    empty.hidden = Boolean(hasCards);
  }

  document.addEventListener("DOMContentLoaded", toggleEmptyState);
})();
