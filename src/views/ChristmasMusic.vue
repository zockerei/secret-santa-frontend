<template>
  <div id="christmas-music-container" class="fixed inset-0">
    <!-- Overlay for song selection -->
    <div v-if="showOverlay" id="overlay">
      <ul>
        <li class="title">Select Music</li>
        
        <!-- Custom Songs Section -->
        <!-- TO ADD YOUR OWN SONGS: Uncomment and modify the section below -->
        <!-- 
        <li>
          <button class="btn" @click="loadAudio(0)" type="button">
            Song Name 1 by Artist 1
          </button>
        </li>
        <li>
          <button class="btn" @click="loadAudio(1)" type="button">
            Song Name 2 by Artist 2
          </button>
        </li>
        <li>
          <button class="btn" @click="loadAudio(2)" type="button">
            Song Name 3 by Artist 3
          </button>
        </li>
        -->
        
        <li v-if="customSongs.length === 0" class="info-text">
          No preset songs available. Upload your own music below!
        </li>
        
        <li v-for="(song, index) in customSongs" :key="index">
          <button class="btn" @click="loadAudio(index)" type="button">
            {{ song.title }}
          </button>
        </li>
        
        <li v-if="customSongs.length > 0" class="separator">OR</li>
        <li v-else class="separator-small"></li>
        
        <li>
          <input type="file" id="upload" @change="uploadAudio" accept="audio/aac,audio/m4a,audio/mp4" hidden />
          <label for="upload">Upload Your Music</label>
        </li>
      </ul>
    </div>
    
    <!-- Loading message -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="text-loading">Please Wait...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const { PI, sin, cos } = Math
const TAU = 2 * PI

// Helper functions
const map = (value, sMin, sMax, dMin, dMax) => {
  return dMin + ((value - sMin) / (sMax - sMin)) * (dMax - dMin)
}

const range = (n, m = 0) => Array(n).fill(m).map((i, j) => i + j)
const rand = (max, min = 0) => min + Math.random() * (max - min)
const randInt = (max, min = 0) => Math.floor(min + Math.random() * (max - min))
const randChoice = (arr) => arr[randInt(arr.length)]
const polar = (ang, r = 1) => [r * cos(ang), r * sin(ang)]

// Reactive state
const showOverlay = ref(true)
const isLoading = ref(false)

const customSongs = ref([
  {
    title: "Michael Bublé - It's Beginning to Look a Lot Like Christmas",
    url: '/music/track1.aac'
  },
  {
    title: 'Mariah Carey - All I Want for Christmas Is You',
    url: '/music/track2.aac'
  },
  {
    title: 'Dean Martin - Let It Snow',
    url: '/music/track3.aac'
  },
  {
    title: "Dean Martin - Baby, It's Cold Outside",
    url: '/music/track4.aac'
  }
])

// Three.js variables
let scene, camera, renderer, analyser, composer
let step = 0
let animationId = null
const uniforms = {
  time: { type: 'f', value: 0.0 },
  step: { type: 'f', value: 0.0 },
}

const params = {
  exposure: 1,
  bloomStrength: 0.7,
  bloomThreshold: 0,
  bloomRadius: 0.4,
}

const fftSize = 2048
const totalPoints = 4000

const listener = new THREE.AudioListener()
const audio = new THREE.Audio(listener)

// Load audio from preset
function loadAudio(index) {
  if (!customSongs.value[index]) return
  
  isLoading.value = true
  const file = customSongs.value[index].url

  const loader = new THREE.AudioLoader()
  loader.load(
    file,
    function (buffer) {
      audio.setBuffer(buffer)
      audio.play()
      analyser = new THREE.AudioAnalyser(audio, fftSize)
      initVisualization()
    },
    undefined,
    function (error) {
      console.error('Error loading audio:', error)
      isLoading.value = false
      alert('Failed to load audio file. Please try another one.')
    }
  )
}

// Upload audio file
function uploadAudio(event) {
  isLoading.value = true
  const files = event.target.files
  if (!files || files.length === 0) {
    isLoading.value = false
    return
  }

  const reader = new FileReader()

  reader.onload = function (file) {
    const arrayBuffer = file.target.result

    listener.context.decodeAudioData(
      arrayBuffer,
      function (audioBuffer) {
        audio.setBuffer(audioBuffer)
        audio.play()
        analyser = new THREE.AudioAnalyser(audio, fftSize)
        initVisualization()
      },
      function (error) {
        console.error('Error decoding audio:', error)
        isLoading.value = false
        alert('Failed to decode audio file. Please try a different file.')
      }
    )
  }

  reader.onerror = function () {
    console.error('Error reading file')
    isLoading.value = false
    alert('Failed to read file.')
  }

  reader.readAsArrayBuffer(files[0])
}

// Initialize Three.js visualization
function initVisualization() {
  showOverlay.value = false
  isLoading.value = false

  scene = new THREE.Scene()
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  
  const container = document.getElementById('christmas-music-container')
  container.appendChild(renderer.domElement)

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
  )
  camera.position.set(-0.09397456774197047, -2.5597086635726947, 24.420789670889008)
  camera.rotation.set(0.10443543723052419, -0.003827152981119352, 0.0004011488708739715)

  const format = renderer.capabilities.isWebGL2
    ? THREE.RedFormat
    : THREE.LuminanceFormat

  uniforms.tAudioData = {
    value: new THREE.DataTexture(analyser.data, fftSize / 2, 1, format),
  }

  addPlane(scene, uniforms, 3000)
  addSnow(scene, uniforms)

  range(10).forEach((i) => {
    addTree(scene, uniforms, totalPoints, [20, 0, -20 * i])
    addTree(scene, uniforms, totalPoints, [-20, 0, -20 * i])
  })

  const renderScene = new RenderPass(scene, camera)

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  )
  bloomPass.threshold = params.bloomThreshold
  bloomPass.strength = params.bloomStrength
  bloomPass.radius = params.bloomRadius

  composer = new EffectComposer(renderer)
  composer.addPass(renderScene)
  composer.addPass(bloomPass)

  addListeners()
  animate()
}

// Animation loop
function animate(time) {
  if (!analyser) return
  
  analyser.getFrequencyData()
  uniforms.tAudioData.value.needsUpdate = true
  step = (step + 1) % 1000
  uniforms.time.value = time
  uniforms.step.value = step
  composer.render()
  animationId = requestAnimationFrame(animate)
}

// Add Christmas trees
function addTree(scene, uniforms, totalPoints, treePosition) {
  const vertexShader = `
    attribute float mIndex;
    varying vec3 vColor;
    varying float opacity;
    uniform sampler2D tAudioData;

    float norm(float value, float min, float max) {
      return (value - min) / (max - min);
    }
    float lerp(float norm, float min, float max) {
      return (max - min) * norm + min;
    }
    float map(float value, float sourceMin, float sourceMax, float destMin, float destMax) {
      return lerp(norm(value, sourceMin, sourceMax), destMin, destMax);
    }

    void main() {
      vColor = color;
      vec3 p = position;
      vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
      float amplitude = texture2D(tAudioData, vec2(mIndex, 0.1)).r;
      float amplitudeClamped = clamp(amplitude - 0.4, 0.0, 0.6);
      float sizeMapped = map(amplitudeClamped, 0.0, 0.6, 0.5, 12.0);
      opacity = map(mvPosition.z, -200.0, 15.0, 0.0, 1.0);
      gl_PointSize = sizeMapped * (100.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `
  
  const fragmentShader = `
    varying vec3 vColor;
    varying float opacity;
    uniform sampler2D pointTexture;
    
    void main() {
      gl_FragColor = vec4(vColor, opacity);
      gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
    }
  `

  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      ...uniforms,
      pointTexture: {
        value: new THREE.TextureLoader().load('https://assets.codepen.io/3685267/spark1.png'),
      },
    },
    vertexShader,
    fragmentShader,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    vertexColors: true,
  })

  const geometry = new THREE.BufferGeometry()
  const positions = []
  const colors = []
  const sizes = []
  const phases = []
  const mIndexs = []

  const color = new THREE.Color()

  for (let i = 0; i < totalPoints; i++) {
    const t = Math.random()
    const y = map(t, 0, 1, -8, 10)
    const ang = map(t, 0, 1, 0, 6 * TAU) + (TAU / 2) * (i % 2)
    const [z, x] = polar(ang, map(t, 0, 1, 5, 0))

    const modifier = map(t, 0, 1, 1, 0)
    positions.push(x + rand(-0.3 * modifier, 0.3 * modifier))
    positions.push(y + rand(-0.3 * modifier, 0.3 * modifier))
    positions.push(z + rand(-0.3 * modifier, 0.3 * modifier))

    color.setHSL(map(i, 0, totalPoints, 1.0, 0.0), 0.8, 0.4)

    colors.push(color.r, color.g, color.b)
    phases.push(rand(1000))
    sizes.push(1)
    const mIndex = map(i, 0, totalPoints, 1.0, 0.0)
    mIndexs.push(mIndex)
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage)
  )
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
  geometry.setAttribute('phase', new THREE.Float32BufferAttribute(phases, 1))
  geometry.setAttribute('mIndex', new THREE.Float32BufferAttribute(mIndexs, 1))

  const tree = new THREE.Points(geometry, shaderMaterial)

  const [px, py, pz] = treePosition
  tree.position.x = px
  tree.position.y = py
  tree.position.z = pz

  scene.add(tree)
}

// Add snow effect
function addSnow(scene, uniforms) {
  const vertexShader = `
    attribute float size;
    attribute float phase;
    attribute float phaseSecondary;
    varying vec3 vColor;
    varying float opacity;
    uniform float time;
    uniform float step;

    float norm(float value, float min, float max) {
      return (value - min) / (max - min);
    }
    float lerp(float norm, float min, float max) {
      return (max - min) * norm + min;
    }
    float map(float value, float sourceMin, float sourceMax, float destMin, float destMax) {
      return lerp(norm(value, sourceMin, sourceMax), destMin, destMax);
    }

    void main() {
      float t = time * 0.0006;
      vColor = color;
      vec3 p = position;
      p.y = map(mod(phase + step, 1000.0), 0.0, 1000.0, 25.0, -8.0);
      p.x += sin(t + phase);
      p.z += sin(t + phaseSecondary);
      opacity = map(p.z, -150.0, 15.0, 0.0, 1.0);
      vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = size * (100.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `

  const fragmentShader = `
    uniform sampler2D pointTexture;
    varying vec3 vColor;
    varying float opacity;

    void main() {
      gl_FragColor = vec4(vColor, opacity);
      gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
    }
  `

  function createSnowSet(sprite) {
    const totalPoints = 300
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        ...uniforms,
        pointTexture: {
          value: new THREE.TextureLoader().load(sprite),
        },
      },
      vertexShader,
      fragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true,
    })

    const geometry = new THREE.BufferGeometry()
    const positions = []
    const colors = []
    const sizes = []
    const phases = []
    const phaseSecondaries = []

    const color = new THREE.Color()

    for (let i = 0; i < totalPoints; i++) {
      const [x, y, z] = [rand(25, -25), 0, rand(15, -150)]
      positions.push(x)
      positions.push(y)
      positions.push(z)

      color.set(randChoice(['#f1d4d4', '#f1f6f9', '#eeeeee', '#f1f1e8']))

      colors.push(color.r, color.g, color.b)
      phases.push(rand(1000))
      phaseSecondaries.push(rand(1000))
      sizes.push(rand(4, 2))
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
    geometry.setAttribute('phase', new THREE.Float32BufferAttribute(phases, 1))
    geometry.setAttribute('phaseSecondary', new THREE.Float32BufferAttribute(phaseSecondaries, 1))

    const mesh = new THREE.Points(geometry, shaderMaterial)
    scene.add(mesh)
  }

  const sprites = [
    'https://assets.codepen.io/3685267/snowflake1.png',
    'https://assets.codepen.io/3685267/snowflake2.png',
    'https://assets.codepen.io/3685267/snowflake3.png',
    'https://assets.codepen.io/3685267/snowflake4.png',
    'https://assets.codepen.io/3685267/snowflake5.png',
  ]
  sprites.forEach((sprite) => {
    createSnowSet(sprite)
  })
}

// Add ground plane
function addPlane(scene, uniforms, totalPoints) {
  const vertexShader = `
    attribute float size;
    attribute vec3 customColor;
    varying vec3 vColor;

    void main() {
      vColor = customColor;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `

  const fragmentShader = `
    uniform vec3 color;
    uniform sampler2D pointTexture;
    varying vec3 vColor;

    void main() {
      gl_FragColor = vec4(vColor, 1.0);
      gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
    }
  `

  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      ...uniforms,
      pointTexture: {
        value: new THREE.TextureLoader().load('https://assets.codepen.io/3685267/spark1.png'),
      },
    },
    vertexShader,
    fragmentShader,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    vertexColors: true,
  })

  const geometry = new THREE.BufferGeometry()
  const positions = []
  const colors = []
  const sizes = []

  const color = new THREE.Color()

  for (let i = 0; i < totalPoints; i++) {
    const [x, y, z] = [rand(-25, 25), 0, rand(-150, 15)]
    positions.push(x)
    positions.push(y)
    positions.push(z)

    color.set(randChoice(['#93abd3', '#f2f4c0', '#9ddfd3']))

    colors.push(color.r, color.g, color.b)
    sizes.push(1)
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage)
  )
  geometry.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))

  const plane = new THREE.Points(geometry, shaderMaterial)
  plane.position.y = -8
  scene.add(plane)
}

// Add event listeners
function addListeners() {
  window.addEventListener('resize', onWindowResize, false)
}

function onWindowResize() {
  if (!camera || !renderer || !composer) return
  
  const width = window.innerWidth
  const height = window.innerHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()

  renderer.setSize(width, height)
  composer.setSize(width, height)
}

// Cleanup on unmount
onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (audio) {
    audio.stop()
  }
  if (renderer) {
    renderer.dispose()
  }
  window.removeEventListener('resize', onWindowResize)
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

#christmas-music-container {
  margin: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #161616;
  color: #c5a880;
  font-family: sans-serif;
}

#overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #161616;
  z-index: 1000;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #161616;
  z-index: 1001;
}

label {
  display: inline-block;
  background-color: #161616;
  padding: 16px;
  border-radius: 10px;
  cursor: pointer;
  margin-top: 1rem;
  width: 300px;
  border: 1px solid #c5a880;
  text-align: center;
  transition: all 0.3s ease;
}

label:hover {
  background-color: #c5a880;
  color: #161616;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(197, 168, 128, 0.3);
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.btn {
  background-color: #161616;
  border-radius: 10px;
  color: #c5a880;
  border: 1px solid #c5a880;
  padding: 16px;
  width: 300px;
  margin-bottom: 16px;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: sans-serif;
}

.btn:hover {
  background-color: #c5a880;
  color: #161616;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(197, 168, 128, 0.3);
}

.separator {
  font-weight: bold;
  text-align: center;
  width: 300px;
  margin: 16px 0px;
  color: #a07676;
}

.separator-small {
  height: 8px;
}

.title {
  color: #c5a880;
  font-weight: bold;
  font-size: 1.5rem;
  margin-bottom: 24px;
  text-align: center;
}

.info-text {
  color: #a07676;
  font-size: 0.95rem;
  margin-bottom: 16px;
  text-align: center;
  width: 300px;
  line-height: 1.6;
}

.text-loading {
  font-size: 2rem;
  color: #c5a880;
}

.back-button-container {
  margin-top: 24px;
}

.back-btn {
  display: inline-block;
  background-color: #161616;
  padding: 12px 24px;
  border-radius: 10px;
  color: #a07676;
  border: 1px solid #a07676;
  text-align: center;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.back-btn:hover {
  background-color: #a07676;
  color: #161616;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(160, 118, 118, 0.3);
}
</style>

