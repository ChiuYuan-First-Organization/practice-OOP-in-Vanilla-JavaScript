class DOMHelper {
  static clearEventListeners(element) {
    const clonedElement = element.cloneNode(true);
    element.replaceWith(clonedElement);
    return clonedElement;
  }

  static moveElement(elementId, parentElementSelector) {
    const element = document.getElementById(elementId);
    const parentElement = document.querySelector(parentElementSelector);
    parentElement.appendChild(element);
    element.scrollIntoView({ behavior: "smooth" });
  }
}

class Component {
  constructor(hostElementId, insertBefore = false) {
    if (hostElementId) {
      this.hostElement = document.getElementById(hostElementId);
    } else {
      this.hostElement = document.body;
    }
    this.insertBefore = insertBefore;
  }

  detach() {
    if (this.element) {
      this.element.parentElement.removeChild(this.element);
    }
  }

  attach() {
    this.hostElement.insertAdjacentHTML(
      this.insertBefore ? "afterbegin" : "beforeend",
      this.element
    );
  }
}

class Tooltip extends Component {
  constructor(hostElementId, text, closeIdentifierFn) {
    super(hostElementId);
    this.text = text;
    this.closeIdentifierFn = closeIdentifierFn;
    this.create();
  }

  closeTooltip() {
    this.detach();
    this.closeIdentifierFn();
  }

  create() {
    const hostElPosTop = this.hostElement.offsetTop;
    const hostElPosLeft = this.hostElement.offsetLeft;
    const hostElHeight = this.hostElement.clientHeight;
    const parentElScroll = this.hostElement.parentElement.scrollTop;

    const x = hostElPosLeft + 20;
    const y = hostElPosTop + hostElHeight - parentElScroll + 10;

    const tooltipTemplate = document.getElementById("tooltip");
    const tooltipElement = document.createElement("div");
    tooltipElement.className = "card";
    const tooltipBody = document.importNode(
      tooltipTemplate.contentEditable,
      true
    );
    tooltipBody.querySelector("p").textContent = this.text;
    tooltipElement.appendChild(tooltipBody);

    tooltipElement.style.position = "absolute";
    tooltipElement.style.left = x + "px";
    tooltipElement.style.top = y + "px";

    tooltipElement.addEventListener("click", this.closeTooltip.bind(this));
    this.element = tooltipElement;
  }
}

class ProjectItem {
  constructor(id, updateProjectListFn, type) {
    this.id = id;
    this.updateProjectListHandler = updateProjectListFn;
    this.connectMoreInfoButton();
    this.connectSwitchButton(type);
    this.connectDrag();
  }

  hasActiveTooltip = false;

  showMoreInfoHandler() {
    if (this.hasActiveTooltip) {
      return;
    }
    const prjItem = document.getElementById(this.id);
    const tooltipText = prjItem.dataset.extraInfo;
    const tooltip = new Tooltip(this.id, tooltipText, () => {
      this.hasActiveTooltip = false;
    });
    tooltip.attach();
    this.hasActiveTooltip = true;
  }

  connectMoreInfoButton() {
    const prjItem = document.getElementById(this.id);
    const button = prjItem.querySelector("button:first-of-type");
    button.addEventListener("click", this.showMoreInfoHandler.bind(this));
  }

  connectSwitchButton(type) {
    const prjElement = document.getElementById(this.id);
    let button = prjElement.querySelector("button:last-of-type");
    button = DOMHelper.clearEventListeners(button);
    button.textContent = type === "active" ? "Finish" : "Activate";
    button.addEventListener(
      "click",
      this.updateProjectListHandler.bind(null, this.id)
    );
  }

  update(updatedFunction, type) {
    this.updateProjectListHandler = updatedFunction;
    this.connectSwitchButton(type);
  }

  connectDrag() {
    const prjElement = document.getElementById(this.id);
    prjElement.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", this.id);
      event.dataTransfer.effectAllowed = "move";
      console.log("drag start event:", event);
    });

    prjElement.addEventListener("dragend", (event) => {
      if (event.dataTransfer.dropEffect === "none") {
        alert("Please drag into right place!");
      }
    });
  }
}

class ProjectList {
  projects = [];

  constructor(type) {
    this.type = type;
    const prjItems = document.querySelectorAll(`#${type}-projects li`);
    for (const prjItem of prjItems) {
      this.projects.push(
        new ProjectItem(prjItem.id, this.switchProject.bind(this), type)
      );
    }
    this.connectDraggable();
  }

  connectDraggable() {
    const prjList = document.querySelector(`#${this.type}-projects ul`);

    prjList.addEventListener("dragenter", (event) => {
      if (event.dataTransfer.types[0] === "text/plain") {
        prjList.parentElement.classList.add("droppable");
        event.preventDefault();
        console.log("drag enter event:", event); // optional, cause after entering, the event will turn to be dragover immediately.
      }
    });

    prjList.addEventListener("dragover", (event) => {
      if (event.dataTransfer.types[0] === "text/plain") {
        event.preventDefault(); // browser will forbid dropping by default.
        console.log("drag over event:", event);
      }
    });

    prjList.addEventListener("dragleave", (event) => {
      if (event.relatedTarget.closest(`#${this.type}-projects ul`) === null) {
        prjList.parentElement.classList.remove("droppable");
      }
    });

    prjList.addEventListener("drop", (event) => {
      const prjId = event.dataTransfer.getData("text/plain");
      if (this.projects.find((prj) => prj.id === prjId)) {
        return;
      }
      document
        .getElementById(prjId)
        .querySelector("button:last-of-type")
        .click();
      prjList.parentElement.classList.remove("droppable");
    });
  }

  setSwitchHandlerFunction(addProjectFunc) {
    this.switchHandler = addProjectFunc;
  }

  switchProject(projId) {
    this.switchHandler(this.projects.find((prj) => prj.id === projId));
    this.projects = this.projects.filter((prj) => prj.id !== projId);
  }

  addProject(project) {
    this.projects.push(project);
    DOMHelper.moveElement(project.id, `#${this.type}-projects ul`);
    project.update(this.switchProject.bind(this), this.type);
  }
}

class App {
  static init() {
    const activeList = new ProjectList("active");
    const finishedList = new ProjectList("finished");
    activeList.setSwitchHandlerFunction(
      finishedList.addProject.bind(finishedList)
    );
    finishedList.setSwitchHandlerFunction(
      activeList.addProject.bind(activeList)
    );
  }
}

App.init();
