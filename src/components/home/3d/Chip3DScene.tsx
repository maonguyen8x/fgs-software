"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import gsap from "gsap";

// Configuration object for easy tweaking
const CONFIG = {
  // Animation timings (in seconds)
  scene1Duration: 13,
  scene2Duration: 8,
  scene3Duration: 8,
  
  // Colors
  primaryColor: { r: 0.42, g: 0.38, b: 0.95 }, // #6b61ff (electric violet)
  accentColor: { r: 0.95, g: 0.64, b: 0.2 }, // #f3a314 (warm orange-gold)
  chipColor: "#0a0a0a",
  
  // Post-processing
  bloomIntensity: 1.8,
  bloomThreshold: 0.1,
  depthOfFieldFocusDistance: 3,
  depthOfFieldFocusRange: 3,
  vignetteIntensity: 0.35,
  chromaticAberrationOffset: 0.001,
  
  // Performance
  maxDPR: 1.75,
  particleCount: 150,
  particleCountLowEnd: 40,
  
  // Camera
  cameraDistance: 4,
  cameraMousSensitivity: 0.002,
};

// Chip component with all geometry
function ChipGeometry() {
  const meshRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!meshRef.current) return;

    // Main chip body (cube with beveled edges)
    const chipGeometry = new THREE.BoxGeometry(2, 2, 0.4);
    const chipMaterial = new THREE.MeshStandardMaterial({
      color: CONFIG.chipColor,
      metalness: 0.3,
      roughness: 0.2,
      emissive: "#1a1a2e",
      emissiveIntensity: 0.2,
    });
    const chipMesh = new THREE.Mesh(chipGeometry, chipMaterial);
    chipMesh.castShadow = true;
    chipMesh.receiveShadow = true;
    meshRef.current.add(chipMesh);

    // Chip edge glow (ring)
    const edgeGeometry = new THREE.TorusGeometry(1.2, 0.08, 8, 32);
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: "#d4a574",
      metalness: 0.8,
      roughness: 0.1,
      emissive: "#d4a574",
      emissiveIntensity: 0.6,
    });
    const edgeMesh = new THREE.Mesh(edgeGeometry, edgeMaterial);
    edgeMesh.rotation.x = Math.PI / 2;
    edgeMesh.position.z = 0.25;
    meshRef.current.add(edgeMesh);

    // Grid of dots on chip surface
    const dotGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const dotMaterial = new THREE.MeshStandardMaterial({
      color: "#6b61ff",
      metalness: 0.4,
      roughness: 0.3,
      emissive: "#6b61ff",
      emissiveIntensity: 0.8,
    });

    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        const dot = new THREE.Mesh(dotGeometry, dotMaterial.clone());
        dot.position.set(i * 0.5, j * 0.5, 0.25);
        dot.castShadow = true;
        meshRef.current.add(dot);
      }
    }

    // Create circuit lines radiating outward
    const lineCount = 12;
    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2;
      const x = Math.cos(angle);
      const y = Math.sin(angle);

      const lineGeometry = new THREE.BufferGeometry();
      const linePositions = new Float32Array([
        x * 1, y * 1, 0.3,
        x * 3, y * 3, 0.3,
      ]);
      lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));

      const lineMaterial = new THREE.LineBasicMaterial({
        color: "#d4a574",
        linewidth: 2,
        transparent: true,
        opacity: 0.6,
      });

      const line = new THREE.Line(lineGeometry, lineMaterial);
      meshRef.current.add(line);
    }

    return () => {
      chipGeometry.dispose();
      chipMaterial.dispose();
      edgeGeometry.dispose();
      edgeMaterial.dispose();
      dotGeometry.dispose();
      dotMaterial.dispose();
    };
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;
    // Light rotation for visual interest
    meshRef.current.rotation.z += 0.0003;
  });

  return <group ref={meshRef} />;
}

// Floating particles
function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  useEffect(() => {
    if (!pointsRef.current) return;

    const particleCount = CONFIG.particleCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;

      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = Math.random() * 0.04;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pointsRef.current.geometry = geometry;
    pointsRef.current.userData.velocities = velocities;
    geometryRef.current = geometry;

    return () => {
      geometry.dispose();
    };
  }, []);

  useEffect(() => {
    if (!pointsRef.current) return;

    const material = new THREE.PointsMaterial({
      color: "#6b61ff",
      size: 0.08,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
    });

    pointsRef.current.material = material;
    materialRef.current = material;

    return () => {
      material.dispose();
    };
  }, []);

  useFrame(() => {
    if (!pointsRef.current?.geometry) return;

    const positions = pointsRef.current.geometry.attributes.position?.array as Float32Array | undefined;
    const velocities = pointsRef.current.userData.velocities as Float32Array | undefined;

    if (!positions || !velocities) return;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2];

      // Wrap around boundaries
      if (Math.abs(positions[i]) > 4) velocities[i] *= -1;
      if (Math.abs(positions[i + 1]) > 4) velocities[i + 1] *= -1;
      if (Math.abs(positions[i + 2]) > 3) velocities[i + 2] *= -1;
    }

    if (pointsRef.current.geometry.attributes.position) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return <points ref={pointsRef} />;
}

// Main scene with animation timeline
function SceneContent() {
  const groupRef = useRef<THREE.Group>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current || !groupRef.current) return;
    startedRef.current = true;

    const group = groupRef.current;
    const totalDuration = CONFIG.scene1Duration + CONFIG.scene2Duration + CONFIG.scene3Duration;

    const tl = gsap.timeline({ repeat: -1 });

    // Scene 1: AI Chip Awakening (13 seconds)
    tl.to(
      group.rotation,
      {
        y: Math.PI * 0.5,
        x: 0.2,
        duration: CONFIG.scene1Duration,
        ease: "power1.inOut",
      },
      0
    );

    tl.to(
      group.position,
      {
        y: 0.3,
        duration: CONFIG.scene1Duration,
        ease: "sine.inOut",
      },
      0
    );

    // Scene 2: X-Ray / Light Through the Chip (8 seconds)
    tl.to(
      group.rotation,
      {
        x: -Math.PI * 0.3,
        z: Math.PI * 0.2,
        duration: CONFIG.scene2Duration,
        ease: "power1.inOut",
      },
      CONFIG.scene1Duration
    );

    // Scene 3: Top-Down Reveal (8 seconds)
    tl.to(
      group.rotation,
      {
        x: 0,
        y: Math.PI * 2,
        z: 0,
        duration: CONFIG.scene3Duration,
        ease: "power1.inOut",
      },
      CONFIG.scene1Duration + CONFIG.scene2Duration
    );

    tl.to(
      group.scale,
      {
        x: 0.8,
        y: 0.8,
        z: 0.8,
        duration: 1,
        ease: "power2.in",
      },
      CONFIG.scene1Duration + CONFIG.scene2Duration + CONFIG.scene3Duration - 1
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <group ref={groupRef}>
      <ChipGeometry />
      <Particles />
    </group>
  );
}

// Camera with subtle mouse parallax
function CameraController() {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame(() => {
    const targetX = mouseRef.current.x * CONFIG.cameraMousSensitivity * 100;
    const targetY = mouseRef.current.y * CONFIG.cameraMousSensitivity * 100;

    camera.position.x += (targetX - camera.position.x) * 0.1;
    camera.position.y += (targetY - camera.position.y) * 0.1;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export function Chip3DScene() {
  const [dpr, setDpr] = useState(1);

  useEffect(() => {
    const dpr = Math.min(window.devicePixelRatio, CONFIG.maxDPR);
    setDpr(dpr);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, CONFIG.cameraDistance], fov: 60 }}
      dpr={dpr}
      performance={{ min: 0.5, max: 1, debounce: 200 }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#05060f"]} />
      <fog attach="fog" args={["#05060f", 5, 20]} />

      <ambientLight intensity={0.3} color="#6b61ff" />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 0, 5]} intensity={2} color="#6b61ff" />
      <pointLight position={[-5, -5, 3]} intensity={0.8} color="#d4a574" />

      <Environment preset="night" />

      <SceneContent />
      <CameraController />

      <EffectComposer>
        <Bloom
          intensity={CONFIG.bloomIntensity}
          luminanceThreshold={CONFIG.bloomThreshold}
          luminanceSmoothing={0.9}
        />
        <DepthOfField
          focusDistance={CONFIG.depthOfFieldFocusDistance}
          focusRange={CONFIG.depthOfFieldFocusRange}
          bokehScale={6}
        />
        <Vignette offset={0.3} darkness={CONFIG.vignetteIntensity} />
        <ChromaticAberration offset={[CONFIG.chromaticAberrationOffset, CONFIG.chromaticAberrationOffset]} />
      </EffectComposer>

      <PerformanceMonitor onDecline={() => {}} />
    </Canvas>
  );
}
