const button = document.querySelector("button");
const div = document.querySelector("div");

div.addEventListener(
  "click",
  (event) => {
    event.stopPropagation();
    event.stopImmediatePropagation();
    console.log(event);
    console.log("Clicked div!");
  },
  true
);

button.addEventListener("click", (event) => {
  console.log(event);
  console.log("Clicked button!");
});

let curElementNumber = 0;

function scrollHandler() {
  const distanceToBottom = document.body.getBoundingClientRect().bottom;
  if (distanceToBottom < document.documentElement.clientHeight + 150) {
    const newDiv = document.createElement("div");
    curElementNumber++;
    newDiv.innerHTML = `<p>Element: ${curElementNumber}</p>`;
    document.body.appendChild(newDiv);
  }
}

window.addEventListener('scroll', scrollHandler);


