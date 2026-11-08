(function () {
  const roots = document.querySelectorAll(
    ".project-detail--case-study, .project-detail--art-board, .page-main--other"
  );
  if (!roots.length) return;

  const clickableImgSelector =
    ".media-block img, .media-row-item img, .media-row img, .monster-roster img, .art-board-stack img, .other-work__gallery img";

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 4;
  const ZOOM_STEP = 1.25;
  const STAGE_PAD = 48;

  const dialog = document.createElement("dialog");
  dialog.className = "media-lightbox";
  dialog.innerHTML =
    '<button type="button" class="media-lightbox__close" aria-label="Close">&times;</button>' +
    '<div class="media-lightbox__zoom" role="group" aria-label="Zoom">' +
    '<button type="button" class="media-lightbox__zoom-btn" data-zoom="out" aria-label="Zoom out">&minus;</button>' +
    '<button type="button" class="media-lightbox__zoom-btn" data-zoom="in" aria-label="Zoom in">+</button>' +
    "</div>" +
    '<div class="media-lightbox__stage">' +
    '<div class="media-lightbox__transform">' +
    '<img class="media-lightbox__img" alt="" draggable="false" />' +
    "</div></div>";
  document.body.appendChild(dialog);

  const stage = dialog.querySelector(".media-lightbox__stage");
  const transformEl = dialog.querySelector(".media-lightbox__transform");
  const lightboxImg = dialog.querySelector(".media-lightbox__img");
  const closeBtn = dialog.querySelector(".media-lightbox__close");
  const zoomInBtn = dialog.querySelector('[data-zoom="in"]');
  const zoomOutBtn = dialog.querySelector('[data-zoom="out"]');

  let fitScale = 1;
  let zoomLevel = MIN_ZOOM;
  let panX = 0;
  let panY = 0;
  let dragging = false;
  let dragMoved = false;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let panStartX = 0;
  let panStartY = 0;

  function computeFitScale() {
    const nw = lightboxImg.naturalWidth;
    const nh = lightboxImg.naturalHeight;
    if (!nw || !nh) return 1;
    const maxW = Math.max(1, stage.clientWidth - STAGE_PAD);
    const maxH = Math.max(1, stage.clientHeight - STAGE_PAD);
    return Math.min(1, maxW / nw, maxH / nh);
  }

  function displaySize() {
    const nw = lightboxImg.naturalWidth;
    const nh = lightboxImg.naturalHeight;
    const factor = fitScale * zoomLevel;
    return { w: nw * factor, h: nh * factor };
  }

  function applyView() {
    const nw = lightboxImg.naturalWidth;
    const nh = lightboxImg.naturalHeight;
    if (!nw || !nh) return;

    const { w, h } = displaySize();
    lightboxImg.style.width = w + "px";
    lightboxImg.style.height = h + "px";
    transformEl.style.transform =
      "translate(" + panX + "px, " + panY + "px)";
  }

  function isPannable() {
    if (zoomLevel > MIN_ZOOM) return true;
    const { w, h } = displaySize();
    return (
      w > stage.clientWidth - STAGE_PAD || h > stage.clientHeight - STAGE_PAD
    );
  }

  function updateZoomButtons() {
    zoomOutBtn.disabled = zoomLevel <= MIN_ZOOM + 0.001;
    zoomInBtn.disabled = zoomLevel >= MAX_ZOOM - 0.001;
    stage.classList.toggle("media-lightbox__stage--pannable", isPannable());
  }

  function resetView() {
    fitScale = 1;
    zoomLevel = MIN_ZOOM;
    panX = 0;
    panY = 0;
    lightboxImg.style.width = "";
    lightboxImg.style.height = "";
    transformEl.style.transform = "";
    updateZoomButtons();
  }

  function layoutImage() {
    fitScale = computeFitScale();
    applyView();
    updateZoomButtons();
  }

  function setZoomLevel(next) {
    zoomLevel = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    if (zoomLevel <= MIN_ZOOM) {
      panX = 0;
      panY = 0;
    }
    applyView();
    updateZoomButtons();
  }

  function openLightbox(src, alt) {
    resetView();
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    if (typeof dialog.showModal === "function") dialog.showModal();

    if (lightboxImg.complete && lightboxImg.naturalWidth) {
      layoutImage();
    } else {
      lightboxImg.onload = function () {
        lightboxImg.onload = null;
        layoutImage();
      };
    }
  }

  function clearLightbox() {
    lightboxImg.removeAttribute("src");
    lightboxImg.alt = "";
    lightboxImg.onload = null;
    resetView();
  }

  zoomInBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    setZoomLevel(zoomLevel * ZOOM_STEP);
  });

  zoomOutBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    setZoomLevel(zoomLevel / ZOOM_STEP);
  });

  dialog.addEventListener(
    "wheel",
    (event) => {
      if (!dialog.open) return;
      event.preventDefault();
      if (event.deltaY === 0) return;
      if (event.deltaY < 0) {
        setZoomLevel(zoomLevel * ZOOM_STEP);
      } else {
        setZoomLevel(zoomLevel / ZOOM_STEP);
      }
    },
    { passive: false }
  );

  closeBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    dialog.close();
  });

  stage.addEventListener(
    "pointerdown",
    (event) => {
      if (!isPannable() || event.button !== 0) return;
      dragging = true;
      dragMoved = false;
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      panStartX = panX;
      panStartY = panY;
      stage.setPointerCapture(event.pointerId);
      stage.classList.add("media-lightbox__stage--dragging");
    },
    true
  );

  stage.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const dx = event.clientX - pointerStartX;
    const dy = event.clientY - pointerStartY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragMoved = true;
    panX = panStartX + dx;
    panY = panStartY + dy;
    applyView();
  });

  function endDrag(event) {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove("media-lightbox__stage--dragging");
    if (event.pointerId != null) {
      try {
        stage.releasePointerCapture(event.pointerId);
      } catch (_) {
        /* already released */
      }
    }
  }

  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  stage.addEventListener("click", (event) => {
    if (dragMoved) {
      dragMoved = false;
      return;
    }
    if (event.target === stage) dialog.close();
  });

  window.addEventListener("resize", () => {
    if (!dialog.open) return;
    const prevZoom = zoomLevel;
    fitScale = computeFitScale();
    zoomLevel = prevZoom;
    applyView();
    updateZoomButtons();
  });

  roots.forEach((root) => {
    root.addEventListener("click", (event) => {
      const img = event.target.closest(clickableImgSelector);
      if (!img || !root.contains(img)) return;
      openLightbox(img.currentSrc || img.src, img.alt);
    });
  });

  dialog.addEventListener("cancel", clearLightbox);
  dialog.addEventListener("close", clearLightbox);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
})();
