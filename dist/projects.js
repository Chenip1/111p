const projectCarousel = document.querySelector(".project-carousel");
const projectSection = projectCarousel.closest(".chapter");
const projectCards = [...projectCarousel.querySelectorAll(".project-card")];
const projectDialog = document.querySelector(".project-dialog");
const projectDemo = projectDialog.querySelector(".project-demo");
const projectMotion = matchMedia("(prefers-reduced-motion: no-preference)");
let centeredProject = 2;
let hoverDirection = 0;
let hoverTimer = 0;
let hoverPoint;
let swipeStart;
let lastSwipe = -Infinity;

function centerProject(index) {
  const count = projectCards.length;
  const middle = Math.floor(count / 2);
  centeredProject = (index + count) % count;
  projectCards.forEach((card, position) => {
    const offset = (position - centeredProject + count + middle) % count - middle;
    const previousOffset = Number(card.style.getPropertyValue("--project-offset"));
    card.classList.toggle("is-wrapping", Math.abs(offset - previousOffset) > 1);
    card.style.setProperty("--project-offset", offset);
    card.style.setProperty("--project-distance", Math.abs(offset));
    card.style.setProperty("--project-layer", count - Math.abs(offset));
  });
}

function stopProjectHover() {
  clearTimeout(hoverTimer);
  hoverDirection = 0;
}

function projectHoverDirection({ x, y }) {
  if (!projectMotion.matches || projectDialog.open || projectSection.closest("[inert]")) return 0;

  const vertical = y / window.innerHeight;
  const horizontal = x / window.innerWidth;
  if (vertical < 1 / 3 || vertical > 2 / 3) return 0;
  const direction = horizontal < 1 / 3 ? -1 : horizontal > 2 / 3 ? 1 : 0;
  if (!direction) return 0;

  const target = document.elementFromPoint(x, y);
  const isBlank = target === projectSection || target === projectCarousel ||
    (target?.matches(".works-layout") && projectSection.contains(target));
  return isBlank ? direction : 0;
}

function advanceOnHover() {
  if (projectHoverDirection(hoverPoint) !== hoverDirection) {
    stopProjectHover();
    return;
  }
  centerProject(centeredProject + hoverDirection);
  hoverTimer = setTimeout(advanceOnHover, 1050);
}

centerProject(centeredProject);
projectCarousel.dataset.ready = "";
window.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "mouse" || event.buttons) {
    stopProjectHover();
    return;
  }
  hoverPoint = { x: event.clientX, y: event.clientY };
  const direction = projectHoverDirection(hoverPoint);
  if (direction === hoverDirection) return;
  stopProjectHover();
  hoverDirection = direction;
  if (direction) hoverTimer = setTimeout(advanceOnHover, 450);
}, { passive: true });
document.documentElement.addEventListener("pointerleave", stopProjectHover);
window.addEventListener("blur", stopProjectHover);
window.addEventListener("pointerdown", stopProjectHover);
projectMotion.addEventListener("change", stopProjectHover);

projectSection.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "touch" || !event.isPrimary) return;
  swipeStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
});
projectSection.addEventListener("pointerup", (event) => {
  if (swipeStart?.id !== event.pointerId) return;
  const horizontal = event.clientX - swipeStart.x;
  const vertical = event.clientY - swipeStart.y;
  swipeStart = undefined;
  if (Math.abs(horizontal) < 42 || Math.abs(horizontal) < Math.abs(vertical) * 1.25) return;
  lastSwipe = performance.now();
  centerProject(centeredProject + (horizontal < 0 ? 1 : -1));
});
projectSection.addEventListener("pointercancel", (event) => {
  if (swipeStart?.id === event.pointerId) swipeStart = undefined;
});

projectCarousel.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  stopProjectHover();
  centerProject(centeredProject + (event.key === "ArrowLeft" ? -1 : 1));
  projectCards[centeredProject].focus({ preventScroll: true });
});

projectCards.forEach((card, index) => {
  card.addEventListener("focus", () => {
    if (card.matches(":focus-visible") && !projectDialog.open) centerProject(index);
  });
  card.addEventListener("click", (event) => {
    if (event.detail && performance.now() - lastSwipe < 400) return;
    stopProjectHover();
    const title = card.querySelector(".project-title").textContent;
    projectDialog.querySelector("#project-dialog-title").textContent = title;
    projectDialog.querySelector("#project-dialog-category").textContent = card.querySelector(".project-category").textContent;
    projectDialog.querySelector("#project-dialog-description").textContent = card.querySelector(".project-description").textContent;
    projectDialog.classList.toggle("is-document", card.hasAttribute("data-document-view"));

    const projectCase = card.dataset.projectCase && document.getElementById(card.dataset.projectCase);
    if (projectCase instanceof HTMLTemplateElement) {
      projectDemo.replaceChildren(projectCase.content.cloneNode(true));
    } else if (card.dataset.demoUrl) {
      const frame = document.createElement("iframe");
      frame.src = card.dataset.demoUrl;
      frame.title = title + " 项目演示";
      frame.allowFullscreen = true;
      projectDemo.replaceChildren(frame);
    } else {
      const status = document.createElement("p");
      status.textContent = "项目演示待接入";
      projectDemo.replaceChildren(card.querySelector(".project-art").cloneNode(true), status);
    }
    projectDialog.showModal();
  });
});

projectDialog.addEventListener("click", (event) => {
  if (event.target === projectDialog) projectDialog.close();
});
projectDialog.addEventListener("close", () => {
  projectDemo.replaceChildren();
  projectDialog.classList.remove("is-document");
});
