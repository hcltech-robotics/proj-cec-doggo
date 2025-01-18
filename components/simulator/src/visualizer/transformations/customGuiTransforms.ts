import { SceneManager } from "../SceneManager";

function createCustomGUITransforms(s: SceneManager) {

  document.addEventListener('hackathonGuiEvent', (event) => {
    // INTERACT FROM REACT EVENT HANDLER TO THREEJS
    // usage: dispatch a custom event on the document
    console.log(event.detail)
    console.log(event?.detail?.message ?? "NO MESSAGE FOUND");
  })
}

export { createCustomGUITransforms }