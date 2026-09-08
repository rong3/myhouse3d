import * as T from 'three';
import {
  SITE,
  frontZ,
  gateZ,
  boundaryZ,
  interiorZ,
  houseOutline,
  upperOutline,
  yardOutline,
} from './site-plan';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { sampleTour } from './journey';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export type Viewer = {
  seek: (p: number) => void;
  setMode: (m: string) => void;
  setSection: (on: boolean) => void;
  view: (v: string) => void;
  zoom: (v: number) => void;
  dispose: () => void;
};
export function createViewer(
  host: HTMLElement,
  _onSelect: (id: string) => void,
): Viewer {
  const scene = new T.Scene();
  scene.background = new T.Color('#e9eef1');
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, host.clientWidth < 760 ? 1.5 : 2),
  );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);
  const upperCut = new T.Plane(new T.Vector3(0, -1, 0), 20);
  renderer.clippingPlanes = [upperCut];
  renderer.localClippingEnabled = true;
  const pmrem = new T.PMREMGenerator(renderer),
    environmentScene = new RoomEnvironment(),
    environment = pmrem.fromScene(environmentScene, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.5;
  environmentScene.dispose();
  pmrem.dispose();
  const sideCuts = [0, 3.6, 7.2, 10.5].map(
    () => new T.Plane(new T.Vector3(0, -1, 0), 40),
  );

  const camera = new T.PerspectiveCamera(
    40,
    host.clientWidth / Math.max(1, host.clientHeight),
    0.035,
    160,
  );
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 1.3;
  controls.maxDistance = 110;
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.enablePan = true;
  controls.screenSpacePanning = false;
  controls.panSpeed = 0.85;
  controls.rotateSpeed = 0.52;
  controls.zoomSpeed = 0.9;
  controls.mouseButtons.LEFT = T.MOUSE.ROTATE;
  controls.mouseButtons.MIDDLE = T.MOUSE.DOLLY;
  controls.mouseButtons.RIGHT = T.MOUSE.PAN;
  controls.enabled = false;
  controls.target.set(2.38, 0, 5.8);
  const ambient = new T.HemisphereLight(0xffffff, 0xa5b0b7, 1.4);
  scene.add(ambient);
  const sun = new T.DirectionalLight(0xfff4e3, 2.7);
  sun.position.set(-8, 22, -8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -18,
    right: 18,
    top: 24,
    bottom: -20,
    near: 0.5,
    far: 70,
  });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.025;
  scene.add(sun);
  const fill = new T.DirectionalLight(0xdbedff, 1.1);
  fill.position.set(12, 10, 16);
  scene.add(fill);
  const mats = new Map<string, T.MeshStandardMaterial>();
  function mat(c: string, rough = 0.65, metal = 0) {
    const key = c + rough + metal;
    let m = mats.get(key);
    if (!m) {
      m = new T.MeshStandardMaterial({
        color: c,
        roughness: rough,
        metalness: metal,
      });
      mats.set(key, m);
    }
    return m;
  }
  const cream = mat('#f3f0e9'),
    wood = mat('#c5a172'),
    darkwood = mat('#8e6c46'),
    stone = mat('#ddd8cd'),
    black = mat('#323d40'),
    white = mat('#faf9f4'),
    fabric = mat('#d8c9b6'),
    green = mat('#426e50');
  // Fine directional grain keeps the furniture coherent without imported assets.
  const grainCanvas = document.createElement('canvas');
  grainCanvas.width = 256;
  grainCanvas.height = 256;
  const grain = grainCanvas.getContext('2d')!;
  grain.fillStyle = '#e9d2ae';
  grain.fillRect(0, 0, 256, 256);
  for (let j = 0; j < 128; j++) {
    grain.strokeStyle = `rgba(99,67,33,${0.035 + (j % 7) * 0.012})`;
    grain.lineWidth = 0.3 + (j % 4) * 0.25;
    grain.beginPath();
    for (let x = 0; x <= 256; x += 8) {
      const y = j * 2 + Math.sin(x * 0.027 + j) * 1.5;
      if (x) grain.lineTo(x, y);
      else grain.moveTo(x, y);
    }
    grain.stroke();
  }
  const woodTexture = new T.CanvasTexture(grainCanvas);
  woodTexture.colorSpace = T.SRGBColorSpace;
  wood.map = woodTexture;
  darkwood.map = woodTexture;
  const glass = new T.MeshStandardMaterial({
    color: '#a5c8ca',
    transparent: true,
    opacity: 0.24,
    roughness: 0.12,
    metalness: 0.15,
    depthWrite: false,
  });
  function box(
    p: T.Object3D,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    m: T.Material,
    round = 0,
  ) {
    const geo = round
      ? new RoundedBoxGeometry(w, h, d, 2, round)
      : new T.BoxGeometry(w, h, d);
    const mesh = new T.Mesh(geo, m);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    p.add(mesh);
    return mesh;
  }
  function cyl(
    p: T.Object3D,
    x: number,
    y: number,
    z: number,
    r: number,
    h: number,
    m: T.Material,
    r2 = r,
  ) {
    const mesh = new T.Mesh(new T.CylinderGeometry(r, r2, h, 20), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    p.add(mesh);
    return mesh;
  }
  function ball(
    p: T.Object3D,
    x: number,
    y: number,
    z: number,
    r: number,
    m: T.Material,
    sx = 1,
    sy = 1,
    sz = 1,
  ) {
    const mesh = new T.Mesh(new T.SphereGeometry(r, 16, 12), m);
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    mesh.castShadow = true;
    p.add(mesh);
    return mesh;
  }
  function line(
    p: T.Object3D,
    a: number[],
    b: number[],
    r = 0.018,
    m: T.Material = black,
  ) {
    const av = new T.Vector3(...a),
      bv = new T.Vector3(...b),
      dir = bv.clone().sub(av);
    const o = new T.Mesh(new T.CylinderGeometry(r, r, dir.length(), 8), m);
    o.position.copy(av.add(bv).multiplyScalar(0.5));
    o.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.normalize());
    p.add(o);
    return o;
  }
  function poly(
    p: T.Object3D,
    points: number[][],
    y: number,
    depth: number,
    m: T.Material,
    hole = false,
  ) {
    const s = new T.Shape();
    points.forEach(([x, z], i) => (i ? s.lineTo(x, -z) : s.moveTo(x, -z)));
    s.closePath();
    if (hole) {
      const path = new T.Path();
      path.moveTo(2.43, -interiorZ(5));
      path.lineTo(2.43, -interiorZ(8.1));
      path.lineTo(4.56, -interiorZ(8.1));
      path.lineTo(4.56, -interiorZ(5));
      path.closePath();
      s.holes.push(path);
    }
    const geo = new T.ExtrudeGeometry(s, { depth, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    const o = new T.Mesh(geo, m);
    o.position.y = y - depth;
    o.receiveShadow = true;
    o.castShadow = true;
    p.add(o);
    return o;
  }
  box(
    scene,
    2.38,
    -0.36,
    gateZ / 2,
    5.7,
    0.2,
    gateZ + 1.8,
    mat('#d8dfe2'),
    0.12,
  );
  const ground = new T.Mesh(new T.PlaneGeometry(200, 200), mat('#e9eef1'));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.5;
  ground.receiveShadow = true;
  scene.add(ground);
  const groups: T.Group[] = [],
    wallGroups: T.Group[] = [],
    furnGroups: T.Group[] = [],
    labelGroups: T.Group[] = [];
  const outline = houseOutline,
    outlineUpper = upperOutline;
  function wall(
    p: T.Group,
    x1: number,
    z1: number,
    x2: number,
    z2: number,
    height = 3.41,
    thick = 0.16,
    m: T.Material = cream,
  ) {
    const length = Math.hypot(x2 - x1, z2 - z1);
    const o = box(
      p,
      (x1 + x2) / 2,
      height / 2,
      (z1 + z2) / 2,
      length,
      height,
      thick,
      m,
    );
    o.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
    o.userData.section = true;
    return o;
  }
  function door(p: T.Group, x: number, z: number, width: number, rot = 0) {
    const g = new T.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    p.add(g);
    // Keep the complete door visible when the house is cut open.
    g.userData.section = false;
    box(g, -width / 2, 1.15, 0, 0.055, 2.3, 0.12, wood);
    box(g, width / 2, 1.15, 0, 0.055, 2.3, 0.12, wood);
    box(g, 0, 2.28, 0, width, 0.06, 0.12, wood);
    const leaf = new T.Group();
    leaf.position.x = -width / 2;
    leaf.rotation.y = -0.28;
    g.add(leaf);
    box(leaf, width / 2, 1.1, 0, width - 0.07, 2.2, 0.055, wood, 0.012);
    box(leaf, width - 0.16, 1.04, 0.065, 0.09, 0.04, 0.035, black, 0.01);
    box(
      leaf,
      width / 2,
      1.32,
      -0.035,
      width * 0.58,
      1.42,
      0.012,
      mat('#d9b984'),
      0.008,
    );
  }
  function doubleDoor(
    p: T.Group,
    x: number,
    z: number,
    width: number,
    rot = 0,
  ) {
    const g = new T.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    // Keep the complete double door visible when the house is cut open.
    g.userData.section = false;
    box(g, -width / 2, 1.15, 0, 0.07, 2.3, 0.13, wood);
    box(g, width / 2, 1.15, 0, 0.07, 2.3, 0.13, wood);
    box(g, 0, 2.28, 0, width, 0.07, 0.13, wood);
    for (const side of [-1, 1]) {
      const leaf = new T.Group();
      leaf.position.x = side * 0.025;
      leaf.rotation.y = side * 0.12;
      g.add(leaf);
      const leafWidth = width / 2 - 0.07;
      box(
        leaf,
        side * (leafWidth / 2),
        1.1,
        0,
        leafWidth,
        2.2,
        0.06,
        wood,
        0.01,
      );
      box(
        leaf,
        side * (leafWidth / 2),
        1.34,
        -0.038,
        leafWidth - 0.14,
        1.38,
        0.012,
        mat('#58777b', 0.34, 0.08),
        0.008,
      );
      box(leaf, side * (leafWidth / 2), 1.1, -0.035, 0.035, 2.16, 0.07, black);
      box(leaf, side * (leafWidth / 2), 1.1, 0, leafWidth, 0.035, 0.07, black);
      box(leaf, side * (leafWidth / 2), 2.18, 0, leafWidth, 0.035, 0.07, black);
      box(leaf, side * (leafWidth / 2), 0.03, 0, leafWidth, 0.035, 0.07, black);
      box(
        leaf,
        side * (leafWidth / 2),
        0.43,
        -0.045,
        leafWidth - 0.14,
        0.62,
        0.012,
        wood,
        0.008,
      );
      box(leaf, side * 0.12, 1.08, -0.065, 0.035, 0.07, 0.035, black, 0.01);
    }
  }
  function windowPanel(p: T.Group, x: number, z: number, w: number, rot = 0) {
    const g = new T.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    p.add(g);
    g.userData.section = true;
    box(g, 0, 1.65, 0, w, 1.65, 0.035, glass);
    for (const dx of [-w / 2, 0, w / 2])
      box(g, dx, 1.65, 0, 0.035, 1.75, 0.08, black);
    for (const y of [0.8, 2.5]) box(g, 0, y, 0, w, 0.04, 0.08, black);
  }
  function railing(
    p: T.Object3D,
    x1: number,
    z1: number,
    x2: number,
    z2: number,
  ) {
    line(p, [x1, 1.02, z1], [x2, 1.02, z2], 0.022);
    const len = Math.hypot(x2 - x1, z2 - z1);
    const panel = box(
      p,
      (x1 + x2) / 2,
      0.53,
      (z1 + z2) / 2,
      len,
      0.85,
      0.02,
      glass,
    );
    panel.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
    const n = Math.ceil(len / 0.75);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      line(
        p,
        [x1 + (x2 - x1) * t, 0.08, z1 + (z2 - z1) * t],
        [x1 + (x2 - x1) * t, 1.02, z1 + (z2 - z1) * t],
        0.012,
      );
    }
  }
  function plant(p: T.Object3D, x: number, z: number, size = 0.6) {
    cyl(
      p,
      x,
      0.22 * size,
      z,
      0.22 * size,
      0.44 * size,
      mat('#d0bda4'),
      0.16 * size,
    );
    for (let i = 0; i < 7; i++) {
      const a = i * 2.4;
      const dx = Math.sin(a) * 0.17 * size,
        dz = Math.cos(a) * 0.17 * size;
      line(p, [x, 0.3 * size, z], [x + dx, 0.95 * size, dz + z], 0.012, green);
      const leaf = ball(
        p,
        x + dx,
        0.82 * size,
        z + dz,
        0.25 * size,
        green,
        0.55,
        1.5,
        0.5,
      );
      leaf.rotation.z = Math.sin(a) * 0.55;
    }
  }
  function rug(
    p: T.Object3D,
    x: number,
    z: number,
    w: number,
    d: number,
    c = '#c0b5a5',
  ) {
    box(p, x, 0.025, z, w, 0.025, d, mat(c), 0.01);
    for (let i = 0; i < 6; i++)
      box(
        p,
        x,
        0.04,
        z - d / 2 + 0.06 + i * 0.06,
        w - 0.1,
        0.005,
        0.012,
        mat('#e2d9ca'),
      );
  }
  function chair(p: T.Object3D, x: number, z: number, rot = 0) {
    const g = new T.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    p.add(g);
    for (const dx of [-0.2, 0.2])
      for (const dz of [-0.2, 0.2])
        box(g, dx, 0.24, dz, 0.045, 0.48, 0.045, wood);
    box(g, 0, 0.49, 0, 0.53, 0.12, 0.53, fabric, 0.05);
    box(g, 0, 0.78, 0.23, 0.54, 0.52, 0.075, wood, 0.03);
  }
  function table(
    p: T.Object3D,
    x: number,
    z: number,
    w: number,
    d: number,
    h = 0.76,
  ) {
    box(p, x, h, z, w, 0.08, d, wood, 0.035);
    for (const dx of [-w / 2 + 0.12, w / 2 - 0.12])
      for (const dz of [-d / 2 + 0.12, d / 2 - 0.12])
        box(p, x + dx, h / 2, z + dz, 0.07, h, 0.07, wood);
  }
  function coffee(p: T.Object3D, x: number, z: number) {
    table(p, x, z, 0.8, 1.25, 0.4);
    box(p, x - 0.13, 0.465, z + 0.12, 0.25, 0.04, 0.32, mat('#ecede5'));
    cyl(p, x + 0.15, 0.51, z - 0.25, 0.085, 0.13, white);
  }
  function sofa(parent: T.Object3D, x: number, z: number) {
    const p = new T.Group();
    p.position.set(x, 0, z);
    p.scale.set(0.94, 1, 0.82);
    parent.add(p);
    x = 0;
    z = 0;
    box(p, x, 0.25, z, 0.95, 0.25, 2.75, darkwood, 0.06);
    box(p, x + 0.38, 0.65, z, 0.18, 0.85, 2.75, fabric, 0.08);
    for (let i = -1; i <= 1; i++) {
      box(p, x - 0.02, 0.47, z + i * 0.83, 0.76, 0.26, 0.78, fabric, 0.09);
      box(p, x + 0.22, 0.81, z + i * 0.83, 0.2, 0.55, 0.73, fabric, 0.07);
    }
    for (const dz of [-1.31, 1.31])
      box(p, x, 0.58, z + dz, 0.92, 0.55, 0.17, fabric, 0.06);
    for (const dz of [-0.85, 0.85]) {
      const cushion = box(
        p,
        x - 0.12,
        0.78,
        z + dz,
        0.17,
        0.38,
        0.39,
        mat('#8a9a8a'),
        0.06,
      );
      cushion.rotation.z = 0.28;
    }
  }
  function bed(parent: T.Object3D, z: number, color: string) {
    const p = new T.Group();
    p.position.set(0.47, 0, z * 0.1);
    p.scale.set(0.9, 1, 0.9);
    parent.add(p);
    rug(p, 2.9, z, 2.9, 2.7, '#cfc5b6');
    box(p, 3.24, 0.24, z, 2.18, 0.34, 1.85, wood, 0.06);
    box(p, 3.18, 0.5, z, 2.08, 0.3, 1.76, white, 0.1);
    box(p, 4.35, 0.76, z, 0.15, 1.45, 2.05, wood, 0.04);
    box(p, 2.8, 0.67, z, 1.4, 0.055, 1.8, mat(color), 0.025);
    for (const dz of [-0.46, 0.46])
      box(p, 3.85, 0.72, z + dz, 0.46, 0.18, 0.66, white, 0.08);
    for (const dz of [-1.12, 1.12]) {
      box(p, 4.2, 0.31, z + dz, 0.65, 0.6, 0.52, wood, 0.02);
      cyl(p, 4.2, 0.65, z + dz, 0.12, 0.04, black);
      line(p, [4.2, 0.65, z + dz], [4.2, 0.96, z + dz], 0.018);
      cyl(p, 4.2, 1, z + dz, 0.14, 0.19, white, 0.11);
    }
    for (let i = 0; i < 9; i++)
      box(p, 4.255, 0.86, z - 0.85 + i * 0.2, 0.012, 1.1, 0.012, darkwood);
  }
  function wardrobe(p: T.Object3D, x: number, z: number, w: number, d: number) {
    box(p, x, 1.21, z, w, 2.4, d, wood, 0.015);
    const front = z - d / 2 - 0.015;
    for (let i = 0; i < 4; i++) {
      box(
        p,
        x - w / 2 + ((i + 0.5) * w) / 4,
        1.22,
        front,
        w / 4 - 0.012,
        2.36,
        0.02,
        mat('#c4a078'),
      );
      box(
        p,
        x - w / 2 + ((i + 0.5) * w) / 4 + 0.06,
        1.1,
        front - 0.025,
        0.02,
        0.28,
        0.025,
        black,
      );
    }
  }
  function toilet(p: T.Object3D, x: number, z: number, rot = 0) {
    const g = new T.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    p.add(g);
    // Compact ceramic pan: tank, pedestal, seat and lid read clearly at small scale.
    box(g, 0, 0.58, 0.22, 0.43, 0.58, 0.2, white, 0.055);
    box(g, 0, 0.39, -0.07, 0.46, 0.22, 0.62, white, 0.12);
    box(g, 0, 0.53, -0.16, 0.35, 0.07, 0.48, white, 0.06);
    box(g, 0, 0.575, -0.18, 0.29, 0.025, 0.38, mat('#d9e2e2'), 0.035);
    box(g, 0, 0.84, 0.22, 0.12, 0.025, 0.07, mat('#a7b5b5'), 0.018);
    cyl(g, 0.08, 0.86, 0.19, 0.018, 0.012, black, 0.012);
  }
  function sink(p: T.Object3D, x: number, z: number) {
    box(p, x, 0.43, z, 0.62, 0.78, 0.46, wood, 0.035);
    box(p, x, 0.86, z, 0.72, 0.08, 0.52, white, 0.045);
    box(p, x, 0.905, z, 0.37, 0.045, 0.25, mat('#aebfc1'), 0.09);
    box(p, x, 0.93, z, 0.27, 0.018, 0.15, mat('#718486'), 0.06);
    line(p, [x, 0.93, z + 0.15], [x, 1.16, z + 0.15], 0.022);
    line(p, [x, 1.16, z + 0.15], [x, 1.16, z + 0.03], 0.022);
    box(p, x, 1.45, z - 0.025, 0.62, 0.8, 0.035, mat('#b8ced0', 0.2), 0.012);
  }
  function shower(p: T.Object3D, x: number, z: number, w = 1.05, d = 1.05) {
    box(p, x, 0.03, z, w, 0.06, d, mat('#d9e1e0'), 0.025);
    box(p, x, 0.065, z, w - 0.16, 0.018, d - 0.16, mat('#aabdbd'), 0.025);
    box(p, x + w / 2 - 0.025, 1.18, z, 0.025, 2.35, d, glass);
    box(p, x, 1.18, z - d / 2 + 0.02, w, 2.35, 0.025, glass);
    line(
      p,
      [x - w / 2 + 0.18, 1.62, z - d / 2 + 0.06],
      [x - w / 2 + 0.18, 1.62, z + 0.08],
      0.018,
      black,
    );
    line(
      p,
      [x - w / 2 + 0.18, 1.62, z + 0.08],
      [x - w / 2 + 0.28, 1.62, z + 0.08],
      0.018,
      black,
    );
    cyl(p, x - w / 2 + 0.18, 1.64, z + 0.08, 0.11, 0.025, black, 0.11);
    line(
      p,
      [x - w / 2 + 0.18, 1.64, z + 0.08],
      [x - w / 2 + 0.18, 2.08, z + 0.08],
      0.014,
      black,
    );
    ball(p, x - w / 2 + 0.18, 2.13, z + 0.08, 0.14, white, 1, 0.45, 1);
  }
  function stairs(p: T.Group, up = true) {
    const g = new T.Group();
    p.add(g);
    const riser = 3.6 / 22;
    for (let i = 0; i < 11; i++) {
      const y = (i + 1) * riser;
      box(g, 2.94, y / 2, 5.1 + i * 0.257, 0.9, y, 0.257, stone);
      box(g, 2.94, y + 0.012, 5.1 + i * 0.257, 0.92, 0.026, 0.259, wood);
    }
    box(g, 3.51, 1.74, 7.93, 2.04, 0.12, 0.55, stone);
    for (let i = 0; i < 11; i++) {
      const y = 1.8 + (i + 1) * riser;
      box(g, 4.06, y - 0.08, 7.65 - i * 0.257, 0.9, 0.16, 0.257, stone);
      box(g, 4.06, y + 0.013, 7.65 - i * 0.257, 0.92, 0.026, 0.259, wood);
    }
    line(g, [3.4, 0.85, 5.1], [3.4, 2.65, 7.93], 0.025);
    line(g, [3.6, 2.65, 7.93], [3.6, 4.35, 5.1], 0.025);
    for (let i = 0; i < 11; i++) {
      line(
        g,
        [3.4, (i + 1) * riser, 5.1 + i * 0.257],
        [3.4, (i + 1) * riser + 0.85, 5.1 + i * 0.257],
        0.012,
      );
      line(
        g,
        [3.6, 1.8 + (i + 1) * riser, 7.65 - i * 0.257],
        [3.6, 2.65 + (i + 1) * riser, 7.65 - i * 0.257],
        0.012,
      );
    }
    if (!up) {
      g.visible = false;
    }
    return g;
  }

  function planter(p: T.Object3D, x: number, z: number, w: number, d: number) {
    box(p, x, 0.18, z, w, 0.34, d, cream, 0.035);
    box(p, x, 0.36, z, w - 0.12, 0.025, d - 0.12, mat('#514c40'));
    for (let j = 0; j < 5; j++) {
      const xx = x - w * 0.35 + j * w * 0.175;
      ball(p, xx, 0.5, z, 0.18, green, 1, 0.7, 1);
      for (let k = 0; k < 3; k++)
        ball(
          p,
          xx + 0.06 * Math.sin(k * 2),
          0.66,
          z + 0.07 * Math.cos(k * 2),
          0.045,
          mat(j % 2 ? '#eee7da' : '#b6808c'),
          1,
          0.6,
          1,
        );
    }
  }
  for (let i = 0; i < 4; i++) {
    const g = new T.Group(),
      walls = new T.Group(),
      furn = new T.Group(),
      labels = new T.Group(),
      interior = new T.Group(),
      internalWalls = new T.Group();
    groups.push(g);
    wallGroups.push(walls);
    furnGroups.push(furn);
    labelGroups.push(labels);
    g.add(walls, interior, labels);
    interior.position.z = SITE.houseDepth;
    interior.scale.z = -1;
    interior.add(furn, internalWalls);
    scene.add(g);
    if (i < 3)
      poly(
        g,
        i === 0 ? outline : outlineUpper,
        0,
        0.19,
        i === 2 ? mat('#c8c9bc') : stone,
        i > 0,
      );
    else
      poly(
        g,
        [
          [1.26, interiorZ(2.84)],
          [4.76, interiorZ(2.84)],
          [4.76, interiorZ(8.34)],
          [1.26, interiorZ(8.34)],
        ],
        0,
        0.2,
        mat('#bcc7c8'),
      );

    if (i < 2) {
      wall(walls, 0, 0, 0, SITE.houseDepth);
      wall(walls, 4.76, 0, 4.76, SITE.houseDepth);
      const angle = 0;

      // A broad main doorway leads directly to the living room.
      if (i === 0) {
        wall(walls, 0, SITE.houseDepth, 0.98, SITE.houseDepth);
        wall(walls, 3.78, SITE.houseDepth, SITE.width, SITE.houseDepth);
        // Main living-room entrance, set in front of the facade for a clear cutaway view.
        doubleDoor(walls, 2.38, SITE.houseDepth + 0.13, 2.8);
        box(
          g,
          2.38,
          -0.08,
          SITE.houseDepth + 0.18,
          2.9,
          0.12,
          0.34,
          stone,
          0.02,
        );
      } else {
        for (const [a, b] of [
          [0, 0.5],
          [1.95, 2.22],
          [3.14, 4.76],
        ])
          wall(walls, a, SITE.houseDepth, b, SITE.houseDepth);
        windowPanel(walls, 1.225, SITE.houseDepth, 1.45, 0);
        wall(walls, 0.5, SITE.houseDepth, 1.95, SITE.houseDepth, 0.79);
        door(walls, 2.68, SITE.houseDepth, 0.96);
      }
      const lintel = box(
        walls,
        2.38,
        3.04,
        frontZ(2.38),
        SITE.width,
        0.74,
        0.16,
        cream,
      );
      lintel.rotation.y = angle;
      lintel.userData.section = true;

      if (i === 0) {
        wall(walls, 0, 0, 0.5, 0);
        wall(walls, 1.95, 0, 2.22, 0);
        wall(walls, 3.14, 0, 4.76, 0);
        windowPanel(walls, 1.225, 0, 1.45);
        wall(walls, 0.5, 0, 1.95, 0, 0.79);
        door(walls, 2.68, -0.13, 0.96);
        box(g, 2.68, -0.12, -0.22, 1.1, 0.18, 0.44, stone);
      } else {
        wall(walls, 0, 0, 0.98, 0);
        wall(walls, 3.78, 0, 4.76, 0);
        windowPanel(walls, 2.38, 0, 2.8);
        box(walls, 2.38, 0.37, 0, 2.8, 0.74, 0.16, cream).userData.section =
          true;
        railing(g, 0.04, frontZ(0.04) + 1.16, 4.72, frontZ(4.72) + 1.16);
        railing(g, 0.04, frontZ(0.04), 0.04, frontZ(0.04) + 1.16);
        railing(g, 4.72, frontZ(4.72), 4.72, frontZ(4.72) + 1.16);
        planter(g, 0.47, frontZ(0.47) + 0.59, 0.55, 0.52);
        planter(g, 4.25, frontZ(4.25) + 0.59, 0.55, 0.52);
      }
      const rearLintel = box(walls, 2.38, 3.04, 0, 2.8, 0.74, 0.16, cream);
      rearLintel.userData.section = true;
      // Floor-edge beams and all walls stay rectangular.
      for (const y of [-0.075, 3.38]) {
        const beam = box(
          g,
          2.38,
          y,
          frontZ(2.38),
          SITE.width,
          0.15,
          0.22,
          cream,
        );
        beam.rotation.y = angle;
      }
      for (const x of [0.04, 4.72])
        box(g, x, 1.7, frontZ(x), 0.16, 3.4, 0.16, cream);
    }
    if (i === 0) {
      rug(furn, 2.85, 2.5, 2.45, 2.6);
      sofa(furn, 4.1, 2.5);
      const ct = new T.Group();
      ct.position.set(2.85, 0, 2.5);
      ct.scale.set(0.8, 1, 0.75);
      furn.add(ct);
      coffee(ct, 0, 0);
      for (const z of [3.5]) {
        const ch = new T.Group();
        ch.position.set(1.65, 0, z);
        ch.rotation.y = -Math.PI / 2;
        furn.add(ch);
        box(ch, 0, 0.45, 0, 0.7, 0.28, 0.7, fabric, 0.08);
        box(ch, 0, 0.75, 0.31, 0.73, 0.68, 0.14, fabric, 0.05);
        for (const x of [-0.32, 0.32])
          box(ch, x, 0.62, 0, 0.09, 0.3, 0.65, wood, 0.025);
        for (const x of [-0.26, 0.26])
          for (const zz of [-0.26, 0.26])
            box(ch, x, 0.17, zz, 0.05, 0.35, 0.05, wood);
      }
      box(furn, 0.27, 0.34, 2.5, 0.35, 0.55, 2.5, wood, 0.02);
      box(furn, 0.13, 1.28, 2.5, 0.05, 0.85, 1.65, black, 0.01);
      plant(furn, 4.15, 0.6, 1.25);
      plant(furn, 0.5, 4.2, 0.85);

      // Four places: two on a wall bench and one at each end keep the aisle open.
      box(furn, 0.31, 0.23, 6.5, 0.5, 0.32, 1.36, wood, 0.035);
      box(furn, 0.32, 0.44, 6.5, 0.49, 0.15, 1.32, fabric, 0.045);
      box(furn, 0.12, 0.72, 6.5, 0.1, 0.6, 1.36, fabric, 0.04);
      table(furn, 1.03, 6.5, 0.78, 1.25);
      chair(furn, 1.03, 5.55, Math.PI);
      chair(furn, 1.03, 7.45);
      cyl(furn, 1.03, 0.88, 6.5, 0.08, 0.18, mat('#7c8d7a'));
      stairs(interior);
      wall(internalWalls, 3.16, 8.34, 4.76, 8.34);
      wall(internalWalls, 3.16, 8.34, 3.16, 9.9);
      wall(internalWalls, 3.16, 10.8, 3.16, SITE.houseDepth);
      door(internalWalls, 3.16, 10.35, 0.9, Math.PI / 2);
      wall(internalWalls, 3.16, 9.95, 4.76, 9.95);
      box(furn, 0.46, 0.45, 10.3, 0.67, 0.87, 2.1, wood, 0.02);
      box(furn, 0.46, 0.92, 10.3, 0.73, 0.065, 2.15, white);
      for (let k = 0; k < 4; k++) {
        box(
          furn,
          0.808,
          0.44,
          9.52 + k * 0.52,
          0.02,
          0.78,
          0.5,
          mat('#c8a47e'),
        );
        box(furn, 0.835, 0.72, 9.52 + k * 0.52, 0.02, 0.025, 0.21, black);
      }
      box(furn, 0.46, 0.965, 10.25, 0.58, 0.025, 0.7, black, 0.01);
      for (const z of [10.06, 10.44])
        for (const x of [0.31, 0.6])
          cyl(furn, x, 0.989, z, 0.105, 0.014, mat('#657075'));
      box(furn, 0.46, 0.925, 8.78, 0.7, 1.81, 0.72, mat('#788485'), 0.03);
      box(furn, 0.83, 1.0, 8.78, 0.04, 0.045, 0.51, black);
      const counter = new T.Group();
      counter.position.set(1.35, 0, SITE.houseDepth - 0.37);
      counter.rotation.y = 0;
      furn.add(counter);
      box(counter, 0, 0.45, 0, 1.55, 0.9, 0.58, wood);
      box(counter, 0, 0.93, 0, 1.6, 0.06, 0.62, white);
      for (const x of [-0.26, 0.26])
        box(counter, x, 0.968, 0, 0.45, 0.02, 0.42, mat('#899e9e'), 0.05);
      line(counter, [0, 0.97, 0.22], [0, 1.23, 0.22], 0.025);
      line(counter, [0, 1.23, 0.22], [0, 1.23, 0], 0.025);
      box(furn, 4.23, 0.46, 9.45, 0.7, 0.88, 0.65, white, 0.025);
      const wash = new T.Mesh(new T.TorusGeometry(0.23, 0.04, 10, 30), black);
      wash.position.set(4.23, 0.46, 9.11);
      furn.add(wash);
      sink(furn, 3.6, 8.72);
      toilet(furn, 4.15, SITE.houseDepth - 0.52);
      sink(furn, 4.19, 10.48);
      shower(furn, 4.05, 9.2, 0.9, 1.0);
      box(furn, 4.68, 1.52, 10.48, 0.035, 0.8, 0.58, mat('#a5c0bf', 0.08, 0.6));
    }
    if (i === 1) {
      for (const z of [4.84, 8.34]) {
        wall(internalWalls, 0, z, 1.4, z);
        wall(internalWalls, 2.3, z, 4.76, z);
        door(internalWalls, 1.85, z, 0.9);
      }
      wall(internalWalls, 0, 5.84, 0.35, 5.84);
      wall(internalWalls, 1.15, 5.84, 1.5, 5.84);
      door(internalWalls, 0.75, 5.84, 0.8);
      wall(internalWalls, 1.5, 5.84, 1.5, 8.34);
      bed(furn, 2.25, '#8eaaa1');
      bed(furn, 10.47, '#be936d');
      wardrobe(furn, 3.48, 4.4, 1.95, 0.52);
      wardrobe(furn, 3.48, 8.73, 1.95, 0.52);
      for (const z of [2.2, 10.5]) {
        box(furn, 0.32, 0.4, z, 0.38, 0.65, 2.15, wood, 0.02);
        box(furn, 0.14, 1.38, z, 0.045, 0.78, 1.36, black, 0.01);
      }
      toilet(furn, 0.78, 7.88);
      sink(furn, 0.57, 6.32);
      shower(furn, 0.78, 7.0, 0.9, 0.95);
      box(furn, 0.77, 0.014, 7.1, 1.25, 0.02, 2.25, mat('#beced0'));
      stairs(interior);
    }
    if (i === 2) {
      wall(internalWalls, 1.26, 2.84, 2.66, 2.84, 3.11);
      wall(internalWalls, 3.86, 2.84, 4.76, 2.84, 3.11);
      door(internalWalls, 3.26, 2.84, 1.2);
      wall(internalWalls, 1.26, 2.84, 1.26, 8.34);
      wall(internalWalls, 4.76, 2.84, 4.76, 8.34);
      wall(internalWalls, 1.26, 8.34, 1.5, 8.34);
      wall(internalWalls, 2.4, 8.34, 4.76, 8.34);
      door(internalWalls, 1.95, 8.34, 0.9);
      wall(internalWalls, 1.26, 4.84, 2.45, 4.84);
      railing(g, 0.03, 0.03, 4.73, 0.03);
      railing(g, 0.03, 0.03, 0.03, frontZ(0.03) + 1.17);
      railing(g, 0.03, frontZ(0.03) + 1.17, 4.73, frontZ(4.73) + 1.17);
      railing(g, 4.73, frontZ(4.73) + 1.17, 4.73, interiorZ(2.84));
      railing(g, 4.73, 0.03, 4.73, interiorZ(8.34));
      stairs(interior, false);
      box(furn, 4.18, 0.53, 3.85, 0.75, 1.04, 1.46, darkwood, 0.025);
      box(furn, 4.18, 1.09, 3.85, 0.85, 0.1, 1.6, darkwood);
      box(furn, 4.56, 1.55, 3.85, 0.035, 2.35, 1.8, wood);
      for (let j = 0; j < 13; j++)
        box(furn, 4.529, 1.55, 3.02 + j * 0.138, 0.026, 2.25, 0.036, darkwood);
      cyl(furn, 4.15, 1.25, 3.85, 0.12, 0.2, mat('#b29052', 0.3, 0.6));
      for (const z of [3.3, 4.4]) {
        cyl(furn, 4.15, 1.3, z, 0.07, 0.34, mat('#b29052', 0.3, 0.6));
        ball(furn, 4.15, 1.51, z, 0.08, mat('#e9d2a0'));
      }
      rug(furn, 3.05, 3.85, 1.25, 1.3, '#bda385');
      plant(furn, 0.43, 0.55, 1.15);
      plant(furn, 4.24, 0.55, 1.1);
      plant(furn, 0.4, 10.9, 1.5);
      plant(furn, 4.2, SITE.houseDepth - 0.55, 1.2);
      table(furn, 3.05, 1.42, 0.8, 0.65);
      chair(furn, 2.3, 1.42, -Math.PI / 2);
      chair(furn, 3.8, 1.42, Math.PI / 2);
      box(furn, 1.4, 0.38, 10.7, 1.8, 0.2, 0.7, wood, 0.04);
      for (const x of [0.7, 2.1])
        box(furn, x, 0.17, 10.7, 0.1, 0.34, 0.55, black);
      plant(furn, 3.75, 10.75, 1.1);
      for (let x = 0.4; x < 4.7; x += 0.6) {
        line(g, [x, 0.008, 0.1], [x, 0.008, 2.72], 0.005, mat('#a5aaa2'));
        line(
          g,
          [x, 0.008, 8.45],
          [x, 0.008, SITE.houseDepth + SITE.balconyDepth - 0.1],
          0.005,
          mat('#a5aaa2'),
        );
      }
      for (
        let z = 0.6;
        z < SITE.houseDepth + SITE.balconyDepth - 0.1;
        z += 0.6
      ) {
        const start = 0.1;
        if (z < 2.75 || z > 8.4)
          line(g, [start, 0.009, z], [4.65, 0.009, z], 0.005, mat('#a5aaa2'));
      }
    }
    if (i === 3) {
      for (const [a, b] of [
        [
          [1.26, 2.84],
          [4.76, 2.84],
        ],
        [
          [4.76, 2.84],
          [4.76, 8.34],
        ],
        [
          [4.76, 8.34],
          [1.26, 8.34],
        ],
        [
          [1.26, 8.34],
          [1.26, 2.84],
        ],
      ] as number[][][])
        wall(internalWalls, a[0], a[1], b[0], b[1], 0.25, 0.12, mat('#aebcbd'));
      for (let x = 1.6; x < 4.7; x += 0.4)
        line(
          interior,
          [x, 0.011, 2.98],
          [x, 0.011, 8.2],
          0.006,
          mat('#8fa1a2'),
        );
      for (let z = 3.2; z < 8.2; z += 0.4)
        line(interior, [1.4, 0.012, z], [4.6, 0.012, z], 0.006, mat('#8fa1a2'));
    }
  }

  // Assembled model: floors never move apart or reset to ground level.
  const levels = SITE.levels;
  groups.forEach((g, i) => {
    g.position.y = levels[i];
    labelGroups[i].visible = false;
    const copies = new Map<T.Material, T.Material>();
    function cutObject(o: T.Object3D, inherited = false) {
      const section = inherited || o.userData.section === true;
      const mesh = o as T.Mesh;
      if (section && mesh.material) {
        const clone = (m: T.Material) => {
          let c = copies.get(m);
          if (!c) {
            c = m.clone();
            c.clippingPlanes = [sideCuts[i]];
            c.clipShadows = true;
            copies.set(m, c);
          }
          return c;
        };
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map(clone)
          : clone(mesh.material);
      }
      o.children.forEach((ch) => cutObject(ch, section));
    }
    cutObject(g);
  });

  // 56 m² forecourt is an explicit estimate, separate from the ~60 m² house.
  const yard = new T.Group();
  scene.add(yard);
  const paving = mat('#ccd0c9'),
    fence = mat('#344d50'),
    soil = mat('#514c40');
  poly(yard, yardOutline, -0.025, 0.15, paving);
  // Two street frontages provide a legible main gate and a separate rear exit.
  const frontStreet = box(
    scene,
    2.38,
    -0.32,
    gateZ + 1.15,
    7.4,
    0.08,
    1.6,
    mat('#bbc5ca'),
  );
  frontStreet.rotation.y = -Math.atan2(SITE.streetSkew, SITE.width);
  box(scene, 2.38, -0.32, -1.15, 7.4, 0.08, 1.2, mat('#bbc5ca'));
  for (const x of [0.04, 4.72]) {
    const from = frontZ(x),
      len = boundaryZ(x) - from;
    box(yard, x, 0.54, from + len / 2, 0.13, 1.15, len, cream);
    box(yard, x, 1.13, from + len / 2, 0.18, 0.045, len, paving);
    for (const z of [from + 1, boundaryZ(x) - 3, boundaryZ(x)])
      box(yard, x, 0.9, z, 0.2, 1.85, 0.2, cream);
  }
  for (let z = 14.65; z < boundaryZ(0) - 0.25; z += 0.62)
    line(yard, [0.64, -0.018, z], [4.12, -0.018, z], 0.005, mat('#b0b9b1'));
  // Recessed planting stays at the edges; the middle remains usable open court.
  for (const x of [0.37, 4.39]) {
    const from = frontZ(x) + 1.45,
      to = boundaryZ(x) - 1.45,
      len = to - from;
    box(yard, x, 0.1, (from + to) / 2, 0.55, 0.24, len, cream, 0.025);
    box(yard, x, 0.225, (from + to) / 2, 0.45, 0.022, len - 0.12, soil);
    for (let z = from + 0.35; z < to - 0.15; z += 0.6) {
      ball(yard, x, 0.32, z, 0.2, green, 1, 0.6, 1.1);
      for (let j = 0; j < 3; j++)
        ball(
          yard,
          x + 0.07 * Math.sin(j * 2),
          0.46,
          z + 0.08 * Math.cos(j * 2),
          0.045,
          mat(j % 2 ? '#ecded5' : '#ba83a0'),
          1,
          0.7,
          1,
        );
    }
  }
  // Planting at the rectangular house frontage leaves the entrance clear.
  planter(yard, 0.62, frontZ(0.62) + 0.65, 0.66, 0.55);
  planter(yard, 4.08, frontZ(4.08) + 0.68, 0.72, 0.55);
  function tree(x: number, z: number) {
    cyl(yard, x, 0.22, z, 0.3, 0.44, cream, 0.25);
    line(yard, [x, 0.35, z], [x, 2.1, z], 0.045, wood);
    for (let k = 0; k < 5; k++) {
      const a = k * 2.4;
      line(
        yard,
        [x, 1.4, z],
        [x + Math.cos(a) * 0.35, 2.05, z + Math.sin(a) * 0.35],
        0.015,
        wood,
      );
      ball(
        yard,
        x + Math.cos(a) * 0.22,
        2.07 + k * 0.09,
        z + Math.sin(a) * 0.22,
        0.34,
        mat(k % 2 ? '#628263' : '#4d735a'),
        1,
        1.3,
        1,
      );
    }
  }
  tree(0.66, 20.9);
  tree(4.1, 17.5);
  // A wall bench and stepping pads create a modest garden nook without an island.
  box(yard, 0.77, 0.4, 17.55, 0.58, 0.13, 1.7, wood, 0.035);
  for (const z of [16.94, 18.16])
    box(yard, 0.77, 0.19, z, 0.48, 0.38, 0.09, fence);
  for (let z = 15; z < gateZ - 1; z += 0.85)
    box(yard, 2.7, -0.006, z, 1.2, 0.03, 0.64, mat('#e6e5de'), 0.012);
  // The open strip in front of the rear door remains unobstructed.
  const rearLanding = box(
    scene,
    2.68,
    -0.14,
    -0.43,
    1.12,
    0.12,
    0.7,
    paving,
    0.02,
  );
  rearLanding.userData.exit = true;

  // Only this entrance boundary follows the estimated skew of the land.
  const gateFrame = new T.Group();
  gateFrame.position.set(SITE.width / 2, 0, gateZ);
  gateFrame.rotation.y = -Math.atan2(SITE.streetSkew, SITE.width);
  yard.add(gateFrame);
  for (const x of [-1.6, 1.6]) {
    box(gateFrame, x, 1.02, 0, 0.22, 2.1, 0.25, cream);
    box(gateFrame, x, 1.6, 0.15, 0.08, 0.22, 0.035, fence);
    box(gateFrame, x, 1.6, 0.175, 0.05, 0.16, 0.014, mat('#ffe4b9'));
  }
  for (const x of [-2.075, 2.075])
    box(gateFrame, x, 0.76, 0, 0.75, 1.55, 0.13, cream);
  const gateLeaves: T.Group[] = [];
  for (let side = 0; side < 2; side++) {
    const g = new T.Group();
    g.position.set(side === 0 ? -1.48 : 1.48, 0, 0);
    gateFrame.add(g);
    gateLeaves.push(g);
    const sign = side === 0 ? 1 : -1;
    for (const y of [0.12, 1.86])
      box(g, sign * 0.735, y, 0, 1.47, 0.045, 0.055, fence);
    for (let j = 0; j < 16; j++)
      box(g, sign * (0.025 + j * 0.095), 0.99, 0, 0.035, 1.74, 0.045, fence);
    box(g, sign * 1.35, 0.99, 0.055, 0.025, 0.33, 0.025, wood);
  }
  box(gateFrame, 0, -0.006, -0.22, 2.92, 0.015, 0.1, fence);
  let mode = 'free',
    progress = 0,
    dirty = true;
  const keys = new Set<string>();
  const moveKeys = new Set([
    'KeyW',
    'KeyA',
    'KeyS',
    'KeyD',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ShiftLeft',
    'ShiftRight',
  ]);
  const onKeyDown = (event: KeyboardEvent) => {
    if (mode !== 'free' || !moveKeys.has(event.code)) return;
    event.preventDefault();
    keys.add(event.code);
  };
  const onKeyUp = (event: KeyboardEvent) => keys.delete(event.code);
  const focusHost = () => host.focus();
  host.addEventListener('keydown', onKeyDown);
  host.addEventListener('keyup', onKeyUp);
  renderer.domElement.addEventListener('pointerdown', focusHost);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const changed = () => {
    dirty = true;
  };
  controls.addEventListener('change', changed);
  let tween: { pos: T.Vector3; target: T.Vector3 } | null = null;
  const desiredEye = new T.Vector3(),
    desiredLook = new T.Vector3();
  function refreshTour() {
    const w = host.clientWidth,
      h = host.clientHeight;
    if (w && h) {
      const offset = 0;
      camera.setViewOffset(w, h, offset, 0, w, h);
    }
    const s = sampleTour(progress);
    desiredEye.set(...s.eye);
    desiredLook.set(...s.look);
    upperCut.constant = s.ceiling;
    // Widen only the overview framing on small screens; keep room views human scale.
    if (progress < 0.14 || progress > 0.96) {
      const f = Math.max(1, Math.min(1.85, 0.95 / camera.aspect));
      desiredEye.sub(desiredLook).multiplyScalar(f).add(desiredLook);
    }
    tween = { pos: desiredEye.clone(), target: desiredLook.clone() };
  }
  function setSection(on: boolean) {
    dirty = true;
    sideCuts.forEach((p, i) => (p.constant = on ? levels[i] + 0.68 : 40));
  }
  function setMode(m: string) {
    dirty = true;
    mode = m === 'free' ? 'free' : 'tour';
    controls.enabled = mode === 'free';
    controls.autoRotate = false;
    if (mode === 'tour') refreshTour();
    else {
      camera.clearViewOffset();
      upperCut.constant = 20;
      view('iso');
    }
  }
  function seek(p: number) {
    progress = T.MathUtils.clamp(Number.isFinite(p) ? p : 0, 0, 1);
    if (mode === 'tour') refreshTour();
  }
  function view(v: string) {
    const center = new T.Vector3(2.38, 3.4, gateZ / 2),
      k = Math.max(1, Math.min(1.85, 0.95 / camera.aspect));
    const pos =
      v === 'top'
        ? new T.Vector3(2.38, 43 * k, gateZ / 2 + 0.01)
        : new T.Vector3(2.38 - 19 * k, 3.4 + 18 * k, gateZ / 2 + 29 * k);
    tween = { pos, target: center };
  }
  function down() {
    if (mode === 'free') tween = null;
  }
  renderer.domElement.addEventListener('pointerdown', down);
  const resize = new ResizeObserver(() => {
    const w = host.clientWidth,
      h = host.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    dirty = true;
    if (mode === 'tour') refreshTour();
  });
  resize.observe(host);
  renderer.setSize(host.clientWidth, host.clientHeight);
  camera.position.set(-17, 21, gateZ / 2 + 29);
  controls.target.set(2.38, 3.4, gateZ / 2);
  camera.lookAt(controls.target);
  setSection(false);
  setMode('free');
  let frame = 0,
    disposed = false,
    lastTime = 0;
  function animate(time = 0) {
    if (disposed) return;
    frame = requestAnimationFrame(animate);
    const dt = Math.min(0.05, (time - lastTime) / 1000);
    lastTime = time;
    if (document.hidden) return;
    if (tween) {
      dirty = true;
      const ease = reduced ? 1 : 1 - Math.exp(-dt * 7);
      camera.position.lerp(tween.pos, ease);
      controls.target.lerp(tween.target, ease);
      if (
        camera.position.distanceTo(tween.pos) < 0.004 &&
        controls.target.distanceTo(tween.target) < 0.004
      )
        tween = null;
    }
    const gateAngle =
      mode === 'tour'
        ? T.MathUtils.smoothstep(progress, 0.1, 0.17) * 1.4
        : 0.35;
    if (Math.abs(gateAngle - gateLeaves[0].rotation.y) > 0.001) dirty = true;
    gateLeaves[0].rotation.y = T.MathUtils.damp(
      gateLeaves[0].rotation.y,
      gateAngle,
      7,
      dt,
    );
    gateLeaves[1].rotation.y = T.MathUtils.damp(
      gateLeaves[1].rotation.y,
      -gateAngle,
      7,
      dt,
    );
    if (mode === 'free') {
      if (keys.size) {
        const forward = new T.Vector3().subVectors(
          controls.target,
          camera.position,
        );
        forward.y = 0;
        if (forward.lengthSq() > 0) forward.normalize();
        const right = new T.Vector3(-forward.z, 0, forward.x);
        const direction = new T.Vector3();
        if (keys.has('KeyW') || keys.has('ArrowUp')) direction.add(forward);
        if (keys.has('KeyS') || keys.has('ArrowDown')) direction.sub(forward);
        if (keys.has('KeyD') || keys.has('ArrowRight')) direction.add(right);
        if (keys.has('KeyA') || keys.has('ArrowLeft')) direction.sub(right);
        if (direction.lengthSq() > 0) {
          const speed =
            3.2 *
            (keys.has('ShiftLeft') || keys.has('ShiftRight') ? 2 : 1) *
            dt;
          direction.normalize().multiplyScalar(speed);
          camera.position.add(direction);
          controls.target.add(direction);
          const minX = -7,
            maxX = SITE.width + 7,
            minZ = -9,
            maxZ = gateZ + 11;
          camera.position.x = T.MathUtils.clamp(camera.position.x, minX, maxX);
          camera.position.z = T.MathUtils.clamp(camera.position.z, minZ, maxZ);
          controls.target.x = T.MathUtils.clamp(controls.target.x, minX, maxX);
          controls.target.z = T.MathUtils.clamp(controls.target.z, minZ, maxZ);
          dirty = true;
        }
      }
      controls.update();
    } else camera.lookAt(controls.target);
    if (dirty) {
      renderer.render(scene, camera);
      dirty = false;
    }
  }
  animate();
  return {
    seek,
    setMode,
    setSection,
    view,
    zoom(f) {
      tween = null;
      camera.position
        .sub(controls.target)
        .multiplyScalar(f)
        .add(controls.target);
      controls.update();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      controls.removeEventListener('change', changed);
      controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', down);
      renderer.domElement.removeEventListener('pointerdown', focusHost);
      host.removeEventListener('keydown', onKeyDown);
      host.removeEventListener('keyup', onKeyUp);
      const geometries = new Set<T.BufferGeometry>(),
        materials = new Set<T.Material>(),
        textures = new Set<T.Texture>();
      scene.traverse((o) => {
        const m = o as T.Mesh;
        if (m.geometry) geometries.add(m.geometry);
        if (m.material)
          (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) =>
            materials.add(x),
          );
      });
      materials.forEach((m) => {
        const map = (m as T.MeshStandardMaterial).map;
        if (map) textures.add(map);
        m.dispose();
      });
      textures.forEach((t) => t.dispose());
      geometries.forEach((g) => g.dispose());
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
