document.addEventListener("DOMContentLoaded", () => {
  const questionGroup = document.querySelector("#questions-group");
  if (!questionGroup) return;

  const updateInlineText = () => {
    const addLink = questionGroup.querySelector(".addlink");
    if (addLink && addLink.textContent !== "Өөр асуулт нэмэх") {
      addLink.textContent = "Өөр асуулт нэмэх";
    }

    const deleteHeader = questionGroup.querySelector("thead th:last-child");
    if (deleteHeader && deleteHeader.textContent.trim() === "Delete?") {
      deleteHeader.textContent = "Устгах уу?";
    }
  };

  updateInlineText();
  document.addEventListener("formset:added", updateInlineText);
});
