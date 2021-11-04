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
 * Camera
 */
// Base camera
const cameraParams = {
    fov: 45, 
    near: 0.1, 
    far: 100,
    // Camera 'looks down' at the road a little bit. 
    rotationX: -.2,
    height: 3,
    z: 20
}
const camera = new THREE.PerspectiveCamera(cameraParams.fov, sizes.width / sizes.height, cameraParams.near, cameraParams.far)
camera.rotation.x = cameraParams.rotationX
camera.position.set(0, cameraParams.height, cameraParams.z)
gui.add(camera.position, 'z').min(-3).max(20).step(.01).name('camera z')
scene.add(camera)

/**
 * Lights
 */
// Ambient Light
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

// Point light
const light = new THREE.PointLight( 0xffffff, .40, 10 );
gui.add(light, 'intensity').min(0).max(1).step(.001).name('point light intensity')
gui.add(light, 'distance').min(0).max(10).step(.01)
light.position.set(0, 4, 20)
scene.add(light)

const pointLightHelper = new THREE.PointLightHelper( light, 1)
scene.add(pointLightHelper)

/**
 * Objects
 */
// Road
const roadParams = {
    width: 4, 
    length: 100,
    rotationX: - Math.PI * .5
}
const roadGeometry = new THREE.PlaneGeometry( roadParams.width, roadParams.length );
const roadMaterial = new THREE.MeshStandardMaterial({ color: '#b9d5ff' })
const road = new THREE.Mesh( roadGeometry, roadMaterial );
road.rotation.x = roadParams.rotationX   
scene.add( road );

road.position.z = camera.position.z - (roadParams.length / 2)

const testCube = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshBasicMaterial({ color: 'red' })
)
testCube.position.set(0, 4, 20)
scene.add(testCube)


// Ring
const ringThickness = .1
const ringGeometry = new THREE.RingGeometry(roadGeometry.parameters.width, roadGeometry.parameters.width + ringThickness, 32)
const ringMaterial = new THREE.MeshBasicMaterial()
const ring = new THREE.Mesh(ringGeometry, ringMaterial)
scene.add(ring)

// Controls
const enableControls = false
const controls = enableControls ? new OrbitControls(camera, canvas) : null
if (controls) controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setClearColor('#19262e')


/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    if (controls) controls.update()
    camera.position.z = camera.position.z - .01
    light.position.z = light.position.z - .01

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()