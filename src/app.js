import './main.scss'

import Scene from '../static/js/Scene' // Création de la scène + renderer + camera
import Mouse from '../static/js/Mouse' // Obtenir la position de la souris dans tous les environnement
import PaperMorph from '../static/js/PaperMorph' // Template de plane
import Control from '../static/js/Control' // Orbitcontrol (pour le debbugage)


const scene = new Scene({
    canvas: document.querySelector('.webgl'),
})

const paperMorph = new PaperMorph({
    scene: scene,
    color: 'pasteque'
})

const mouse = new Mouse({
    scene: scene
})

const control = new Control({
    camera: scene.camera,
    renderer: scene.renderer
})

document.addEventListener('keydown', e => {
    console.log(`${e.key} touch pressed`)
})

function raf() {
    const deltaTime = scene.clock.getDelta()
    const elapsedTime = scene.clock.getElapsedTime()
    const lowestElapsedTime = elapsedTime / 11

    scene.renderer.render(scene.scene, scene.camera)

    paperMorph.update(elapsedTime)
    
    // Update controls
    control.controls.update()
    window.requestAnimationFrame(raf)
}

raf()