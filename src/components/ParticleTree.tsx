"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const vert = /* glsl */ `
uniform float uTime; uniform float uPixelRatio;
attribute float aSize; attribute float aPhase; attribute vec3 aColor;
varying vec3 vColor; varying float vAlpha;
void main() {
  vec3 p = position;
  float canopy = smoothstep(1.2, 2.2, p.y);
  p.x += sin(uTime * 0.6 + aPhase) * 0.16 * canopy;
  p.z += cos(uTime * 0.5 + aPhase * 1.3) * 0.16 * canopy;
  p.y += sin(uTime * 0.8 + aPhase * 2.0) * 0.06;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uPixelRatio * (12.0 / -mv.z);
  vColor = aColor;
  vAlpha = 0.5 + 0.5 * sin(uTime * 1.5 + aPhase * 4.0);
}`;
const frag = /* glsl */ `
varying vec3 vColor; varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.02, d) * (0.45 + 0.65 * vAlpha);
  gl_FragColor = vec4(vColor, a);
}`;

/** Glowing particles rise from the anchor element (the brand symbol) and spread into a breathing canopy above it. */
function Tree({ targetRef }: { targetRef?: React.RefObject<HTMLElement | null> }) {
  const group = useRef<THREE.Group>(null);
  const { size, camera, gl } = useThree();

  const geo = useMemo(() => {
    const count = window.innerWidth < 768 ? 7000 : 20000;
    const pos = new Float32Array(count * 3), col = new Float32Array(count * 3), sz = new Float32Array(count), ph = new Float32Array(count);
    const c1 = new THREE.Color("#2e94d2"), c2 = new THREE.Color("#63b6ea"), c3 = new THREE.Color("#ffffff");
    const g = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
    for (let i = 0; i < count; i++) {
      let x: number, y: number, z: number;
      if (Math.random() < 0.28) {
        y = Math.random() * 1.8; // trunk: base at y=0
        const r = 0.03 + Math.pow(Math.random(), 2) * (0.08 + y * 0.12);
        const a = Math.random() * Math.PI * 2;
        x = Math.cos(a) * r; z = Math.sin(a) * r;
      } else {
        x = g() * 2.4; z = g() * 1.9; y = 2.35 + g() * 1.0 - Math.abs(x) * 0.12;
      }
      pos.set([x, y, z], i * 3);
      const c = Math.random() < 0.12 ? c3 : Math.random() < 0.5 ? c1 : c2;
      col.set([c.r, c.g, c.b], i * 3);
      sz[i] = 1.2 + Math.random() * 2.2;
      ph[i] = Math.random() * Math.PI * 2;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(ph, 1));
    return geometry;
  }, []);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 1.5) } }), []);

  // Put the trunk base exactly on the anchor element (screen -> world at z=0).
  useEffect(() => {
    const t = targetRef?.current, cv = gl.domElement, grp = group.current;
    if (!t || !grp) return;
    const place = () => {
      const tr = t.getBoundingClientRect(), cr = cv.getBoundingClientRect();
      if (!cr.width || !cr.height) return;
      const tx = (tr.left + tr.width / 2 - cr.left) / cr.width, ty = (tr.top + tr.height / 2 - cr.top) / cr.height;
      const cam = camera as THREE.PerspectiveCamera;
      const vh = 2 * cam.position.z * Math.tan((cam.fov * Math.PI) / 360), vw = vh * (cr.width / cr.height);
      grp.position.set((tx - 0.5) * vw, (0.5 - ty) * vh, 0);
    };
    place();
    const id = setTimeout(place, 600);
    return () => clearTimeout(id);
  }, [size, targetRef, camera, gl]);

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    if (group.current) group.current.rotation.y = state.clock.elapsedTime * 0.08;
  });

  return (
    <group ref={group}>
      <points geometry={geo}>
        <shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

export default function ParticleTree({ targetRef }: { targetRef?: React.RefObject<HTMLElement | null> }) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 8], fov: 50 }} gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}>
      <Tree targetRef={targetRef} />
    </Canvas>
  );
}
