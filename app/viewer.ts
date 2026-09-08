import * as T from 'three';
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
    (y) => new T.Plane(new T.Vector3(0, -1, 0), y + 0.3),
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
  controls.maxDistance = 65;
  controls.maxPolarAngle = Math.PI * 0.495;
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
      path.moveTo(2.43, -5);
      path.lineTo(2.43, -8.1);
      path.lineTo(4.56, -8.1);
      path.lineTo(4.56, -5);
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
  box(scene, 2.38, -0.36, 6.05, 5.6, 0.2, 15.1, mat('#d8dfe2'), 0.12);
  const ground = new T.Mesh(new T.PlaneGeometry(200, 200), mat('#e9eef1'));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.5;
  ground.receiveShadow = true;
  scene.add(ground);
  const groups: T.Group[] = [],
    wallGroups: T.Group[] = [],
    furnGroups: T.Group[] = [],
    labelGroups: T.Group[] = [];
  const outline = [
    [0, 0],
    [4.76, 0],
    [4.76, 11.84],
    [0, 11.84],
  ];
  const outlineUpper = [
    [0, -1.2],
    [4.76, -1.2],
    [4.76, 11.84],
    [0, 11.84],
  ];
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
    g.userData.section = true;
    box(g, -width / 2, 1.15, 0, 0.055, 2.3, 0.15, wood);
    box(g, width / 2, 1.15, 0, 0.055, 2.3, 0.15, wood);
    box(g, 0, 2.28, 0, width, 0.06, 0.15, wood);
    const leaf = new T.Group();
    leaf.position.x = -width / 2;
    leaf.rotation.y = -0.85;
    g.add(leaf);
    box(leaf, width / 2, 1.1, 0, width - 0.05, 2.2, 0.045, wood);
    box(leaf, width - 0.14, 1.04, 0.05, 0.1, 0.035, 0.03, black);
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
    box(g, 0, 0.61, 0.2, 0.45, 0.55, 0.19, white, 0.06);
    ball(g, 0, 0.33, -0.07, 0.3, white, 0.72, 1, 1.2);
    const ring = new T.Mesh(new T.TorusGeometry(0.19, 0.055, 10, 30), white);
    ring.rotation.x = Math.PI / 2;
    ring.scale.y = 1.3;
    ring.position.set(0, 0.48, -0.11);
    g.add(ring);
    ball(g, 0, 0.458, -0.11, 0.17, mat('#52646a'), 0.85, 0.08, 1.3);
  }
  function sink(p: T.Object3D, x: number, z: number) {
    box(p, x, 0.45, z, 0.65, 0.8, 0.48, wood, 0.02);
    box(p, x, 0.88, z, 0.7, 0.08, 0.52, white, 0.045);
    ball(p, x, 0.918, z, 0.23, mat('#afbec0'), 1, 0.06, 0.7);
    line(p, [x, 0.91, z + 0.15], [x, 1.15, z + 0.15], 0.025);
    line(p, [x, 1.15, z + 0.15], [x, 1.15, z], 0.025);
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
      labels = new T.Group();
    groups.push(g);
    wallGroups.push(walls);
    furnGroups.push(furn);
    labelGroups.push(labels);
    g.add(walls, furn, labels);
    scene.add(g);
    if (i < 3)
      poly(
        g,
        i === 0 ? outline : outlineUpper,
        0,
        0.18,
        i === 2 ? mat('#c8ccc8') : stone,
        i > 0,
      );
    else
      poly(
        g,
        [
          [1.26, 2.84],
          [4.76, 2.84],
          [4.76, 8.34],
          [1.26, 8.34],
        ],
        0,
        0.2,
        mat('#b2c0c1'),
      );
    if (i < 2) {
      wall(walls, 0, 0, 0, 11.84);
      wall(walls, 4.76, 0, 4.76, 11.84);
      wall(walls, 0, 0, 0.55, 0);
      wall(walls, 4.15, 0, 4.76, 0);
      windowPanel(walls, 2.35, 0, 3.6);
      box(walls, 2.35, 0.37, 0, 3.6, 0.74, 0.16, cream).userData.section = true;
      box(walls, 2.35, 3, 0, 3.6, 0.8, 0.16, cream).userData.section = true;
      wall(walls, 0, 11.84, 0.45, 11.84);
      wall(walls, 4.3, 11.84, 4.76, 11.84);
      const opening = new T.Group();
      opening.userData.section = true;
      walls.add(opening);
      box(opening, 2.38, 1.45, 11.84, 3.84, 2.9, 0.025, glass);
      for (const x of [0.46, 1.42, 2.38, 3.34, 4.3])
        box(opening, x, 1.45, 11.86, 0.035, 2.9, 0.065, black);
      for (const y of [0.04, 2.9])
        box(opening, 2.38, y, 11.86, 3.9, 0.04, 0.075, black);
      box(opening, 2.25, 1.1, 11.91, 0.025, 0.35, 0.035, black);
      if (i === 1) {
        box(opening, 2.38, 0.36, 11.84, 3.85, 0.72, 0.16, cream);
        railing(g, 0.05, -1.15, 4.71, -1.15);
        railing(g, 0.05, -1.15, 0.05, 0);
        railing(g, 4.71, -1.15, 4.71, 0);
        planter(g, 3.8, -0.6, 1, 0.4);
      }
      for (const y of [-0.08, 3.38])
        box(g, 2.38, y, 11.9, 4.9, 0.14, 0.32, cream);
      for (const x of [0.04, 4.72])
        box(g, x, 1.7, 11.84, 0.16, 3.4, 0.24, cream);
      for (let k = 0; k < 7; k++)
        box(g, 4.38 + k * 0.04, 1.6, 11.96, 0.022, 2.85, 0.045, wood);
      for (const z of [2.35, 10.05]) {
        line(furn, [2.7, 3.35, z], [2.7, 2.6, z], 0.009, black);
        cyl(furn, 2.7, 2.53, z, 0.19, 0.14, cream, 0.27);
        cyl(furn, 2.7, 2.45, z, 0.22, 0.014, mat('#ffe4ac'));
      }
    }
    if (i === 0) {
      // Kitchen at the rear, living room facing the corrected gate side.
      box(furn, 0.48, 0.43, 2.55, 0.64, 0.86, 3.15, wood, 0.025);
      box(furn, 0.48, 0.89, 2.55, 0.7, 0.055, 3.2, white, 0.018);
      for (let k = 0; k < 5; k++)
        box(furn, 0.807, 0.44, 1.3 + k * 0.6, 0.015, 0.77, 0.575, cream, 0.01);
      box(furn, 0.49, 0.915, 3.25, 0.55, 0.025, 0.64, black, 0.008);
      for (const z of [3.08, 3.43])
        for (const x of [0.34, 0.63])
          cyl(furn, x, 0.938, z, 0.095, 0.01, mat('#647174'));
      box(furn, 0.49, 0.92, 1.65, 0.49, 0.02, 0.56, mat('#8c9b9e'), 0.04);
      line(furn, [0.22, 0.93, 1.8], [0.22, 1.18, 1.8], 0.016);
      line(furn, [0.22, 1.18, 1.8], [0.45, 1.18, 1.8], 0.016);
      box(furn, 0.48, 1.02, 0.56, 0.7, 2, 0.67, mat('#899496'), 0.025);
      box(furn, 0.84, 1.15, 0.56, 0.025, 0.46, 0.025, black);
      box(furn, 0.28, 1.86, 2.55, 0.25, 0.72, 2.1, cream, 0.015);
      table(furn, 2.72, 2.35, 1.35, 0.8);
      chair(furn, 2.32, 1.6, Math.PI);
      chair(furn, 3.12, 1.6, Math.PI);
      chair(furn, 2.32, 3.1);
      chair(furn, 3.12, 3.1);
      cyl(furn, 2.72, 0.86, 2.35, 0.08, 0.14, mat('#7c9186'));
      plant(furn, 4.22, 0.55, 0.9);
      stairs(g);
      wall(walls, 0, 5.84, 0.35, 5.84);
      wall(walls, 1.15, 5.84, 1.5, 5.84);
      door(walls, 0.75, 5.84, 0.8);
      wall(walls, 1.5, 5.84, 1.5, 8.34);
      wall(walls, 0, 8.34, 1.5, 8.34);
      toilet(furn, 0.74, 7.87);
      sink(furn, 0.63, 6.3);
      box(furn, 0.72, 0.018, 7.08, 1.22, 0.028, 2.23, mat('#bfcbcd'));
      box(furn, 0.63, 0.44, 5.15, 0.62, 0.85, 0.6, cream, 0.03);
      const ring = new T.Mesh(new T.TorusGeometry(0.2, 0.035, 8, 24), black);
      ring.position.set(0.63, 0.46, 4.84);
      furn.add(ring);
      rug(furn, 2.8, 10.03, 2.65, 2.55, '#c6c4b9');
      sofa(furn, 4.02, 10.05);
      const ct = new T.Group();
      ct.position.set(2.72, 0, 10.1);
      ct.scale.set(0.8, 1, 0.72);
      furn.add(ct);
      coffee(ct, 0, 0);
      chair(furn, 1.68, 9.1, Math.PI * 0.8);
      box(furn, 0.26, 0.29, 10.04, 0.3, 0.42, 1.6, wood, 0.025);
      box(furn, 0.12, 1.22, 10.04, 0.045, 0.77, 1.33, black, 0.012);
      plant(furn, 4.12, 8.77, 0.85);
    }
    if (i === 1) {
      for (const z of [4.84, 8.34]) {
        wall(walls, 0, z, 1.4, z);
        wall(walls, 2.3, z, 4.76, z);
        door(walls, 1.85, z, 0.9);
      }
      wall(walls, 0, 5.84, 0.35, 5.84);
      wall(walls, 1.15, 5.84, 1.5, 5.84);
      door(walls, 0.75, 5.84, 0.8);
      wall(walls, 1.5, 5.84, 1.5, 8.34);
      bed(furn, 2.2, '#9cafa5');
      bed(furn, 10.15, '#c2ac92');
      wardrobe(furn, 3.48, 4.4, 1.95, 0.52);
      wardrobe(furn, 3.48, 8.73, 1.95, 0.52);
      for (const z of [2.2, 10.15]) {
        table(furn, 0.52, z, 0.55, 1.25, 0.74);
        chair(furn, 1.1, z, Math.PI / 2);
        box(furn, 0.065, 1.65, z, 0.06, 0.8, 1.1, wood);
        box(furn, 0.105, 1.65, z, 0.015, 0.7, 1, mat('#b4c1b7'));
      }
      toilet(furn, 0.78, 7.88);
      sink(furn, 0.57, 6.32);
      box(furn, 0.77, 0.014, 7.1, 1.25, 0.02, 2.25, mat('#beced0'));
      stairs(g);
    }
    if (i === 2) {
      wall(walls, 1.26, 2.84, 2.66, 2.84, 3.11);
      wall(walls, 3.86, 2.84, 4.76, 2.84, 3.11);
      door(walls, 3.26, 2.84, 1.2);
      wall(walls, 1.26, 2.84, 1.26, 8.34, 3.11);
      wall(walls, 4.76, 2.84, 4.76, 8.34, 3.11);
      wall(walls, 1.26, 8.34, 1.5, 8.34, 3.11);
      wall(walls, 2.4, 8.34, 4.76, 8.34, 3.11);
      door(walls, 1.95, 8.34, 0.9);
      wall(walls, 1.26, 4.84, 2.45, 4.84, 3.11);
      railing(g, 0.04, -1.15, 4.72, -1.15);
      railing(g, 0.04, -1.15, 0.04, 11.8);
      railing(g, 0.04, 11.8, 4.72, 11.8);
      railing(g, 4.72, 11.8, 4.72, 8.34);
      railing(g, 4.72, -1.15, 4.72, 2.84);
      box(furn, 4.22, 0.5, 3.82, 0.62, 1, 1.28, darkwood, 0.025);
      box(furn, 4.22, 1.04, 3.82, 0.7, 0.07, 1.38, darkwood, 0.025);
      box(furn, 4.63, 1.25, 3.82, 0.05, 2.1, 1.55, wood);
      cyl(furn, 4.17, 1.16, 3.82, 0.1, 0.16, mat('#b29052', 0.3, 0.6));
      for (const z of [3.35, 4.29])
        cyl(furn, 4.17, 1.23, z, 0.05, 0.3, mat('#b29052', 0.3, 0.6));
      rug(furn, 3.15, 3.82, 1, 1.1, '#c4b493');
      planter(furn, 3.65, 0.05, 1.45, 0.45);
      plant(furn, 0.48, 0.1, 1.15);
      table(furn, 2.7, 10, 0.7, 0.7, 0.48);
      chair(furn, 1.95, 10, -Math.PI / 2);
      chair(furn, 3.45, 10, Math.PI / 2);
      planter(furn, 2.4, 11.43, 3.65, 0.42);
      plant(furn, 0.42, 9.8, 1.05);
      for (let z = 8.8; z < 11.8; z += 0.7)
        line(g, [0.16, 0.009, z], [4.6, 0.009, z], 0.004, mat('#afb8b6'));
      for (let z = -0.6; z < 2.7; z += 0.7)
        line(g, [0.16, 0.009, z], [4.6, 0.009, z], 0.004, mat('#afb8b6'));
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
        wall(walls, a[0], a[1], b[0], b[1], 0.22, 0.1, mat('#b2c0c1'));
    }
  }
  // Assembled model: floors never move apart or reset to ground level.
  const levels = [0, 3.6, 7.2, 10.5];
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

  // Corrected front at positive Z. Straightening the boundary is a proposal.
  const yard = new T.Group();
  scene.add(yard);
  const paving = mat('#c8cecb'),
    fence = mat('#344d50'),
    soil = mat('#514c40');
  box(yard, 2.38, -0.1, 12.545, 4.76, 0.16, 1.41, paving);
  for (let x = 0.6; x < 4.76; x += 0.6)
    line(yard, [x, -0.012, 11.85], [x, -0.012, 13.22], 0.006, mat('#aeb8b4'));
  for (const x of [0.06, 4.7]) {
    box(yard, x, 0.48, 12.55, 0.12, 1, 1.4, cream);
    box(yard, x, 1, 12.55, 0.17, 0.055, 1.42, paving);
  }
  poly(
    yard,
    [
      [0.14, 11.98],
      [1.04, 12.25],
      [1.04, 13.04],
      [0.14, 13.04],
    ],
    0.16,
    0.2,
    cream,
  );
  poly(
    yard,
    [
      [0.22, 12.12],
      [0.95, 12.33],
      [0.95, 12.94],
      [0.22, 12.94],
    ],
    0.18,
    0.04,
    soil,
  );
  plant(yard, 0.58, 12.65, 1.3);
  planter(yard, 4.23, 12.64, 0.64, 0.7);
  for (let i = 0; i < 6; i++)
    ball(
      yard,
      0.3 + i * 0.12,
      0.29,
      12.26 + i * 0.04,
      0.065,
      mat(i % 2 ? '#e6d7dc' : '#a85f80'),
      1,
      0.8,
      1,
    );
  for (const x of [1.16, 3.7]) {
    box(yard, x, 0.95, 13.2, 0.18, 1.94, 0.19, cream);
    box(yard, x, 1.5, 13.31, 0.08, 0.21, 0.035, black);
    box(yard, x, 1.5, 13.335, 0.05, 0.15, 0.01, mat('#ffe4ac'));
  }
  for (const x of [0.56, 4.3])
    box(yard, x, 0.74, 13.2, 0.98, 1.52, 0.12, cream);
  const gateLeaves: T.Group[] = [];
  for (let side = 0; side < 2; side++) {
    const g = new T.Group();
    g.position.set(side === 0 ? 1.26 : 3.6, 0, 13.2);
    yard.add(g);
    gateLeaves.push(g);
    const sign = side === 0 ? 1 : -1;
    for (const y of [0.12, 1.7])
      box(g, sign * 0.58, y, 0, 1.16, 0.045, 0.055, fence);
    for (let j = 0; j < 13; j++)
      box(g, sign * (0.025 + j * 0.094), 0.91, 0, 0.036, 1.59, 0.045, fence);
    box(g, sign * 1.07, 0.94, 0.055, 0.025, 0.3, 0.025, wood);
  }
  box(yard, 2.43, -0.006, 13.05, 2.28, 0.014, 0.09, black);
  let mode = 'free',
    progress = 0,
    dirty = true;
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
    const center = new T.Vector3(2.38, 4.6, 6.2),
      k = Math.max(1, Math.min(1.85, 0.95 / camera.aspect));
    const pos =
      v === 'top'
        ? new T.Vector3(2.38, 29 * k, 6.21)
        : new T.Vector3(2.38 - 15 * k, 4.6 + 11 * k, 6.2 + 21 * k);
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
  camera.position.set(-14, 16, 28);
  controls.target.set(2.38, 4.6, 6.2);
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
    if (mode === 'free') controls.update();
    else camera.lookAt(controls.target);
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
