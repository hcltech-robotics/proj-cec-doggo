import * as THREE from "three";

function convert(objData) {
  return Uint8Array.from(objData);
}
function convert32(objData) {
  return Uint32Array.from(objData);
}

export class VoxelWorld {
  scene;
  mesh = new THREE.Mesh();
  material;
  cellSize_X;
  cellSize_Y;
  cellSize_Z;
  tileSize;
  tileTextureWidth;
  tileTextureHeight;
  currCellDataInfo;
  faces = [
    {
      dir: [-1, 0, 0],
      corners: [
        { pos: [0, 1, 0], uv: [0, 1] },
        { pos: [0, 0, 0], uv: [1, 1] },
        { pos: [0, 1, 1], uv: [0, 0] },
        { pos: [0, 0, 1], uv: [1, 0] },
      ],
    },
    {
      dir: [1, 0, 0],
      corners: [
        { pos: [1, 1, 1], uv: [1, 0] },
        { pos: [1, 0, 1], uv: [0, 0] },
        { pos: [1, 1, 0], uv: [1, 1] },
        { pos: [1, 0, 0], uv: [0, 1] },
      ],
    },
    {
      dir: [0, -1, 0],
      corners: [
        { pos: [1, 0, 1], uv: [1, 0] },
        { pos: [0, 0, 1], uv: [0, 0] },
        { pos: [1, 0, 0], uv: [1, 1] },
        { pos: [0, 0, 0], uv: [0, 1] },
      ],
    },
    {
      dir: [0, 1, 0],
      corners: [
        { pos: [0, 1, 1], uv: [0, 0] },
        { pos: [1, 1, 1], uv: [1, 0] },
        { pos: [0, 1, 0], uv: [0, 1] },
        { pos: [1, 1, 0], uv: [1, 1] },
      ],
    },
    {
      dir: [0, 0, -1],
      corners: [
        { pos: [1, 0, 0], uv: [0, 0] },
        { pos: [0, 0, 0], uv: [1, 0] },
        { pos: [1, 1, 0], uv: [0, 1] },
        { pos: [0, 1, 0], uv: [1, 1] },
      ],
    },
    {
      dir: [0, 0, 1],
      corners: [
        { pos: [0, 0, 1], uv: [0, 0] },
        { pos: [1, 0, 1], uv: [1, 0] },
        { pos: [0, 1, 1], uv: [0, 1] },
        { pos: [1, 1, 1], uv: [1, 1] },
      ],
    },
  ];

  constructor(n, o) {
    (this.scene = n),
      (this.mesh = new THREE.Mesh()),
      (this.tileSize = (o == null ? void 0 : o.tileSize) || 1),
      (this.tileTextureWidth = (o == null ? void 0 : o.tileTextureWidth) || 1),
      (this.tileTextureHeight =
        (o == null ? void 0 : o.tileTextureHeight) || 1),
      (this.material =
        (o == null ? void 0 : o.material) ||
        new THREE.MeshBasicMaterial({ color: 16777215 })),
      (this.currCellDataInfo = void 0),
      (this.cellSize_X = 128),
      (this.cellSize_Y = 128),
      (this.cellSize_Z = 30);
  }
  clearVoxel() {
    this.currCellDataInfo = void 0;
  }
  adjacent(n, o) {
    const { cellSize_X: s, cellSize_Y: c, cellSize_Z: u } = this,
      [l, f, _] = o;
    return l > s || f > c || _ > u ? 0 : this.getVoxel(n, l, f, _);
  }
  calBitForIndex(n, o) {
    return (n >> (7 - o)) & 1;
  }
  getVoxel(n, o, s, c) {
    const { cellSize_X: u, cellSize_Y: l, calBitForIndex: f } = this,
      _ = u * l * c + u * s + o,
      g = Math.floor(_ / 8),
      v = _ % 8;
    return f.call(this, n[g], v);
  }
  generateGeometryData(n, o, s, c) {
    const {
        adjacent: u,
        cellSize_X: l,
        cellSize_Y: f,
        tileSize: _,
        tileTextureWidth: g,
        tileTextureHeight: v,
      } = this,
      T = [],
      E = [],
      y = [];
    (this.cellSize_X = o[0]),
      (this.cellSize_Y = o[1]),
      (this.cellSize_Z = o[2]);
    let S = 0;
    for (let C = 0; C < n.byteLength; C++)
      if (n[C] > 0) {
        const R = n[C];
        for (let A = 0; A < 8; A++)
          if (this.calBitForIndex(R, A)) {
            const O = C * 8 + A;
            S++;
            const L = Math.floor(O / (l * f)),
              P = O % (l * f),
              $ = Math.floor(P / l),
              B = P % l,
              F = (L * s + c) * Math.round(1 / s),
              J = Math.floor((F < -10 ? -10 : F > 20 ? 20 : F) + 10);
            for (const { dir: H, corners: j } of this.faces)
              if (!u.call(this, n, [B + H[0], $ + H[1], L + H[2]])) {
                const he = T.length / 3;
                for (const { pos: Te, uv: re } of j)
                  T.push(Te[0] + B, Te[1] + $, Te[2] + L),
                    E.push(((J + re[0]) * _) / g, 1 - ((1 - re[1]) * _) / v);
                y.push(he, he + 1, he + 2, he + 2, he + 1, he + 3);
              }
          }
      }
    return {
      positionsFloat32Array: new Float32Array(T),
      uvsFloat32Array: new Float32Array(E),
      indices: y,
      pointCount: S,
    };
  }
  updateMeshesForData2() {
    const { currCellDataInfo, material, scene } = this;
    if (!currCellDataInfo || !scene) return;
    const { geometryData, resolution: resolution, origin } = currCellDataInfo;

    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    scene.remove(this.mesh);

    const positions = convert(geometryData.positions);
    const uvs = convert(geometryData.uvs);
    const indices = convert32(geometryData.indices);
    // debugger
    const buffGeometry = new THREE.BufferGeometry();
    buffGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions || [], 3)
    );
    buffGeometry.setAttribute(
      "uv",
      new THREE.BufferAttribute(uvs || [], 2, !0)
    );
    buffGeometry.setIndex(new THREE.BufferAttribute(indices || [], 1));
    this.mesh = new THREE.Mesh(buffGeometry, material);
    const res = resolution || 0.1;
    this.mesh.scale.set(res, res, res);
    this.mesh.position.set(origin[0] || 0, origin[1] || 0, origin[2] || 0);
    scene.add(this.mesh);
  }
}
