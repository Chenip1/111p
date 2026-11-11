const hero = document.querySelector(".hero");
const backdrop = hero.querySelector(".hero-backdrop");
const profile = hero.querySelector(".hero-grid");

function setAssembled(assembled) {
  hero.classList.toggle("is-assembled", assembled);
  backdrop.setAttribute("aria-pressed", String(assembled));
  profile.inert = assembled;
}

hero.classList.add("is-interactive");
backdrop.hidden = false;
backdrop.addEventListener("click", () => {
  setAssembled(!hero.classList.contains("is-assembled"));
});
hero.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && hero.classList.contains("is-assembled")) {
    setAssembled(false);
    backdrop.focus({ preventScroll: true });
  }
});
