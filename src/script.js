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

// Textures
const textureLoader = new THREE.TextureLoader()
const starTexture = textureLoader.load('textures/particles/1.png')


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
    far: 300,
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
scene.add(ambientLight)

// Point light
const light = new THREE.PointLight( 0xffffff, .40, 10 );
gui.add(light, 'intensity').min(0).max(1).step(.001).name('point light intensity')
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

// Stars
const starGeometry = new THREE.BufferGeometry()
const numberOfStars = 3000
const starSize = .5
const positions = new Float32Array(numberOfStars * 3)

for (let i = 0; i < positions.length; i += 3) {
    // xyz value for each vertex (position of particle in 3d space).
    const randomNumber = Math.random() * Math.PI * 2
    const amplitude = Math.random() * cameraParams.far * .5
    const x = amplitude * Math.sin(randomNumber)
    const y = amplitude * Math.cos(randomNumber)
    const z = Math.random() * - roadParams.length + 20
    positions[i] = x
    positions[i + 1] = y
    positions[i + 2] = z
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
const starMaterial = new THREE.PointsMaterial({
    size: starSize,
    sizeAttenuation: true,
    transparent: true,
    alphaMap: starTexture,
    depthWrite: false,
    // Remember, blending looks better, but costs more.
    // blending: THREE.AdditiveBlending,
})

const stars = new THREE.Points(starGeometry, starMaterial)
scene.add(stars)


// Ring
const ringThickness = .1
const ringGeometry = new THREE.RingGeometry(roadGeometry.parameters.width, roadGeometry.parameters.width + ringThickness, 32)
const ringMaterial = new THREE.MeshBasicMaterial()
let currentRing = new THREE.Mesh(ringGeometry, ringMaterial)
currentRing.position.z = 40
scene.add(currentRing)

// Controls
const enableControls = true
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
let runAnimation = false

const potentialThetaSegments = [3, 4, 6, 8, 12, 24, 40]

let count = 0
const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    if (controls) controls.update()
    // camera.position.z = camera.position.z - .01
    // light.position.z = light.position.z - .01

    stars.rotation.z = elapsedTime * .1
    // console.log(elapsedTime);
    
    if (Math.floor(elapsedTime) % 5 === 0) {
        runAnimation = true
    }
    if (currentRing.position.z < - roadParams.length) {
        runAnimation = false
        scene.remove(currentRing)
        currentRing.geometry.dispose()
        const thetaSegments = potentialThetaSegments[Math.floor(Math.random() * potentialThetaSegments.length)]
        currentRing = new THREE.Mesh(
            new THREE.RingGeometry(roadGeometry.parameters.width, roadGeometry.parameters.width + ringThickness, thetaSegments),
            ringMaterial
        )
        currentRing.position.z = 20
        scene.add(currentRing)
        renderer.render(scene, camera)
    }
    if (runAnimation) currentRing.position.z = currentRing.position.z - .3

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()