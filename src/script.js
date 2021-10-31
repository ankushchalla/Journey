import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import CANNON, { Vec3 } from 'cannon'

/**
 * Debug
 */
const gui = new dat.GUI()


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Objects
 */
// Road
const geometry = new THREE.PlaneGeometry( .7, 10 );
const material = new THREE.MeshBasicMaterial();
const plane = new THREE.Mesh( geometry, material );
plane.rotation.x = - Math.PI * .5    
gui.add(plane.position, 'z').min(0).max(3).step(.01)

console.log(geometry);
// plane.rotation.y = - Math.PI * .25
scene.add( plane );

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.filmGauge = 40

const cameraHeight = .5
camera.position.set(0, cameraHeight, 4)
gui.add(camera.position, 'z').min(-3).max(10).step(.01).name('camera z')
scene.add(camera)

const planeHeight = geometry.parameters.height
const shift = camera.position.z - (plane.position.z + (planeHeight / 2))
console.log(camera.position.z - (plane.position.z + (planeHeight / 2)));
plane.position.z = plane.position.z + (shift - 1)


// Ring
const ringThickness = .1
const ringGeometry = new THREE.RingGeometry(geometry.parameters.width, geometry.parameters.width + ringThickness, 32)
const ringMaterial = new THREE.MeshBasicMaterial()
const ring = new THREE.Mesh(ringGeometry, ringMaterial)
scene.add(ring)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)


/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    // controls.update()
    // camera.position.z = camera.position.z - .001

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()