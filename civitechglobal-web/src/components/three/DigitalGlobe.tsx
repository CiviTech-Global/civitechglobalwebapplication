import { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Fibonacci-sphere distribution for even point spread */
function fibonacciSphere(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // -1..1
    const r = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;

    positions[i * 3] = Math.cos(theta) * r * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * r * radius;
  }
  return positions;
}

/** Detect WebGL availability */
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// City cluster data – small extruded rectangles on the sphere surface
// ---------------------------------------------------------------------------

interface CityCluster {
  lat: number;
  lon: number;
  buildings: { dx: number; dz: number; h: number; w: number }[];
}

const CITY_CLUSTERS: CityCluster[] = [
  // Roughly: New York, London, Dubai, Tokyo, Sydney, Sao Paulo, Mumbai
  { lat: 40.7, lon: -74.0, buildings: [
    { dx: 0, dz: 0, h: 0.08, w: 0.012 },
    { dx: 0.02, dz: 0.01, h: 0.06, w: 0.01 },
    { dx: -0.015, dz: 0.015, h: 0.07, w: 0.008 },
    { dx: 0.01, dz: -0.01, h: 0.05, w: 0.01 },
  ]},
  { lat: 51.5, lon: -0.12, buildings: [
    { dx: 0, dz: 0, h: 0.06, w: 0.01 },
    { dx: 0.015, dz: 0.01, h: 0.05, w: 0.009 },
    { dx: -0.01, dz: -0.01, h: 0.045, w: 0.008 },
  ]},
  { lat: 25.2, lon: 55.3, buildings: [
    { dx: 0, dz: 0, h: 0.09, w: 0.008 },
    { dx: 0.012, dz: 0.008, h: 0.06, w: 0.01 },
    { dx: -0.01, dz: 0.012, h: 0.055, w: 0.007 },
  ]},
  { lat: 35.7, lon: 139.7, buildings: [
    { dx: 0, dz: 0, h: 0.07, w: 0.01 },
    { dx: 0.018, dz: 0.005, h: 0.055, w: 0.009 },
    { dx: -0.012, dz: 0.01, h: 0.065, w: 0.008 },
    { dx: 0.005, dz: -0.015, h: 0.04, w: 0.01 },
  ]},
  { lat: -33.9, lon: 151.2, buildings: [
    { dx: 0, dz: 0, h: 0.05, w: 0.009 },
    { dx: 0.01, dz: 0.01, h: 0.04, w: 0.008 },
  ]},
  { lat: -23.5, lon: -46.6, buildings: [
    { dx: 0, dz: 0, h: 0.06, w: 0.01 },
    { dx: 0.015, dz: -0.005, h: 0.05, w: 0.008 },
    { dx: -0.008, dz: 0.012, h: 0.045, w: 0.009 },
  ]},
  { lat: 19.1, lon: 72.9, buildings: [
    { dx: 0, dz: 0, h: 0.055, w: 0.009 },
    { dx: 0.012, dz: 0.008, h: 0.045, w: 0.008 },
    { dx: -0.01, dz: -0.006, h: 0.05, w: 0.007 },
  ]},
];

function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

// ---------------------------------------------------------------------------
// CityBuildings – extruded rectangles placed on sphere surface
// ---------------------------------------------------------------------------

const BUILDING_COLOR = new THREE.Color('#00b8ff');

function CityBuildings({ radius }: { radius: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { matrices, count } = useMemo(() => {
    const mats: THREE.Matrix4[] = [];

    for (const cluster of CITY_CLUSTERS) {
      const center = latLonToVec3(cluster.lat, cluster.lon, radius);
      const normal = center.clone().normalize();

      // Build a basis on the sphere surface
      const up = new THREE.Vector3(0, 1, 0);
      const tangent = new THREE.Vector3().crossVectors(up, normal).normalize();
      if (tangent.length() < 0.01) tangent.set(1, 0, 0);
      const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();

      for (const b of cluster.buildings) {
        const offset = tangent.clone().multiplyScalar(b.dx).add(bitangent.clone().multiplyScalar(b.dz));
        const pos = center.clone().add(offset);
        const top = pos.clone().add(normal.clone().multiplyScalar(b.h));
        const mid = pos.clone().add(normal.clone().multiplyScalar(b.h / 2));

        const mat = new THREE.Matrix4();
        const quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        mat.compose(mid, quat, new THREE.Vector3(b.w, b.h, b.w));

        // Suppress unused-variable: keep top reference alive for potential future use
        void top;

        mats.push(mat);
      }
    }

    return { matrices: mats, count: mats.length };
  }, [radius]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < count; i++) {
      mesh.setMatrixAt(i, matrices[i]);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [matrices, count]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.5 + Math.sin(clock.getElapsedTime() * 1.5) * 0.2;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={BUILDING_COLOR} transparent opacity={0.6} />
    </instancedMesh>
  );
}

// ---------------------------------------------------------------------------
// GlobePoints – point cloud with mouse proximity glow
// ---------------------------------------------------------------------------

const BASE_COLOR = new THREE.Color('#0080e6');
const GLOW_COLOR = new THREE.Color('#00d4ff');
const TEMP_COLOR = new THREE.Color();
const TEMP_VEC = new THREE.Vector3();

function GlobePoints({ radius, pointCount }: { radius: number; pointCount: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const pointerWorld = useRef(new THREE.Vector3(0, 0, 100));
  const { camera, raycaster, pointer } = useThree();

  // Invisible sphere for raycasting
  const raySphere = useMemo(() => {
    const geo = new THREE.SphereGeometry(radius, 32, 32);
    const mat = new THREE.MeshBasicMaterial({ visible: false });
    return new THREE.Mesh(geo, mat);
  }, [radius]);

  const { positions, baseColors } = useMemo(() => {
    const pos = fibonacciSphere(pointCount, radius);
    const cols = new Float32Array(pointCount * 3);
    for (let i = 0; i < pointCount; i++) {
      cols[i * 3] = BASE_COLOR.r;
      cols[i * 3 + 1] = BASE_COLOR.g;
      cols[i * 3 + 2] = BASE_COLOR.b;
    }
    return { positions: pos, baseColors: cols };
  }, [pointCount, radius]);

  const sizes = useMemo(() => {
    const s = new Float32Array(pointCount);
    for (let i = 0; i < pointCount; i++) {
      s[i] = 0.012 + Math.random() * 0.008;
    }
    return s;
  }, [pointCount]);

  useFrame(() => {
    const pts = pointsRef.current;
    if (!pts) return;

    // Update raycaster
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(raySphere);
    if (intersects.length > 0) {
      pointerWorld.current.copy(intersects[0].point);
    }

    const colorAttr = pts.geometry.getAttribute('color') as THREE.BufferAttribute;
    const sizeAttr = pts.geometry.getAttribute('size') as THREE.BufferAttribute;
    const posAttr = pts.geometry.getAttribute('position') as THREE.BufferAttribute;
    const pw = pointerWorld.current;

    for (let i = 0; i < pointCount; i++) {
      TEMP_VEC.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
      // Transform to world space (account for group rotation)
      pts.localToWorld(TEMP_VEC);

      const dist = TEMP_VEC.distanceTo(pw);
      const influence = Math.max(0, 1 - dist / 0.6);
      const glow = influence * influence; // quadratic falloff

      TEMP_COLOR.copy(BASE_COLOR).lerp(GLOW_COLOR, glow);
      colorAttr.setXYZ(i, TEMP_COLOR.r, TEMP_COLOR.g, TEMP_COLOR.b);
      sizeAttr.setX(i, sizes[i] * (1 + glow * 2.5));
    }

    colorAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[baseColors.slice(), 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes.slice(), 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        sizeAttenuation
        size={0.015}
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// WireframeGrid – subtle latitude / longitude lines
// ---------------------------------------------------------------------------

function WireframeGrid({ radius }: { radius: number }) {
  return (
    <mesh>
      <sphereGeometry args={[radius * 0.998, 36, 18]} />
      <meshBasicMaterial
        color="#0060aa"
        wireframe
        transparent
        opacity={0.08}
        depthWrite={false}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// GlobeScene – combines all 3D elements with auto-rotation
// ---------------------------------------------------------------------------

function GlobeScene({ pointCount }: { pointCount: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  const radius = 1.2;

  return (
    <>
      <ambientLight intensity={0.3} />

      <group ref={groupRef}>
        <WireframeGrid radius={radius} />
        <GlobePoints radius={radius} pointCount={pointCount} />
        <CityBuildings radius={radius} />
      </group>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        dampingFactor={0.08}
        enableDamping
        rotateSpeed={0.4}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.8}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Fallback – static gradient circle when WebGL is unavailable
// ---------------------------------------------------------------------------

function GlobeFallback() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '60%',
          maxWidth: 400,
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 35% 35%, #00d4ff 0%, #0080e6 40%, #003366 75%, #060911 100%)',
          boxShadow: '0 0 60px 10px rgba(0, 128, 230, 0.25)',
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// DigitalGlobe – main exported component
// ---------------------------------------------------------------------------

export function DigitalGlobe() {
  const [webgl] = useState(() => isWebGLAvailable());
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const pointCount = isMobile ? 1200 : 2500;

  if (!webgl) {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <GlobeFallback />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 45 }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <GlobeScene pointCount={pointCount} />
      </Canvas>
    </div>
  );
}
