const sequence = document.querySelector(".chapter-sequence");
const stage = sequence.querySelector(".chapter-stage");
const deck = stage.querySelector(".chapter-deck");
const contactPanel = stage.querySelector("#contact");
const tabsBar = sequence.querySelector(".stage-tabs");
const tabs = [...tabsBar.querySelectorAll("a")];
const panels = [...deck.querySelectorAll(".chapter")];
const chapterFooter = deck.querySelector(".chapter-footer");
const nextChapter = chapterFooter.querySelector(".chapter-next");
const nextChapterLabel = nextChapter.firstElementChild;
const lastFolderIndex = panels.length - 1;
const contactIndex = panels.length;
const contactTravel = 0.72;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let activeIndex = -1;
let furthestIndex = 0;
let scrollFrame = 0;

function showPanel(index) {
  if (index === activeIndex) return;

  activeIndex = index;
  furthestIndex = Math.max(furthestIndex, index);
  const nextTab = tabs[index + 1];
  nextChapter.href = nextTab?.hash ?? "#contact";
  nextChapterLabel.textContent = "下一章 " + (nextTab?.querySelector("b").textContent ?? "联系我");
  chapterFooter.className = "chapter-footer " + panels[index].id;
  panels.forEach((panel, position) => {
    panel.classList.toggle("is-revealed", position <= index);
    panel.inert = position !== index;
    const tab = tabs[position];
    tab.hidden = position > furthestIndex;
    if (position === index) tab.setAttribute("aria-current", "true");
    else tab.removeAttribute("aria-current");
  });
}

function scrollStep() {
  return (sequence.offsetHeight - stage.offsetHeight * (1 + contactTravel)) / lastFolderIndex;
}

function updateStage(distance) {
  const step = scrollStep();
  const folderIndex = Math.max(0, Math.min(lastFolderIndex, Math.round(distance / step)));
  showPanel(folderIndex);

  const travel = stage.offsetHeight * contactTravel;
  const contactDistance = distance - lastFolderIndex * step;
  const progress = contactDistance >= travel - 1.5 ? 1 : Math.max(0, contactDistance / travel);
  const contactVisible = progress >= 0.5;
  const shift = reducedMotion.matches ? Number(contactVisible) : progress;
  stage.style.setProperty("--contact-shift", shift * 100 + "%");
  deck.inert = contactVisible;
  contactPanel.inert = !contactVisible;
}

function syncPanelToScroll() {
  scrollFrame = 0;
  updateStage(-sequence.getBoundingClientRect().top);
}

function panelIndexForHash(hash) {
  if (hash === "#contact") return contactIndex;
  return panels.findIndex((panel) => "#" + panel.id === hash);
}

function scrollToPanel(index) {
  const sequenceTop = window.scrollY + sequence.getBoundingClientRect().top;
  const offset = index === contactIndex ? sequence.offsetHeight - stage.offsetHeight : index * scrollStep();
  updateStage(offset);
  window.scrollTo({ top: sequenceTop + offset, behavior: "instant" });
}

sequence.style.setProperty("--chapter-intervals", lastFolderIndex);
sequence.style.setProperty("--contact-travel", contactTravel);
sequence.classList.add("is-staged");
tabsBar.hidden = false;
chapterFooter.hidden = false;
const initialIndex = panelIndexForHash(window.location.hash);
if (initialIndex >= 0) scrollToPanel(initialIndex);
else syncPanelToScroll();

window.addEventListener("scroll", () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(syncPanelToScroll);
}, { passive: true });
window.addEventListener("resize", syncPanelToScroll);
reducedMotion.addEventListener("change", syncPanelToScroll);
window.addEventListener("hashchange", () => {
  const index = panelIndexForHash(window.location.hash);
  if (index >= 0) scrollToPanel(index);
});

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.defaultPrevented || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const index = panelIndexForHash(link.getAttribute("href"));
  if (index < 0) return;

  event.preventDefault();
  if (window.location.hash !== link.hash) history.pushState(null, "", link.hash);
  scrollToPanel(index);
  if (!tabsBar.contains(link)) {
    const panel = index === contactIndex ? contactPanel : panels[index];
    panel.focus({ preventScroll: true });
  }
});
