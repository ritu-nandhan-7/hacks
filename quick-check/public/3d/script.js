import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// -----------------------------------------------------
// TUNING
// -----------------------------------------------------
const TUNING = {
  roomTargetHeight: 4,
  characterTargetHeight: 0.6,
  characterScaleMultiplier: 0.5,
  characterGroundLift: 0.72,
  moveSpeed: 1.75,
  turnSpeed: 4.8,
  rotationLerp: 0.16,
  cameraHeight: 1.7,
  cameraDistance: 1.25,
  cameraLookHeight: 1.5,
  cameraLerp: 0.14,
  boundaryPadding: 0.55,
  playerRadius: 0.3,
  spawnX: null,
  spawnZ: null,
  spawnYaw: 0,
  spawnBackwardOffset: 0.77,
  doorTriggerX: null,
  doorTriggerZ: null,
  doorTriggerRadius: 0.85,
  doorTriggerBackWallOffset: -1,
  roomTransitionFadeMs: 420,
  xMinInset: -0.3,
  xMaxInset: -0.3,
  zMinInset: -0.5,
  zMaxInset: -0.5,
  fixedGroundY: 0,
};

const ROOM_CONFIG = {
  hall: {
    path: "models/room.glb",
    targetHeight: TUNING.roomTargetHeight,
    showPosters: true,
    circularCollision: false,
  },
  trophy: {
    path: "models/trophy_room.glb",
    targetHeight: 5.6,
    showPosters: false,
    circularCollision: true,
  },
};

const TROPHY_EXHIBIT = {
  modelPath: "models/trophy.glb",
  imageFolderPath: "images/",
  imageFiles: ["trophy-1.jpeg", "trophy-2.jpeg", "trophy-3.jpeg", "trophy-4.jpeg"],
  posterWidth: 0.72,
  posterHeight: 0.96,
  posterYFromFloor: 1.45,
  wallInset: 0.18,
  trophyScale: 0.75,
  trophyLift: 1.0,
  trophyYawOffsetDeg: 90,
  shineMetalness: 0.9,
  shineRoughness: 0.16,
  shineLightDistance: 2.8,
  shineLightIntensity: 1.25,
};

const POSTER_IMAGE_CONFIG = {
  folderPath: "images/",
  files: [
    "left-1.jpeg",
    "left-2.jpeg",
    "left-3.jpeg",
    "right-1.jpeg",
    "right-2.jpeg",
    "right-3.jpeg",
  ],
};

// -----------------------------------------------------
// HELPERS
// -----------------------------------------------------
function getModelBounds(model) {
  return new THREE.Box3().setFromObject(model);
}

function getModelSize(model) {
  const size = new THREE.Vector3();
  getModelBounds(model).getSize(size);
  return size;
}

function fitModelToHeight(model, targetHeight) {
  const size = getModelSize(model);
  if (size.y <= 0.0001) return;
  model.scale.multiplyScalar(targetHeight / size.y);
}

function placeModelOnFloor(model, floorY = 0) {
  const bounds = getModelBounds(model);
  model.position.y += floorY - bounds.min.y;
}

function centerModelXZ(model) {
  const bounds = getModelBounds(model);
  const center = new THREE.Vector3();
  bounds.getCenter(center);
  model.position.x -= center.x;
  model.position.z -= center.z;
}

// -----------------------------------------------------
// SCENE SETUP
// -----------------------------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x12131a);

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const posterViewer = document.getElementById("posterViewer");
const posterCloseBtn = document.getElementById("posterCloseBtn");
const posterPreview = document.getElementById("posterPreview");
const posterTitle = document.getElementById("posterTitle");
const roomTransitionOverlay = document.getElementById("roomTransitionOverlay");

let isPosterModalOpen = false;
let isRoomTransitioning = false;
let currentRoomPath = "models/room.glb";
let hasTriggeredDoorTransition = false;
let activeRoomKey = "hall";
let circularCollisionState = {
  enabled: false,
  center: new THREE.Vector2(0, 0),
  radius: 1,
};
const posterRaycaster = new THREE.Raycaster();
const pointerNdc = new THREE.Vector2();
let interactivePosters = [];

function resetMovementKeys() {
  Object.keys(keys).forEach((key) => {
    keys[key] = false;
  });
}

function openPosterViewer(posterMesh) {
  if (!posterViewer || !posterPreview || !posterTitle) return;

  isPosterModalOpen = true;
  resetMovementKeys();
  if (walkAction) {
    walkAction.setEffectiveTimeScale(0);
  }

  const imagePath = posterMesh.userData?.imagePath || "";
  const label = posterMesh.userData?.label || "Poster";
  posterPreview.innerHTML = imagePath
    ? `<img class="poster-preview-image" src="${imagePath}" alt="${label}">`
    : "<div class=\"poster-preview-missing\">Poster image missing</div>";

  posterTitle.textContent = label;
  posterViewer.classList.add("active");
}

function closePosterViewer() {
  if (!posterViewer) return;
  isPosterModalOpen = false;
  posterViewer.classList.remove("active");
}

if (posterCloseBtn) {
  posterCloseBtn.addEventListener("click", closePosterViewer);
}

renderer.domElement.addEventListener("click", (event) => {
  if (isPosterModalOpen || interactivePosters.length === 0) return;

  const rect = renderer.domElement.getBoundingClientRect();
  pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  posterRaycaster.setFromCamera(pointerNdc, camera);
  const hits = posterRaycaster.intersectObjects(interactivePosters, false);
  if (hits.length > 0) {
    openPosterViewer(hits[0].object);
  }
});

const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
directionalLight.position.set(6, 10, 6);
scene.add(directionalLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd9e7ff, 0.0);
scene.add(hemiLight);

function applyRoomLighting(roomKey) {
  if (roomKey === "trophy") {
    ambientLight.intensity = 0.42;
    directionalLight.intensity = 0.0;
    hemiLight.intensity = 0.28;
  } else {
    ambientLight.intensity = 0.55;
    directionalLight.intensity = 1.1;
    hemiLight.intensity = 0.0;
  }
}

// -----------------------------------------------------
// WORLD + ROOM
// -----------------------------------------------------
const loader = new GLTFLoader();
let roomModel = null;

const roomBounds = new THREE.Box3(
  new THREE.Vector3(-4.5, -1, -4.5),
  new THREE.Vector3(4.5, 4, 4.5)
);

function updateRoomBoundsFromModel(model) {
  const modelBounds = getModelBounds(model);

  roomBounds.min.set(
    modelBounds.min.x + TUNING.boundaryPadding,
    -1,
    modelBounds.min.z + TUNING.boundaryPadding
  );
  roomBounds.max.set(
    modelBounds.max.x - TUNING.boundaryPadding,
    4,
    modelBounds.max.z - TUNING.boundaryPadding
  );
}

function getCenterSpawn() {
  return {
    x: (roomBounds.min.x + roomBounds.max.x) * 0.5,
    z: (roomBounds.min.z + roomBounds.max.z) * 0.5,
  };
}

function getConfiguredSpawnPoint() {
  const center = getCenterSpawn();
  const spawnX = Number.isFinite(TUNING.spawnX) ? TUNING.spawnX : center.x;
  const spawnZ = Number.isFinite(TUNING.spawnZ)
    ? TUNING.spawnZ
    : center.z - TUNING.spawnBackwardOffset;

  const clamped = clampToRoom(new THREE.Vector3(spawnX, TUNING.fixedGroundY, spawnZ));
  return {
    x: clamped.x,
    y: TUNING.fixedGroundY,
    z: clamped.z,
    yaw: TUNING.spawnYaw,
  };
}

function applySpawnNow() {
  const spawn = getConfiguredSpawnPoint();
  player.position.set(spawn.x, spawn.y, spawn.z);
  player.rotation.y = spawn.yaw;
  return spawn;
}

function getDoorTriggerPoint() {
  const center = getCenterSpawn();
  return {
    x: Number.isFinite(TUNING.doorTriggerX) ? TUNING.doorTriggerX : center.x,
    z: Number.isFinite(TUNING.doorTriggerZ)
      ? TUNING.doorTriggerZ
      : roomBounds.max.z - TUNING.doorTriggerBackWallOffset,
    radius: TUNING.doorTriggerRadius,
  };
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadRoomModel(modelPath, {
  placePosters = false,
  resetSpawnToCenter = false,
  roomTargetHeight = TUNING.roomTargetHeight,
  roomKey = "hall",
  circularCollision = false,
  addTrophyDecor = false,
} = {}) {
  return new Promise((resolve, reject) => {
    loader.load(
      modelPath,
      async (gltf) => {
        if (roomModel) {
          scene.remove(roomModel);
        }

        clearPosters();
        clearTrophyRoomDecor();
        roomModel = gltf.scene;

        fitModelToHeight(roomModel, roomTargetHeight);
        placeModelOnFloor(roomModel, 0);
        centerModelXZ(roomModel);

        scene.add(roomModel);
        updateRoomBoundsFromModel(roomModel);

        activeRoomKey = roomKey;
        applyRoomLighting(roomKey);

        const centerX = (roomBounds.min.x + roomBounds.max.x) * 0.5;
        const centerZ = (roomBounds.min.z + roomBounds.max.z) * 0.5;
        const circularRadius = Math.min(
          (roomBounds.max.x - roomBounds.min.x) * 0.5,
          (roomBounds.max.z - roomBounds.min.z) * 0.5
        );
        circularCollisionState = {
          enabled: circularCollision,
          center: new THREE.Vector2(centerX, centerZ),
          radius: circularRadius,
        };

        if (resetSpawnToCenter) {
          TUNING.spawnX = null;
          TUNING.spawnZ = null;
        }

        const spawn = applySpawnNow();
        currentRoomPath = modelPath;
        console.log("Spawn point:", spawn);

        console.log("=== EXACT WALL COORDINATES ===");
        console.log("LEFT WALL (X):", roomBounds.min.x.toFixed(2));
        console.log("RIGHT WALL (X):", roomBounds.max.x.toFixed(2));
        console.log("FRONT WALL (Z):", roomBounds.min.z.toFixed(2));
        console.log("BACK WALL (Z):", roomBounds.max.z.toFixed(2));
        console.log("FLOOR (Y):", TUNING.fixedGroundY);
        console.log("CEILING (Y):", 4);
        console.log("Room Width (X):", (roomBounds.max.x - roomBounds.min.x).toFixed(2));
        console.log("Room Depth (Z):", (roomBounds.max.z - roomBounds.min.z).toFixed(2));
        console.log("================================");

        if (placePosters) {
          setTimeout(() => placePostersOnWalls(), 100);
        }

        if (addTrophyDecor) {
          await setupTrophyRoomDecor();
        }

        resolve();
      },
      undefined,
      (error) => {
        console.error(`Error loading ${modelPath}:`, error);
        reject(error);
      }
    );
  });
}

async function transitionToTrophyRoom() {
  if (isRoomTransitioning) return;

  isRoomTransitioning = true;
  resetMovementKeys();
  if (walkAction) {
    walkAction.setEffectiveTimeScale(0);
  }

  if (roomTransitionOverlay) {
    roomTransitionOverlay.classList.remove("fade-out");
    roomTransitionOverlay.classList.add("active");
  }

  await wait(TUNING.roomTransitionFadeMs);
  await loadRoomModel(ROOM_CONFIG.trophy.path, {
    placePosters: false,
    resetSpawnToCenter: true,
    roomTargetHeight: ROOM_CONFIG.trophy.targetHeight,
    roomKey: "trophy",
    circularCollision: ROOM_CONFIG.trophy.circularCollision,
    addTrophyDecor: true,
  });

  if (roomTransitionOverlay) {
    roomTransitionOverlay.classList.add("fade-out");
  }

  await wait(TUNING.roomTransitionFadeMs);

  if (roomTransitionOverlay) {
    roomTransitionOverlay.classList.remove("active", "fade-out");
  }

  isRoomTransitioning = false;
}

async function transitionToHallRoom() {
  if (isRoomTransitioning) return;

  isRoomTransitioning = true;
  resetMovementKeys();
  if (walkAction) {
    walkAction.setEffectiveTimeScale(0);
  }

  if (roomTransitionOverlay) {
    roomTransitionOverlay.classList.remove("fade-out");
    roomTransitionOverlay.classList.add("active");
  }

  await wait(TUNING.roomTransitionFadeMs);
  await loadRoomModel(ROOM_CONFIG.hall.path, {
    placePosters: ROOM_CONFIG.hall.showPosters,
    resetSpawnToCenter: true,
    roomTargetHeight: ROOM_CONFIG.hall.targetHeight,
    roomKey: "hall",
    circularCollision: ROOM_CONFIG.hall.circularCollision,
    addTrophyDecor: false,
  });
  hasTriggeredDoorTransition = false;

  if (roomTransitionOverlay) {
    roomTransitionOverlay.classList.add("fade-out");
  }

  await wait(TUNING.roomTransitionFadeMs);

  if (roomTransitionOverlay) {
    roomTransitionOverlay.classList.remove("active", "fade-out");
  }

  isRoomTransitioning = false;
}

function checkDoorTriggerTransition() {
  if (isRoomTransitioning || isPosterModalOpen) return;
  if (currentRoomPath !== "models/room.glb") return;
  if (hasTriggeredDoorTransition) return;

  const trigger = getDoorTriggerPoint();
  const deltaX = player.position.x - trigger.x;
  const deltaZ = player.position.z - trigger.z;
  const withinTrigger = deltaX * deltaX + deltaZ * deltaZ <= trigger.radius * trigger.radius;

  if (withinTrigger) {
    hasTriggeredDoorTransition = true;
    transitionToTrophyRoom();
  }
}

loadRoomModel(ROOM_CONFIG.hall.path, {
  placePosters: ROOM_CONFIG.hall.showPosters,
  roomTargetHeight: ROOM_CONFIG.hall.targetHeight,
  roomKey: "hall",
  circularCollision: ROOM_CONFIG.hall.circularCollision,
}).catch((error) => {
  console.error("Error loading initial room:", error);
});

// -----------------------------------------------------
// CHARACTER + ANIMATION
// -----------------------------------------------------
const player = new THREE.Group();
player.position.set(0, TUNING.fixedGroundY, 0);
scene.add(player);

let mixer = null;
let walkAction = null;
let rootMotionBone = null;
let rootMotionInitialPosition = null;

function findRootMotionBone(model) {
  let found = null;
  model.traverse((node) => {
    if (!node.isBone || found) return;

    const name = (node.name || "").toLowerCase();
    if (name.includes("hips") || name.includes("root") || name.includes("pelvis")) {
      found = node;
    }
  });

  if (found) return found;

  model.traverse((node) => {
    if (!node.isBone || found) return;
    found = node;
  });

  return found;
}

function neutralizeRootMotion() {
  if (!rootMotionBone || !rootMotionInitialPosition) return;

  rootMotionBone.position.x = rootMotionInitialPosition.x;
  rootMotionBone.position.y = rootMotionInitialPosition.y;
  rootMotionBone.position.z = rootMotionInitialPosition.z;
}

loader.load(
  "models/character.glb",
  (gltf) => {
    const characterModel = gltf.scene;

    fitModelToHeight(characterModel, TUNING.characterTargetHeight);
    characterModel.scale.multiplyScalar(TUNING.characterScaleMultiplier);
    placeModelOnFloor(characterModel, 0);
    characterModel.position.y += TUNING.characterGroundLift;

    // Prevent animated skinned meshes from disappearing due frustum culling.
    characterModel.traverse((node) => {
      if (node.isMesh) {
        node.frustumCulled = false;
      }
    });

    player.add(characterModel);

    rootMotionBone = findRootMotionBone(characterModel);
    if (rootMotionBone) {
      rootMotionInitialPosition = rootMotionBone.position.clone();
    }

    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(characterModel);
      walkAction = mixer.clipAction(gltf.animations[0]);
      walkAction.setLoop(THREE.LoopRepeat, Infinity);
      walkAction.setEffectiveWeight(1);
      walkAction.setEffectiveTimeScale(0);
      walkAction.play();
    }
  },
  undefined,
  (error) => {
    console.error("Error loading models/character.glb:", error);

    const fallback = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 1.0, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x4fc3f7 })
    );
    fallback.position.y = 0.5;
    player.add(fallback);
  }
);

// POSTERS
// -----------------------------------------------------
const POSTER_TUNING = {
  countPerSide: 3,
  width: 0.42,
  height: 0.56,
  yFromFloor: 1.3,
  zEdgePadding: 0.7,
  wallInset: -0.5,
  leftOffset: { x: 0, y: 0, z: 0 },
  rightOffset: { x: 0, y: 0, z: 0 },
};

let posterGroup = null;
let trophyDisplayGroup = null;
const posterTextureLoader = new THREE.TextureLoader();

function getPosterImagePath(index) {
  const filename = POSTER_IMAGE_CONFIG.files[index];
  if (!filename) return null;
  return `${POSTER_IMAGE_CONFIG.folderPath}${filename}`;
}

function createPoster(x, y, z, width, height, color, imagePath, label) {
  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: 0x101010,
    emissiveIntensity: 0.16,
  });

  if (imagePath) {
    posterTextureLoader.load(
      imagePath,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        material.map = texture;
        material.color.set(0xffffff);
        material.needsUpdate = true;
      },
      undefined,
      () => {
        console.warn(`Could not load poster image: ${imagePath}`);
      }
    );
  }

  const poster = new THREE.Mesh(geometry, material);
  poster.position.set(x, y, z);
  poster.userData.imagePath = imagePath;
  poster.userData.label = label;
  poster.userData.posterColor = color;
  return poster;
}

function clearTrophyRoomDecor() {
  if (!trophyDisplayGroup) return;
  scene.remove(trophyDisplayGroup);
  trophyDisplayGroup = null;
}

function getCircularDecorPositions() {
  const radiusFromBounds = Math.min(
    (roomBounds.max.x - roomBounds.min.x) * 0.5,
    (roomBounds.max.z - roomBounds.min.z) * 0.5
  );
  const radius = Math.max(0.5, radiusFromBounds - TROPHY_EXHIBIT.wallInset);
  const centerX = (roomBounds.min.x + roomBounds.max.x) * 0.5;
  const centerZ = (roomBounds.min.z + roomBounds.max.z) * 0.5;
  const starOrder = [0, 2, 4, 1, 3];
  const points = [];

  for (let pointIndex = 0; pointIndex < 5; pointIndex += 1) {
    const mapped = starOrder[pointIndex];
    const angle = Math.PI / 2 + (mapped * Math.PI * 2) / 5;
    points.push({
      x: centerX + Math.cos(angle) * radius,
      z: centerZ + Math.sin(angle) * radius,
    });
  }

  return points;
}

function loadGltfModel(modelPath) {
  return new Promise((resolve, reject) => {
    loader.load(modelPath, (gltf) => resolve(gltf.scene), undefined, reject);
  });
}

function addTrophyShineLights(group, baseX, baseY, baseZ) {
  const distance = TROPHY_EXHIBIT.shineLightDistance;

  const keyLight = new THREE.PointLight(0xffffff, TROPHY_EXHIBIT.shineLightIntensity, distance, 2);
  keyLight.position.set(baseX + 0.58, baseY + 1.12, baseZ + 0.28);
  group.add(keyLight);

  const fillLight = new THREE.PointLight(0xfff7d6, TROPHY_EXHIBIT.shineLightIntensity * 0.75, distance, 2);
  fillLight.position.set(baseX - 0.52, baseY + 0.92, baseZ - 0.34);
  group.add(fillLight);

  const rimLight = new THREE.PointLight(0xffffff, TROPHY_EXHIBIT.shineLightIntensity * 0.45, distance, 2);
  rimLight.position.set(baseX, baseY + 1.45, baseZ - 0.5);
  group.add(rimLight);
}

async function setupTrophyRoomDecor() {
  clearTrophyRoomDecor();

  trophyDisplayGroup = new THREE.Group();
  const points = getCircularDecorPositions();
  const centerTarget = new THREE.Vector3(
    (roomBounds.min.x + roomBounds.max.x) * 0.5,
    1.2,
    (roomBounds.min.z + roomBounds.max.z) * 0.5
  );

  try {
    const trophyModel = await loadGltfModel(TROPHY_EXHIBIT.modelPath);
    fitModelToHeight(trophyModel, TROPHY_EXHIBIT.trophyScale);
    placeModelOnFloor(trophyModel, 0);
    trophyModel.position.set(points[0].x, TROPHY_EXHIBIT.trophyLift, points[0].z);
    trophyModel.lookAt(centerTarget.x, trophyModel.position.y, centerTarget.z);
    trophyModel.rotateY(THREE.MathUtils.degToRad(TROPHY_EXHIBIT.trophyYawOffsetDeg));
    trophyDisplayGroup.add(trophyModel);
    addTrophyShineLights(
      trophyDisplayGroup,
      points[0].x,
      TROPHY_EXHIBIT.trophyLift,
      points[0].z
    );
  } catch (error) {
    console.error("Failed to load trophy model:", error);
  }

  for (let index = 0; index < TROPHY_EXHIBIT.imageFiles.length; index += 1) {
    const imagePath = `${TROPHY_EXHIBIT.imageFolderPath}${TROPHY_EXHIBIT.imageFiles[index]}`;
    const point = points[index + 1];
    const poster = createPoster(
      point.x,
      TROPHY_EXHIBIT.posterYFromFloor,
      point.z,
      TROPHY_EXHIBIT.posterWidth,
      TROPHY_EXHIBIT.posterHeight,
      0xffffff,
      imagePath,
      `Trophy Image ${index + 1}`
    );

    poster.lookAt(centerTarget);
    trophyDisplayGroup.add(poster);
    interactivePosters.push(poster);
  }

  scene.add(trophyDisplayGroup);
}

function getEquidistantZPositions() {
  const count = Math.max(1, POSTER_TUNING.countPerSide);
  const minZ = roomBounds.min.z + POSTER_TUNING.zEdgePadding;
  const maxZ = roomBounds.max.z - POSTER_TUNING.zEdgePadding;

  if (count === 1) return [(minZ + maxZ) * 0.5];

  const step = (maxZ - minZ) / (count - 1);
  const positions = [];
  for (let index = 0; index < count; index += 1) {
    positions.push(minZ + step * index);
  }
  return positions;
}

function clearPosters() {
  if (!posterGroup) return;
  scene.remove(posterGroup);
  posterGroup = null;
  interactivePosters = [];
}

function placePostersOnWalls() {
  if (roomBounds.min.x === -4.5 && roomBounds.max.x === 4.5) {
    console.log("Wait for room to load before placing posters");
    return;
  }

  clearPosters();
  posterGroup = new THREE.Group();
  const zPositions = getEquidistantZPositions();

  const leftX = roomBounds.min.x + POSTER_TUNING.wallInset + POSTER_TUNING.leftOffset.x;
  const rightX = roomBounds.max.x - POSTER_TUNING.wallInset + POSTER_TUNING.rightOffset.x;
  const baseY = POSTER_TUNING.yFromFloor;

  zPositions.forEach((baseZ, index) => {
    const leftImagePath = getPosterImagePath(index);
    const rightImagePath = getPosterImagePath(index + POSTER_TUNING.countPerSide);
    const leftLabel = `Left Poster ${index + 1}`;
    const rightLabel = `Right Poster ${index + 1}`;

    const leftPoster = createPoster(
      leftX,
      baseY + POSTER_TUNING.leftOffset.y,
      baseZ + POSTER_TUNING.leftOffset.z,
      POSTER_TUNING.width,
      POSTER_TUNING.height,
      0xff5252,
      leftImagePath,
      leftLabel
    );
    leftPoster.rotation.y = Math.PI / 2;
    leftPoster.userData = {
      ...leftPoster.userData,
      side: "left",
      index: index + 1,
      label: leftLabel,
    };
    posterGroup.add(leftPoster);
    interactivePosters.push(leftPoster);

    const rightPoster = createPoster(
      rightX,
      baseY + POSTER_TUNING.rightOffset.y,
      baseZ + POSTER_TUNING.rightOffset.z,
      POSTER_TUNING.width,
      POSTER_TUNING.height,
      0x4fc3f7,
      rightImagePath,
      rightLabel
    );
    rightPoster.rotation.y = -Math.PI / 2;
    rightPoster.userData = {
      ...rightPoster.userData,
      side: "right",
      index: index + 1,
      label: rightLabel,
    };
    posterGroup.add(rightPoster);
    interactivePosters.push(rightPoster);

    console.log(
      `Poster ${index + 1} | LEFT: (${leftPoster.position.x.toFixed(3)}, ${leftPoster.position.y.toFixed(3)}, ${leftPoster.position.z.toFixed(3)}) | RIGHT: (${rightPoster.position.x.toFixed(3)}, ${rightPoster.position.y.toFixed(3)}, ${rightPoster.position.z.toFixed(3)})`
    );
  });

  scene.add(posterGroup);
  console.log("✓ Placed 3 small posters on LEFT + 3 on RIGHT (front/back empty)");
}

window.posterAdjuster = {
  tuning: POSTER_TUNING,
  redraw() {
    placePostersOnWalls();
  },
  setLeftOffset(x = 0, y = 0, z = 0) {
    POSTER_TUNING.leftOffset = { x, y, z };
    placePostersOnWalls();
  },
  setRightOffset(x = 0, y = 0, z = 0) {
    POSTER_TUNING.rightOffset = { x, y, z };
    placePostersOnWalls();
  },
  setBothOffset(x = 0, y = 0, z = 0) {
    POSTER_TUNING.leftOffset = { x, y, z };
    POSTER_TUNING.rightOffset = { x, y, z };
    placePostersOnWalls();
  },
  setWallInset(value = 0.01) {
    POSTER_TUNING.wallInset = value;
    placePostersOnWalls();
  },
  setSize(width = 0.42, height = 0.56) {
    POSTER_TUNING.width = width;
    POSTER_TUNING.height = height;
    placePostersOnWalls();
  },
  setHeight(yFromFloor = 1.3) {
    POSTER_TUNING.yFromFloor = yFromFloor;
    placePostersOnWalls();
  },
};

// -----------------------------------------------------
// INPUT
// -----------------------------------------------------
const keys = { w: false, a: false, s: false, d: false };

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (isPosterModalOpen || isRoomTransitioning) return;

  if (key === "r") {
    if (activeRoomKey === "trophy") {
      transitionToHallRoom();
      return;
    }
    const spawn = applySpawnNow();
    console.log("Respawned at:", spawn);
    return;
  }
  if (key in keys) keys[key] = true;
});

window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  if (key in keys) keys[key] = false;
});

// -----------------------------------------------------
// MOVEMENT + COLLISION
// -----------------------------------------------------
const movementVector = new THREE.Vector3();
const forwardVector = new THREE.Vector3();

function clampToRoom(position) {
  if (circularCollisionState.enabled) {
    const centerX = circularCollisionState.center.x;
    const centerZ = circularCollisionState.center.y;
    const maxRadius = Math.max(0.2, circularCollisionState.radius - TUNING.playerRadius);

    const deltaX = position.x - centerX;
    const deltaZ = position.z - centerZ;
    const distance = Math.hypot(deltaX, deltaZ);

    if (distance > maxRadius && distance > 0.00001) {
      const scale = maxRadius / distance;
      position.x = centerX + deltaX * scale;
      position.z = centerZ + deltaZ * scale;
    }

    position.y = TUNING.fixedGroundY;
    return position;
  }

  position.x = THREE.MathUtils.clamp(
    position.x,
    roomBounds.min.x + TUNING.playerRadius + TUNING.xMinInset,
    roomBounds.max.x - TUNING.playerRadius - TUNING.xMaxInset
  );
  position.z = THREE.MathUtils.clamp(
    position.z,
    roomBounds.min.z + TUNING.playerRadius + TUNING.zMinInset,
    roomBounds.max.z - TUNING.playerRadius - TUNING.zMaxInset
  );
  position.y = TUNING.fixedGroundY;
  return position;
}

function getPlayerMovementLimits() {
  if (circularCollisionState.enabled) {
    return {
      collisionMode: "circle",
      centerX: circularCollisionState.center.x,
      centerZ: circularCollisionState.center.y,
      radius: Math.max(0.2, circularCollisionState.radius - TUNING.playerRadius),
    };
  }

  return {
    collisionMode: "box",
    xMin: roomBounds.min.x + TUNING.playerRadius + TUNING.xMinInset,
    xMax: roomBounds.max.x - TUNING.playerRadius - TUNING.xMaxInset,
    zMin: roomBounds.min.z + TUNING.playerRadius + TUNING.zMinInset,
    zMax: roomBounds.max.z - TUNING.playerRadius - TUNING.zMaxInset,
    xMinInset: TUNING.xMinInset,
    xMaxInset: TUNING.xMaxInset,
    zMinInset: TUNING.zMinInset,
    zMaxInset: TUNING.zMaxInset,
  };
}

window.movementDebug = {
  getRoomInfo() {
    const roomInfo = {
      activeRoomKey,
      currentRoomPath,
      circularCollision: circularCollisionState,
    };
    console.log("Room info:", roomInfo);
    return roomInfo;
  },
  getLimits() {
    const limits = getPlayerMovementLimits();
    console.log("Player move limits:", limits);
    return limits;
  },
  getDoorTrigger() {
    const trigger = getDoorTriggerPoint();
    console.log("Door trigger:", trigger);
    return trigger;
  },
  setDoorTrigger(x = null, z = null, radius = TUNING.doorTriggerRadius) {
    TUNING.doorTriggerX = x;
    TUNING.doorTriggerZ = z;
    TUNING.doorTriggerRadius = radius;
    const trigger = getDoorTriggerPoint();
    console.log("Updated door trigger:", trigger);
    return trigger;
  },
  getPosition() {
    const position = {
      x: player.position.x,
      y: player.position.y,
      z: player.position.z,
    };
    console.log("Player position:", position);
    return position;
  },
  getSpawn() {
    const spawn = getConfiguredSpawnPoint();
    console.log("Configured spawn:", spawn);
    return spawn;
  },
  setSpawn(x, z, yaw = 0, respawnNow = true) {
    TUNING.spawnX = x;
    TUNING.spawnZ = z;
    TUNING.spawnYaw = yaw;

    const spawn = getConfiguredSpawnPoint();
    if (respawnNow) {
      player.position.set(spawn.x, spawn.y, spawn.z);
      player.rotation.y = spawn.yaw;
    }

    console.log("Updated spawn:", spawn, "respawnNow:", respawnNow);
    return spawn;
  },
  resetSpawnToCenter(respawnNow = true) {
    TUNING.spawnX = null;
    TUNING.spawnZ = null;

    const spawn = getConfiguredSpawnPoint();
    if (respawnNow) {
      player.position.set(spawn.x, spawn.y, spawn.z);
      player.rotation.y = spawn.yaw;
    }

    console.log("Spawn reset to room center:", spawn, "respawnNow:", respawnNow);
    return spawn;
  },
  respawn() {
    const spawn = applySpawnNow();
    console.log("Respawned at:", spawn);
    return spawn;
  },
  setSpawnBackwardOffset(distance = 0.35, respawnNow = true) {
    TUNING.spawnBackwardOffset = distance;
    if (respawnNow) {
      const spawn = applySpawnNow();
      console.log("Updated spawnBackwardOffset and respawned:", spawn);
      return spawn;
    }
    const spawn = getConfiguredSpawnPoint();
    console.log("Updated spawnBackwardOffset:", distance, "next spawn:", spawn);
    return spawn;
  },
  setXInsets(xMinInset = 0, xMaxInset = 0) {
    TUNING.xMinInset = Math.max(0, xMinInset);
    TUNING.xMaxInset = Math.max(0, xMaxInset);

    const clampedNow = clampToRoom(player.position.clone());
    player.position.copy(clampedNow);

    const limits = getPlayerMovementLimits();
    console.log("Updated X insets:", {
      xMinInset: TUNING.xMinInset,
      xMaxInset: TUNING.xMaxInset,
      limits,
    });
    return limits;
  },
  setZInsets(zMinInset = 0, zMaxInset = 0) {
    TUNING.zMinInset = Math.max(0, zMinInset);
    TUNING.zMaxInset = Math.max(0, zMaxInset);

    const clampedNow = clampToRoom(player.position.clone());
    player.position.copy(clampedNow);

    const limits = getPlayerMovementLimits();
    console.log("Updated Z insets:", {
      zMinInset: TUNING.zMinInset,
      zMaxInset: TUNING.zMaxInset,
      limits,
    });
    return limits;
  },
};

function updateMovement(deltaTime) {
  if (isPosterModalOpen || isRoomTransitioning) {
    if (walkAction) {
      walkAction.setEffectiveTimeScale(0);
    }
    return;
  }

  const forwardInput = (keys.w ? 1 : 0) - (keys.s ? 1 : 0);
  const turnInput = (keys.a ? 1 : 0) - (keys.d ? 1 : 0);

  if (turnInput !== 0) {
    player.rotation.y += turnInput * TUNING.turnSpeed * deltaTime;
  }

  let didMove = false;

  if (forwardInput !== 0) {
    forwardVector.set(Math.sin(player.rotation.y), 0, Math.cos(player.rotation.y));

    movementVector.copy(forwardVector)
      .multiplyScalar(forwardInput * TUNING.moveSpeed * deltaTime);

    const targetPosition = player.position.clone().add(movementVector);
    const clampedTarget = clampToRoom(targetPosition);

    didMove = player.position.distanceToSquared(clampedTarget) > 0.0000001;
    player.position.copy(clampedTarget);
  }

  player.position.y = TUNING.fixedGroundY;

  if (walkAction) {
    walkAction.setEffectiveTimeScale(didMove ? 1.15 : 0);
  }
}

// -----------------------------------------------------
// CAMERA
// -----------------------------------------------------
const cameraOffset = new THREE.Vector3(0, TUNING.cameraHeight, -TUNING.cameraDistance);
const cameraDesiredPosition = new THREE.Vector3();
const cameraLookTarget = new THREE.Vector3();

camera.position.set(0, TUNING.cameraHeight, -TUNING.cameraDistance);

function updateCamera() {
  const rotatedOffset = cameraOffset.clone().applyAxisAngle(
    new THREE.Vector3(0, 1, 0),
    player.rotation.y
  );

  cameraDesiredPosition.copy(player.position).add(rotatedOffset);
  camera.position.lerp(cameraDesiredPosition, TUNING.cameraLerp);

  cameraLookTarget.set(
    player.position.x,
    player.position.y + TUNING.cameraLookHeight,
    player.position.z
  );
  camera.lookAt(cameraLookTarget);
}

// -----------------------------------------------------
// LOOP
// -----------------------------------------------------
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  if (mixer) {
    mixer.update(deltaTime);
    neutralizeRootMotion();
  }

  updateMovement(deltaTime);
  checkDoorTriggerTransition();
  updateCamera();

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
