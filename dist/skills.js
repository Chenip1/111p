const skillBoard = document.querySelector(".skill-board");
const skillCards = [...skillBoard.querySelectorAll(".skill-card")];
const skillMotion = matchMedia("(prefers-reduced-motion: no-preference)");

if (skillMotion.matches) {
  skillCards.forEach((card, index) => card.style.setProperty("--deal-order", index));
  const dealObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    skillBoard.classList.add("is-arriving");
    dealObserver.disconnect();
  }, { threshold: 0.2 });
  dealObserver.observe(skillBoard);
}

skillCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch" || !skillMotion.matches) return;
    const bounds = card.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
    card.style.setProperty("--tilt-x", vertical * -24 + "deg");
    card.style.setProperty("--tilt-y", horizontal * 28 + "deg");
  });
  card.addEventListener("pointerleave", () => {
    card.style.removeProperty("--tilt-x");
    card.style.removeProperty("--tilt-y");
  });
});
