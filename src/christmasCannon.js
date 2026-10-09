// The Christmas Cannon: a little living room that gets decorated by firing presents,
// ornaments, stars, candy canes and fairy lights out of a cannon.
// Everything is built from code, so the page needs no model files or CDNs.
import * as THREE from 'three'
import * as CANNON from 'cannon-es'

const GRAVITY = -60
const MAX_SHOTS = 200 // the oldest shot disappears after this many, to keep it smooth
const AUTO_FIRE_INTERVAL = 0.15 // seconds between shots while the pointer is held down
const LIGHT_POOL_SIZE = 6 // fairy lights are real lights, and adding lights to a scene is slow, so they are reused

// The room spans -20..20 on x and z, the floor is at y = 0, the cannon stands in the front corner
const CANNON_POSITION = new THREE.Vector3(36, 0, 16)
const PIVOT_HEIGHT = 3.8
const MUZZLE_DISTANCE = 6.5
const PIVOT = CANNON_POSITION.clone().setY(PIVOT_HEIGHT)
const CAMERA_TARGET = new THREE.Vector3(0, 2, 0)
const CAMERA_OFFSET = new THREE.Vector3(55, 38, 55)

const FESTIVE_COLORS = [0xc0392b, 0x1e8449, 0xf1c40f, 0x2e86c1, 0x8e44ad, 0xe67e22, 0xecf0f1]

const rand = (min, max) => min + Math.random() * (max - min)
const pick = (list) => list[Math.floor(Math.random() * list.length)]
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export function createChristmasCannon(container, { onShot = () => {} } = {}) {
  // Everything that has to be disposed when the page is left
  const owned = new Set()
  const own = (resource) => {
    owned.add(resource)
    return resource
  }

  // --- Renderer, scene, camera ---------------------------------------------------------

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x262a4f)
  scene.fog = new THREE.Fog(0x262a4f, 140, 280)

  const camera = new THREE.PerspectiveCamera(40, 1, 1, 500)

  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x5a5f8f, 1.4))

  const sun = new THREE.DirectionalLight(0xffffff, 2.2)
  sun.position.set(35, 70, 20)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  Object.assign(sun.shadow.camera, { left: -50, right: 50, top: 50, bottom: -50, near: 1, far: 160 })
  sun.shadow.bias = -0.0005
  sun.shadow.normalBias = 0.05
  scene.add(sun)

  // --- Physics -------------------------------------------------------------------------

  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, GRAVITY, 0), allowSleep: true })
  world.broadphase = new CANNON.SAPBroadphase(world)

  const solidMaterial = new CANNON.Material('solid')
  const bouncyMaterial = new CANNON.Material('bouncy')
  world.addContactMaterial(new CANNON.ContactMaterial(solidMaterial, solidMaterial, { friction: 0.4, restitution: 0.15 }))
  world.addContactMaterial(new CANNON.ContactMaterial(bouncyMaterial, solidMaterial, { friction: 0.3, restitution: 0.6 }))
  world.addContactMaterial(new CANNON.ContactMaterial(bouncyMaterial, bouncyMaterial, { friction: 0.3, restitution: 0.6 }))

  const vec = (x, y, z) => new CANNON.Vec3(x, y, z)
  const boxShape = ([w, h, d]) => new CANNON.Box(vec(w / 2, h / 2, d / 2))

  function createBody({ mass = 0, material = solidMaterial, position = [0, 0, 0], shapes = [] }) {
    const body = new CANNON.Body({ mass, material, position: vec(...position) })
    for (const { shape, offset = [0, 0, 0] } of shapes) body.addShape(shape, vec(...offset))
    if (mass > 0) {
      body.linearDamping = 0.05
      body.angularDamping = 0.3
      body.sleepSpeedLimit = 0.4
    }
    return body
  }

  // --- Shared geometries and materials -------------------------------------------------

  const unitBox = own(new THREE.BoxGeometry(1, 1, 1))
  const unitSphere = own(new THREE.SphereGeometry(1, 24, 16))
  const unitCylinder = own(new THREE.CylinderGeometry(1, 1, 1, 16))

  const materialCache = new Map()
  function material(color, options = {}) {
    const key = `${color}-${JSON.stringify(options)}`
    if (!materialCache.has(key)) {
      materialCache.set(key, own(new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...options })))
    }
    return materialCache.get(key)
  }

  function mesh(geometry, meshMaterial, { position, scale, rotation, shadows = true } = {}) {
    const result = new THREE.Mesh(geometry, meshMaterial)
    if (position) result.position.set(...position)
    if (scale) result.scale.set(...(Array.isArray(scale) ? scale : [scale, scale, scale]))
    if (rotation) result.rotation.set(...rotation)
    result.castShadow = shadows
    result.receiveShadow = shadows
    return result
  }

  function canvasTexture(size, draw) {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    draw(canvas.getContext('2d'), size)
    const texture = own(new THREE.CanvasTexture(canvas))
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    return texture
  }

  // Wrapping paper with a pattern and a ribbon across every side
  const PAPERS = [
    { paper: '#c0392b', pattern: 'dots', ink: '#ffffff', ribbon: '#f4d03f' },
    { paper: '#1e8449', pattern: 'stripes', ink: '#2ecc71', ribbon: '#c0392b' },
    { paper: '#2c3e8f', pattern: 'snow', ink: '#ffffff', ribbon: '#dfe6e9' },
    { paper: '#d4ac0d', pattern: 'dots', ink: '#c0392b', ribbon: '#1e8449' },
    { paper: '#f5f5f5', pattern: 'stripes', ink: '#e74c3c', ribbon: '#1e8449' },
    { paper: '#6c3483', pattern: 'snow', ink: '#f4d03f', ribbon: '#f4d03f' }
  ]
  const presentMaterials = PAPERS.map(({ paper, pattern, ink, ribbon }) =>
    own(new THREE.MeshStandardMaterial({
      roughness: 0.55,
      map: canvasTexture(256, (g, size) => {
        g.fillStyle = paper
        g.fillRect(0, 0, size, size)
        g.fillStyle = ink
        g.strokeStyle = ink
        g.lineWidth = 3
        for (let y = 16; y < size; y += 32) {
          for (let x = Math.floor(y / 32) % 2 ? 32 : 16; x < size; x += 32) {
            if (pattern === 'dots') {
              g.beginPath()
              g.arc(x, y, 5, 0, Math.PI * 2)
              g.fill()
            } else if (pattern === 'snow') {
              for (let i = 0; i < 3; i++) {
                const a = (i * Math.PI) / 3
                g.beginPath()
                g.moveTo(x - Math.cos(a) * 7, y - Math.sin(a) * 7)
                g.lineTo(x + Math.cos(a) * 7, y + Math.sin(a) * 7)
                g.stroke()
              }
            }
          }
        }
        if (pattern === 'stripes') {
          for (let i = -size; i < size * 2; i += 40) {
            g.beginPath()
            g.moveTo(i, 0)
            g.lineTo(i + size, size)
            g.lineWidth = 14
            g.stroke()
          }
        }
        g.fillStyle = ribbon
        g.fillRect(size * 0.42, 0, size * 0.16, size)
        g.fillRect(0, size * 0.42, size, size * 0.16)
      })
    }))
  )

  const ornamentMaterials = FESTIVE_COLORS.map((color) => material(color, { metalness: 0.6, roughness: 0.2 }))
  const gold = material(0xd4af37, { metalness: 1, roughness: 0.3 })

  const starGeometry = (() => {
    const shape = new THREE.Shape()
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 ? 0.55 : 1.3
      const angle = (i / 10) * Math.PI * 2 + Math.PI / 2
      const point = [Math.cos(angle) * radius, Math.sin(angle) * radius]
      i ? shape.lineTo(...point) : shape.moveTo(...point)
    }
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 2 })
    geometry.center()
    geometry.rotateX(-Math.PI / 2) // lying flat, so the physics cylinder (along y) fits
    return own(geometry)
  })()
  const starMaterial = material(0xffd54a, { metalness: 0.8, roughness: 0.25, emissive: 0x7a5200, emissiveIntensity: 0.4 })

  const candyCaneGeometry = (() => {
    const points = [[0, -2.5], [0, -0.5], [0, 1.5]]
    for (let i = 3; i >= 0; i--) points.push([0.8 + Math.cos((i * Math.PI) / 4) * 0.8, 1.5 + Math.sin((i * Math.PI) / 4) * 0.8])
    points.push([1.6, 1.0])
    const curve = new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x, y, 0)))
    return own(new THREE.TubeGeometry(curve, 48, 0.3, 10))
  })()
  const candyCaneMaterial = own(new THREE.MeshStandardMaterial({
    roughness: 0.35,
    map: (() => {
      const texture = canvasTexture(64, (g, size) => {
        g.fillStyle = '#ffffff'
        g.fillRect(0, 0, size, size)
        g.fillStyle = '#d0212f'
        for (let i = -size; i < size * 2; i += 32) {
          g.beginPath()
          g.moveTo(i, 0)
          g.lineTo(i + 14, 0)
          g.lineTo(i + 14 + size, size)
          g.lineTo(i + size, size)
          g.fill()
        }
      })
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(10, 1)
      return texture
    })()
  }))

  const cone = own(new THREE.ConeGeometry(1, 1, 18))

  // --- The room ------------------------------------------------------------------------

  const aimTargets = [] // what the pointer can aim at

  function addStatic(object, shapes) {
    scene.add(object)
    aimTargets.push(object)
    if (shapes) world.addBody(createBody({ position: object.position.toArray(), shapes }))
  }

  const ground = mesh(own(new THREE.PlaneGeometry(600, 600)), material(0x8f9ac8, { roughness: 1 }), { rotation: [-Math.PI / 2, 0, 0] })
  scene.add(ground)
  aimTargets.push(ground)
  const groundBody = createBody({ shapes: [{ shape: new CANNON.Plane() }] })
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
  world.addBody(groundBody)

  const floor = mesh(unitBox, material(0xb98b5e, { roughness: 0.6 }), { position: [0, -0.2, 0], scale: [40, 0.5, 40] })
  scene.add(floor)
  scene.add(mesh(unitBox, material(0x9e1b2a, { roughness: 1 }), { position: [3, 0.08, 2], scale: [20, 0.1, 26] }))

  const wallMaterial = material(0xefe2cf)
  addStatic(mesh(unitBox, wallMaterial, { position: [0, 12.5, -20.5], scale: [42, 25, 1] }), [{ shape: boxShape([42, 25, 1]) }])
  addStatic(mesh(unitBox, wallMaterial, { position: [-20.5, 12.5, 0], scale: [1, 25, 40] }), [{ shape: boxShape([1, 25, 40]) }])

  // A window in the side wall, looking out into the night
  const windowFrame = new THREE.Group()
  windowFrame.position.set(-19.9, 13, 2)
  windowFrame.add(mesh(own(new THREE.PlaneGeometry(10, 8)), own(new THREE.MeshBasicMaterial({ color: 0x1b2b63 })), { rotation: [0, Math.PI / 2, 0], shadows: false }))
  for (const [y, z, h, d] of [[4, 0, 0.6, 10.6], [-4, 0, 0.6, 10.6], [0, 5, 8, 0.6], [0, -5, 8, 0.6], [0, 0, 8, 0.3], [0, 0, 0.3, 10]]) {
    windowFrame.add(mesh(unitBox, material(0xffffff), { position: [0.1, y, z], scale: [0.3, h, d] }))
  }
  scene.add(windowFrame)

  // Fireplace against the back wall, with a flickering fire
  const fireplace = new THREE.Group()
  fireplace.position.set(0, 0, -18.5)
  const brick = material(0x9c4a3a)
  const fireplaceParts = [
    { size: [2.5, 10, 3], at: [-5.25, 5, 0], material: brick },
    { size: [2.5, 10, 3], at: [5.25, 5, 0], material: brick },
    { size: [8, 2.5, 3], at: [0, 8.75, 0], material: brick },
    { size: [15, 0.8, 4], at: [0, 10.4, 0.2], material: material(0xf4ede1) },
    { size: [15, 0.6, 5], at: [0, 0.3, 1], material: material(0x7d7d7d) },
    { size: [8, 7.5, 0.4], at: [0, 3.75, -1.3], material: material(0x1a1110), solid: false }
  ]
  for (const { size, at, material: partMaterial } of fireplaceParts) {
    fireplace.add(mesh(unitBox, partMaterial, { position: at, scale: size }))
  }
  // Stockings on the mantel
  for (const x of [-4, 4]) {
    fireplace.add(mesh(unitBox, material(0xc0392b), { position: [x, 8.3, 2.3], scale: [1.4, 2.6, 0.5] }))
    fireplace.add(mesh(unitBox, material(0xc0392b), { position: [x + 0.6, 7.3, 2.3], scale: [2, 1, 0.5] }))
    fireplace.add(mesh(unitBox, material(0xffffff), { position: [x, 9.6, 2.3], scale: [1.7, 0.7, 0.6] }))
  }
  const flames = [0xff5a1f, 0xff9a1f, 0xffd54a].map((color, i) => {
    const flame = mesh(cone, own(new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 })), {
      position: [(i - 1) * 1.2, 1.6, 0], scale: [1.2 - i * 0.2, 2.5, 1.2 - i * 0.2], shadows: false
    })
    fireplace.add(flame)
    return flame
  })
  const fireLight = new THREE.PointLight(0xff8a3d, 150, 45, 2)
  fireLight.position.set(0, 3, 2.5)
  fireplace.add(fireLight)
  addStatic(fireplace, fireplaceParts.filter((part) => part.solid !== false).map(({ size, at }) => ({ shape: boxShape(size), offset: at })))

  // Fairy lights along the top of the walls
  const garlandSpots = []
  for (let i = 0; i <= 20; i++) garlandSpots.push([-19.6 + i * 1.95, 23 - Math.sin((i / 20) * Math.PI * 3) ** 2 * 1.5, -19.8])
  for (let i = 1; i <= 20; i++) garlandSpots.push([-19.8, 23 - Math.sin((i / 20) * Math.PI * 3) ** 2 * 1.5, -19.6 + i * 1.95])
  const garland = new THREE.InstancedMesh(unitSphere, own(new THREE.MeshBasicMaterial()), garlandSpots.length)
  garlandSpots.forEach((spot, i) => {
    garland.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(...spot), new THREE.Quaternion(), new THREE.Vector3(0.35, 0.45, 0.35)))
    garland.setColorAt(i, new THREE.Color(FESTIVE_COLORS[i % 5]))
  })
  scene.add(garland)

  // Snow falling outside the room
  const SNOWFLAKES = 1200
  const snowPositions = new Float32Array(SNOWFLAKES * 3)
  for (let i = 0; i < SNOWFLAKES; i++) {
    let x, z
    do {
      x = rand(-160, 160)
      z = rand(-160, 160)
    } while (Math.abs(x) < 24 && Math.abs(z) < 24)
    snowPositions.set([x, rand(0, 100), z], i * 3)
  }
  const snowGeometry = own(new THREE.BufferGeometry())
  snowGeometry.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3))
  const snow = new THREE.Points(snowGeometry, own(new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.8,
    transparent: true,
    depthWrite: false,
    map: canvasTexture(32, (g, size) => {
      const gradient = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
      gradient.addColorStop(0, 'rgba(255,255,255,1)')
      gradient.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = gradient
      g.fillRect(0, 0, size, size)
    })
  })))
  scene.add(snow)

  // --- Furniture: boxes that fall into the room at the start --------------------------

  function compound(parts, { mass, position }) {
    const group = new THREE.Group()
    const shapes = []
    for (const { size, at, color, solid = true, options } of parts) {
      group.add(mesh(unitBox, material(color, options), { position: at, scale: size }))
      if (solid) shapes.push({ shape: boxShape(size), offset: at })
    }
    return { mesh: group, body: createBody({ mass, position, shapes }) }
  }

  const FURNITURE = [
    { // Sofa, facing the TV
      mass: 20,
      position: [12, 14, 2],
      parts: [
        { size: [8, 3, 20], at: [0, 1.5, 0], color: 0xa61b29 },
        { size: [6.5, 1, 9.6], at: [-0.6, 3.5, -4.9], color: 0xc62a3a },
        { size: [6.5, 1, 9.6], at: [-0.6, 3.5, 4.9], color: 0xc62a3a },
        { size: [2, 6, 20], at: [3, 5, 0], color: 0xa61b29 },
        { size: [8, 5, 2], at: [0, 2.5, -11], color: 0x8e1622 },
        { size: [8, 5, 2], at: [0, 2.5, 11], color: 0x8e1622 },
        { size: [1, 2.6, 2.6], at: [1.4, 5.3, -6.5], color: 0x1e8449 },
        { size: [1, 2.6, 2.6], at: [1.4, 5.3, 6.5], color: 0xf5f5f5 }
      ]
    },
    { // Coffee table
      mass: 8,
      position: [0, 22, 2],
      parts: [
        { size: [6, 0.6, 12], at: [0, 3.6, 0], color: 0x8b5a2b },
        ...[[-2.4, -5.4], [2.4, -5.4], [-2.4, 5.4], [2.4, 5.4]].map(([x, z]) => ({ size: [0.6, 3.3, 0.6], at: [x, 1.65, z], color: 0x6e4420 }))
      ]
    },
    { // TV stand
      mass: 15,
      position: [-16, 10, 0],
      parts: [{ size: [4.5, 4, 16], at: [0, 2, 0], color: 0x4a3426 }]
    },
    { // TV, facing the sofa
      mass: 4,
      position: [-16, 28, 0],
      parts: [
        { size: [2.5, 0.4, 6], at: [0, 0.2, 0], color: 0x222222 },
        { size: [0.6, 1.5, 1], at: [0, 1.1, 0], color: 0x222222 },
        { size: [0.8, 8, 14], at: [0, 5.8, 0], color: 0x111111 },
        { size: [0.1, 7.2, 13.2], at: [0.45, 5.8, 0], color: 0x3a6ea5, solid: false, options: { emissive: 0x2a5d9f, emissiveIntensity: 0.8 } }
      ]
    }
  ]

  let furniture = []
  function dropFurniture() {
    furniture = FURNITURE.map(({ parts, mass, position }) => {
      const item = compound(parts, { mass, position })
      item.body.velocity.set(0, -20, 0)
      scene.add(item.mesh)
      world.addBody(item.body)
      aimTargets.push(item.mesh)
      return item
    })
  }
  dropFurniture()

  // --- The cannon ----------------------------------------------------------------------

  const cannon = new THREE.Group()
  cannon.position.copy(CANNON_POSITION)
  scene.add(cannon)

  const wood = material(0x5b3a1e)
  cannon.add(mesh(unitBox, material(0x1d5c34), { position: [0, 2.2, -0.5], scale: [3.6, 1.6, 6] }))
  for (const x of [-2.4, 2.4]) {
    cannon.add(mesh(unitCylinder, wood, { position: [x, 2.2, 0], scale: [2.2, 0.6, 2.2], rotation: [0, 0, Math.PI / 2] }))
    cannon.add(mesh(unitCylinder, gold, { position: [x * 1.1, 2.2, 0], scale: [0.6, 0.6, 0.6], rotation: [0, 0, Math.PI / 2] }))
  }

  const barrelPivot = new THREE.Group()
  barrelPivot.position.y = PIVOT_HEIGHT
  cannon.add(barrelPivot)
  const barrel = new THREE.Group() // moves back on recoil
  barrelPivot.add(barrel)

  const barrelGeometry = own(new THREE.CylinderGeometry(1.25, 1.7, 8, 28).rotateX(Math.PI / 2)) // muzzle towards +z
  barrel.add(mesh(barrelGeometry, material(0xb3122e, { metalness: 0.4, roughness: 0.35 }), { position: [0, 0, 1.5] }))
  barrel.add(mesh(unitSphere, material(0xb3122e, { metalness: 0.4, roughness: 0.35 }), { position: [0, 0, -2.5], scale: 1.7 }))
  barrel.add(mesh(unitSphere, gold, { position: [0, 0, -4.4], scale: 0.6 }))
  const ring = own(new THREE.TorusGeometry(1, 0.22, 10, 28))
  for (const [z, radius] of [[5.5, 1.3], [3, 1.42], [-0.5, 1.68]]) {
    barrel.add(mesh(ring, gold, { position: [0, 0, z], scale: radius }))
  }
  barrel.add(mesh(own(new THREE.CircleGeometry(1.05, 24)), material(0x110a0a), { position: [0, 0, 5.52], shadows: false }))

  const flash = mesh(unitSphere, own(new THREE.MeshBasicMaterial({ color: 0xffc46b, transparent: true, opacity: 0, depthWrite: false })), { position: [0, 0, MUZZLE_DISTANCE], shadows: false })
  barrel.add(flash)
  const flashLight = new THREE.PointLight(0xffb347, 0, 60, 2)
  flashLight.position.z = MUZZLE_DISTANCE + 1
  barrel.add(flashLight)

  let recoil = 0
  let flashAmount = 0
  const aim = { yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0 }

  // --- Things to shoot -----------------------------------------------------------------

  function present() {
    const size = [rand(1.5, 4), rand(1.5, 4), rand(1.5, 4)]
    return {
      mesh: mesh(unitBox, pick(presentMaterials), { scale: size }),
      body: createBody({ mass: clamp(size[0] * size[1] * size[2] * 0.05, 0.5, 3), shapes: [{ shape: boxShape(size) }] })
    }
  }

  function ornament() {
    const radius = rand(0.7, 1.2)
    const group = new THREE.Group()
    group.add(mesh(unitSphere, pick(ornamentMaterials), { scale: radius }))
    group.add(mesh(unitCylinder, gold, { position: [0, radius, 0], scale: [radius * 0.3, radius * 0.4, radius * 0.3] }))
    return { mesh: group, body: createBody({ mass: 0.5, material: bouncyMaterial, shapes: [{ shape: new CANNON.Sphere(radius) }] }) }
  }

  function star() {
    return {
      mesh: mesh(starGeometry, starMaterial),
      body: createBody({ mass: 0.5, shapes: [{ shape: new CANNON.Cylinder(1.2, 1.2, 0.5, 10) }] })
    }
  }

  function candyCane() {
    return {
      mesh: mesh(candyCaneGeometry, candyCaneMaterial),
      body: createBody({
        mass: 0.4,
        shapes: [
          { shape: boxShape([0.6, 4, 0.6]), offset: [0, -0.5, 0] },
          { shape: boxShape([1.6, 0.6, 0.6]), offset: [0.8, 2, 0] },
          { shape: boxShape([0.6, 0.8, 0.6]), offset: [1.6, 1.3, 0] }
        ]
      })
    }
  }

  const fairyLights = FESTIVE_COLORS.slice(0, LIGHT_POOL_SIZE).map((color) => {
    const group = new THREE.Group()
    group.add(mesh(unitSphere, material(color, { emissive: color, emissiveIntensity: 2.5 }), { scale: 0.6, shadows: false }))
    group.add(mesh(unitCylinder, material(0x333333), { position: [0, 0.6, 0], scale: [0.25, 0.4, 0.25] }))
    const light = new THREE.PointLight(color, 0, 30, 2)
    group.add(light)
    group.position.y = -100
    scene.add(group)
    return { mesh: group, light, item: null }
  })
  let nextFairyLight = 0

  function fairyLight() {
    const slot = fairyLights[nextFairyLight++ % fairyLights.length]
    if (slot.item) removeShot(slot.item)
    slot.light.intensity = 120
    slot.item = {
      mesh: slot.mesh,
      body: createBody({ mass: 0.3, material: bouncyMaterial, shapes: [{ shape: new CANNON.Sphere(0.6) }] }),
      pooled: true,
      onRemove() {
        slot.light.intensity = 0
        slot.mesh.position.y = -100
        slot.item = null
      }
    }
    return slot.item
  }

  function tree() {
    const group = new THREE.Group()
    group.add(mesh(unitCylinder, material(0xa0522d), { position: [0, 1.5, 0], scale: [2, 3, 2] }))
    group.add(mesh(unitCylinder, wood, { position: [0, 3.5, 0], scale: [0.6, 2, 0.6] }))
    const needles = material(0x2e7d32)
    for (const [y, radius, height] of [[6.5, 5, 6], [9.5, 4, 5], [12.3, 2.8, 4.5]]) {
      group.add(mesh(cone, needles, { position: [0, y, 0], scale: [radius, height, radius] }))
    }
    for (let i = 0; i < 14; i++) {
      const y = rand(4.5, 12.5)
      const radius = (14.5 - y) * 0.42 + 0.2
      const angle = rand(0, Math.PI * 2)
      group.add(mesh(unitSphere, pick(ornamentMaterials), { position: [Math.cos(angle) * radius, y, Math.sin(angle) * radius], scale: 0.4 }))
    }
    group.add(mesh(starGeometry, starMaterial, { position: [0, 15.2, 0], rotation: [Math.PI / 2, 0, 0] }))
    return {
      mesh: group,
      big: true,
      body: createBody({
        mass: 10,
        shapes: [
          { shape: new CANNON.Cylinder(2, 2, 3, 8), offset: [0, 1.5, 0] },
          { shape: new CANNON.Cylinder(0.6, 5, 11, 10), offset: [0, 9, 0] }
        ]
      })
    }
  }

  function snowman() {
    const group = new THREE.Group()
    const snowWhite = material(0xffffff, { roughness: 0.9 })
    const coal = material(0x111111)
    for (const [y, radius] of [[3, 3], [7.8, 2.3], [11.3, 1.6]]) group.add(mesh(unitSphere, snowWhite, { position: [0, y, 0], scale: radius }))
    for (const x of [-0.55, 0.55]) group.add(mesh(unitSphere, coal, { position: [x, 11.7, 1.4], scale: 0.2 }))
    for (const y of [7, 8, 9]) group.add(mesh(unitSphere, coal, { position: [0, y, 2.2], scale: 0.25 }))
    group.add(mesh(cone, material(0xff7f27), { position: [0, 11.2, 2.2], scale: [0.25, 1.4, 0.25], rotation: [Math.PI / 2, 0, 0] }))
    group.add(mesh(ring, material(0xc0392b), { position: [0, 9.9, 0], scale: [1.6, 1.6, 2.5], rotation: [Math.PI / 2, 0, 0] }))
    group.add(mesh(unitCylinder, coal, { position: [0, 12.7, 0], scale: [1.8, 0.2, 1.8] }))
    group.add(mesh(unitCylinder, coal, { position: [0, 13.8, 0], scale: [1.1, 2, 1.1] }))
    return {
      mesh: group,
      big: true,
      body: createBody({
        mass: 15,
        material: bouncyMaterial,
        shapes: [
          { shape: new CANNON.Sphere(3), offset: [0, 3, 0] },
          { shape: new CANNON.Sphere(2.3), offset: [0, 7.8, 0] },
          { shape: new CANNON.Sphere(1.6), offset: [0, 11.3, 0] }
        ]
      })
    }
  }

  function nextProjectile(shot) {
    if (shot === 10) return tree()
    if (shot === 50) return snowman()
    const roll = Math.random()
    if (roll < 0.35) return present()
    if (roll < 0.6) return ornament()
    if (roll < 0.75) return star()
    if (roll < 0.88) return candyCane()
    return fairyLight()
  }

  // --- Aiming and firing ---------------------------------------------------------------

  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const aimPoint = new THREE.Vector3(0, 0, 0)

  // Where the pointer points at in the room (or far away, when it points at the sky)
  function pointAt(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect()
    pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1)
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.intersectObjects(aimTargets, true)[0]
    const point = hit ? hit.point : raycaster.ray.at(200, new THREE.Vector3())
    // Not too far away and not under the floor
    const fromCannon = point.sub(PIVOT)
    const flat = Math.hypot(fromCannon.x, fromCannon.z)
    if (flat > 120) fromCannon.multiplyScalar(120 / flat)
    aimPoint.copy(fromCannon.add(PIVOT))
    aimPoint.y = Math.max(aimPoint.y, 0)
  }

  // The launch velocity that lands on the target; far away targets get a higher, longer arc
  function launchVelocity(from, to) {
    const distance = Math.hypot(to.x - from.x, to.z - from.z)
    const time = clamp(0.55 + distance / 45, 0.6, 2.4)
    const velocity = new THREE.Vector3().subVectors(to, from).divideScalar(time)
    velocity.y -= 0.5 * GRAVITY * time
    return velocity
  }

  function setAimTarget() {
    const velocity = launchVelocity(PIVOT, aimPoint)
    aim.targetYaw = Math.atan2(velocity.x, velocity.z)
    aim.targetPitch = clamp(Math.atan2(velocity.y, Math.hypot(velocity.x, velocity.z)), -0.1, 1.4)
  }

  let shots = []
  let shotCount = 0

  // Start out pointing at the middle of the room
  setAimTarget()
  aim.yaw = aim.targetYaw
  aim.pitch = aim.targetPitch

  function removeShot(item) {
    world.removeBody(item.body)
    if (item.onRemove) item.onRemove()
    else scene.remove(item.mesh)
    shots = shots.filter((shot) => shot !== item)
  }

  function fire() {
    setAimTarget()
    aim.yaw = aim.targetYaw
    aim.pitch = aim.targetPitch

    const direction = new THREE.Vector3(
      Math.sin(aim.yaw) * Math.cos(aim.pitch),
      Math.sin(aim.pitch),
      Math.cos(aim.yaw) * Math.cos(aim.pitch)
    )
    const muzzle = PIVOT.clone().addScaledVector(direction, MUZZLE_DISTANCE)
    const velocity = launchVelocity(muzzle, aimPoint)

    shotCount++
    const item = nextProjectile(shotCount)
    const { body } = item
    body.position.set(muzzle.x, muzzle.y, muzzle.z)
    body.quaternion.setFromEuler(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI))
    if (item.big) body.quaternion.setFromEuler(0, aim.yaw, 0)
    body.velocity.set(velocity.x, velocity.y, velocity.z)
    const spin = item.big ? 1 : 8
    body.angularVelocity.set(rand(-spin, spin), rand(-spin, spin), rand(-spin, spin))

    if (!item.pooled) scene.add(item.mesh)
    world.addBody(body)
    shots.push(item)
    sync(item)
    if (shots.length > MAX_SHOTS) removeShot(shots.find((shot) => !shot.big) ?? shots[0])

    recoil = 1
    flashAmount = 1
    lastShotAt = elapsed
    onShot(shotCount)
  }

  // --- Input ---------------------------------------------------------------------------

  let pointerDown = false
  let lastShotAt = -Infinity

  function onPointerMove(event) {
    pointAt(event.clientX, event.clientY)
    setAimTarget()
  }
  function onPointerDown(event) {
    if (event.button !== 0) return
    pointerDown = true
    renderer.domElement.setPointerCapture(event.pointerId)
    pointAt(event.clientX, event.clientY)
    fire()
  }
  function onPointerUp() {
    pointerDown = false
  }
  function onKeyDown(event) {
    if ((event.code === 'Space' || event.code === 'Enter') && event.target === document.body) {
      event.preventDefault()
      fire()
    }
  }

  const canvas = renderer.domElement
  canvas.style.touchAction = 'none'
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointercancel', onPointerUp)
  window.addEventListener('keydown', onKeyDown)

  // --- Size ----------------------------------------------------------------------------

  function resize() {
    const { clientWidth: width, clientHeight: height } = container
    if (!width || !height) return
    renderer.setSize(width, height)
    camera.aspect = width / height
    // Narrow screens see the room from further away, so it still fits
    camera.position.copy(CAMERA_TARGET).addScaledVector(CAMERA_OFFSET, clamp(1.3 / camera.aspect, 1, 2.3))
    camera.lookAt(CAMERA_TARGET)
    camera.updateProjectionMatrix()
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)
  resize()

  // --- Loop ----------------------------------------------------------------------------

  function sync({ mesh: object, body }) {
    object.position.copy(body.position)
    object.quaternion.copy(body.quaternion)
  }

  let elapsed = 0
  let previousTime

  renderer.setAnimationLoop((time) => {
    const delta = previousTime === undefined ? 0 : Math.min((time - previousTime) / 1000, 0.05)
    previousTime = time
    elapsed += delta

    world.step(1 / 60, delta, 3)
    furniture.forEach(sync)
    shots.forEach(sync)

    if (pointerDown && elapsed - lastShotAt > AUTO_FIRE_INTERVAL) fire()

    // Cannon turns towards the pointer, kicks back and flashes when it fires
    const turn = Math.min(1, delta * 10)
    aim.yaw += Math.atan2(Math.sin(aim.targetYaw - aim.yaw), Math.cos(aim.targetYaw - aim.yaw)) * turn
    aim.pitch += (aim.targetPitch - aim.pitch) * turn
    cannon.rotation.y = aim.yaw
    barrelPivot.rotation.x = -aim.pitch
    recoil = Math.max(0, recoil - delta * 4)
    barrel.position.z = -1.5 * Math.sin(recoil * Math.PI * 0.5)
    flashAmount = Math.max(0, flashAmount - delta * 5)
    flashLight.intensity = flashAmount * 1500
    flash.visible = flashAmount > 0
    flash.material.opacity = flashAmount * 0.9
    flash.scale.setScalar(0.5 + flashAmount * 1.8)

    fireLight.intensity = 140 + Math.sin(elapsed * 11) * 25 + Math.sin(elapsed * 23) * 15
    flames.forEach((flame, i) => {
      flame.scale.y = 2.5 - i * 0.4 + Math.sin(elapsed * (9 + i * 3) + i) * 0.35
    })

    for (let i = 0; i < SNOWFLAKES; i++) {
      const y = i * 3 + 1
      snowPositions[y] -= delta * (4 + (i % 5))
      if (snowPositions[y] < 0) snowPositions[y] += 100
    }
    snowGeometry.attributes.position.needsUpdate = true

    renderer.render(scene, camera)
  })

  return {
    // Removes everything that was shot and puts the furniture back in place
    clear() {
      ;[...shots].forEach(removeShot)
      furniture.forEach(({ mesh: object, body }) => {
        scene.remove(object)
        world.removeBody(body)
        aimTargets.splice(aimTargets.indexOf(object), 1)
      })
      dropFurniture()
      shotCount = 0
    },
    dispose() {
      renderer.setAnimationLoop(null)
      resizeObserver.disconnect()
      window.removeEventListener('keydown', onKeyDown)
      owned.forEach((resource) => resource.dispose())
      garland.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    }
  }
}
