const contact = document.querySelector("#contact");
const copyEmail = contact.querySelector("[data-copy-email]");
const contactStatus = contact.querySelector(".contact-status");
const address = contact.querySelector(".contact-email").textContent.trim();

copyEmail.addEventListener("click", async () => {
  contactStatus.textContent = "";
  try {
    await navigator.clipboard.writeText(address);
    contactStatus.textContent = "邮箱已复制";
  } catch {
    contactStatus.textContent = "请手动复制邮箱：" + address;
  }
});
