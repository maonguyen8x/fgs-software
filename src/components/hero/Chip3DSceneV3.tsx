"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Sparkles, RoundedBox } from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField, Vignette } from "@react-three/postprocessing";
import gsap from "gsap";

// ============================================================================
// CONFIGURATION - All customizable parameters
// ============================================================================
const CONFIG = {
  // Animation Scene Durations (seconds)
  scene1Duration: 13,
  scene2Duration: 8,
  scene3Duration: 10,

  // Colors - Reference image inspired: golden/orange glow
  chipBaseColor: "#0a0a0f",
  chipEdgeColor: "#d4a574", // Golden/copper
  chipGlowColor: "#ff8c00", // Orange-gold
  textColor: "#ffd700",     // Golden text
  accentColor: "#ff7a1a",

  // Material Properties
  chipMetalness: 0.95,
  chipRoughness: 0.15,
  edgeEmissiveIntensity: 4,
  circuitEmissiveIntensity: 3,
  textEmissiveIntensity: 3,

  // Geometry
  chipSize: 3,
  chipDepth: 0.35,
  aiTextSize: 1,
  aiTextDepth: 0.25,

  // Effects & Performance
  particleCount: 150,
  bloomIntensity: 1.5,
  bloomThreshold: 0.3,
  vignetteIntensity: 0.3,

  // Camera
  cameraPositionZ: 8,
};

// ============================================================================
// SCENE CONTENT - All 3D objects and animations
// ============================================================================
function SceneContent() {
  const chipGroupRef = useRef<THREE.Group>(null);
  const aiTextRef = useRef<THREE.Group>(null);
  const lightBeamRef = useRef<THREE.Mesh>(null);
  const wordsGroupRef = useRef<THREE.Group>(null);
  const sceneControllerRef = useRef<{ currentScene: number }>({ currentScene: 0 });

  const { camera } = useThree();

  // Initialize scene
  useEffect(() => {
    if (!chipGroupRef.current || !aiTextRef.current) return;

    // ========================================================================
    // BUILD THE CHIP
    // ========================================================================
    const chipGroup = chipGroupRef.current;

    // Main chip body - rounded rectangle using standard geometry
    // Use LatheGeometry or IcosahedronGeometry as base, then scale
    const chipGeometry = new THREE.IcosahedronGeometry(2, 5);
    
    // Scale it to chip proportions
    chipGeometry.scale(CONFIG.chipSize / 2, CONFIG.chipDepth / 2, CONFIG.chipSize / 2);
    
    // Bevel edges slightly
    chipGeometry.computeVertexNormals();

    const chipMaterial = new THREE.MeshPhysicalMaterial({
      color: CONFIG.chipBaseColor,
      metalness: CONFIG.chipMetalness,
      roughness: CONFIG.chipRoughness,
      clearcoat: 1,
      emissive: "#000000",
    });

    const chipMesh = new THREE.Mesh(chipGeometry, chipMaterial);
    chipMesh.castShadow = true;
    chipMesh.receiveShadow = true;
    chipGroup.add(chipMesh);

    // Glowing edge border
    const edgeGeometry = new THREE.TorusGeometry(
      CONFIG.chipSize * 0.7,
      CONFIG.chipSize * 0.1,
      16,
      100
    );
    edgeGeometry.rotateX(Math.PI / 2);

    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: CONFIG.chipEdgeColor,
      emissive: CONFIG.chipGlowColor,
      emissiveIntensity: CONFIG.edgeEmissiveIntensity,
      metalness: 0.8,
      roughness: 0.1,
    });

    const edgeMesh = new THREE.Mesh(edgeGeometry, edgeMaterial);
    edgeMesh.position.z = 0;
    edgeMesh.position.y = 0;
    chipGroup.add(edgeMesh);

    // Circuit dots pattern on surface
    const dotGeometry = new THREE.IcosahedronGeometry(0.04, 2);
    const dotMaterial = new THREE.MeshStandardMaterial({
      color: CONFIG.chipGlowColor,
      emissive: CONFIG.chipGlowColor,
      emissiveIntensity: CONFIG.edgeEmissiveIntensity,
    });

    // Create dots in a pattern
    const dotsCount = 800;
    for (let i = 0; i < dotsCount; i++) {
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);

      // Circular pattern around chip
      const angle = (i / dotsCount) * Math.PI * 2;
      const radius = 0.8 + Math.random() * 0.6;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 0.2;

      dot.position.set(x, y, z);
      dot.scale.set(0.8, 0.8, 0.8);
      chipGroup.add(dot);
    }

    // Also add grid of dots on surface
    const gridSize = 8;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const dot = new THREE.Mesh(dotGeometry, dotMaterial.clone());
        const x = (i / gridSize - 0.5) * (CONFIG.chipSize - 0.4);
        const z = (j / gridSize - 0.5) * (CONFIG.chipSize - 0.4);
        const y = CONFIG.chipDepth / 2 + 0.05;

        if (Math.abs(x) < 0.3 && Math.abs(z) < 0.3) continue; // Skip center
        dot.position.set(x, y, z);
        dot.scale.set(0.6, 0.6, 0.6);
        chipGroup.add(dot);
      }
    }

    // ========================================================================
    // BUILD THE AI TEXT
    // ========================================================================
    const aiTextGroup = aiTextRef.current;
    createAIText(aiTextGroup);

    // ========================================================================
    // BUILD CIRCUIT TRACES
    // ========================================================================
    const traceMaterial = new THREE.LineBasicMaterial({
      color: CONFIG.chipGlowColor,
      linewidth: 2,
      fog: false,
    });

    for (let i = 0; i < 12; i++) {
      const points = [];
      const angle = (i / 12) * Math.PI * 2;
      const startRadius = 1.2;
      const endRadius = 2.5;

      points.push(new THREE.Vector3(Math.cos(angle) * startRadius, 0, Math.sin(angle) * startRadius));
      points.push(new THREE.Vector3(Math.cos(angle) * endRadius, 0, Math.sin(angle) * endRadius));

      const traceGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const trace = new THREE.Line(traceGeometry, traceMaterial);
      chipGroup.add(trace);
    }

    // ========================================================================
    // BUILD LIGHT BEAM (volumetric)
    // ========================================================================
    if (lightBeamRef.current) {
      const beamGeometry = new THREE.ConeGeometry(1.5, 3, 32);
      const beamMaterial = new THREE.MeshBasicMaterial({
        color: CONFIG.chipGlowColor,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      });
      const beam = new THREE.Mesh(beamGeometry, beamMaterial);
      beam.position.y = -1.5;
      beam.position.z = 0;
      lightBeamRef.current.add(beam);
    }

    // ========================================================================
    // START ANIMATION TIMELINE
    // ========================================================================
    startAnimationTimeline();
  }, []);

  // ========================================================================
  // ANIMATION TIMELINE
  // ========================================================================
  function startAnimationTimeline() {
    const tl = gsap.timeline({ repeat: -1 });

    // SCENE 1: AI Rises (13 seconds)
    // Chip fade in
    tl.fromTo(
      chipGroupRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: "power2.out" },
      0
    );

    // AI text rises and rotates
    if (aiTextRef.current) {
      tl.fromTo(
        aiTextRef.current,
        { y: -0.5, opacity: 0, rotationZ: 0 },
        { y: 2.5, opacity: 1, rotationZ: Math.PI * 2, duration: 8, ease: "power2.inOut" },
        0.5
      );

      // AI descends and locks
      tl.to(
        aiTextRef.current,
        { y: 0, duration: 3, ease: "power2.inOut" },
        9
      );
    }

    // Light beam animation
    if (lightBeamRef.current) {
      tl.fromTo(
        lightBeamRef.current,
        { opacity: 0, scaleY: 0 },
        { opacity: 1, scaleY: 1, duration: 3, ease: "back.out" },
        2
      );

      tl.to(lightBeamRef.current, { opacity: 0, duration: 2 }, 11);
    }

    // SCENE 2: Light Through Chip (8 seconds)
    const scene2Start = CONFIG.scene1Duration;
    // Make chip semi-transparent
    tl.to(
      chipGroupRef.current?.children[0],
      { opacity: 0.4, duration: 1 },
      scene2Start
    );

    // Camera orbit (handled in useFrame)
    tl.to(sceneControllerRef.current, { currentScene: 1, duration: 0.1 }, scene2Start);

    // Reset chip opacity
    tl.to(
      chipGroupRef.current?.children[0],
      { opacity: 1, duration: 1 },
      scene2Start + CONFIG.scene2Duration - 1
    );

    // SCENE 3: Words Reveal (10 seconds)
    const scene3Start = scene2Start + CONFIG.scene2Duration;
    tl.to(sceneControllerRef.current, { currentScene: 2, duration: 0.1 }, scene3Start);

    // Fade out chip
    tl.to(chipGroupRef.current, { opacity: 0, duration: 2 }, scene3Start);

    // Show words
    if (wordsGroupRef.current) {
      tl.to(wordsGroupRef.current, { opacity: 1, duration: 1 }, scene3Start + 1);
      tl.to(wordsGroupRef.current, { opacity: 0, duration: 2 }, scene3Start + CONFIG.scene3Duration - 2);
    }

    // Fade chip back in for loop
    tl.to(chipGroupRef.current, { opacity: 1, duration: 0.5 }, scene3Start + CONFIG.scene3Duration - 0.5);
  }

  // ========================================================================
  // CONTINUOUS ANIMATION FRAME
  // ========================================================================
  useFrame(() => {
    if (chipGroupRef.current) {
      chipGroupRef.current.rotation.y += 0.0005;
    }

    const scene = sceneControllerRef.current?.currentScene || 0;
    if (scene === 1 && chipGroupRef.current) {
      // Camera orbits during scene 2
      const time = Date.now() * 0.0001;
      camera.position.x = Math.sin(time) * 3;
      camera.position.z = Math.cos(time) * 8 + 4;
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} color="#ffffff" />
      <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow color="#ffffff" />
      <pointLight position={[3, 3, 3]} intensity={2} color={CONFIG.chipGlowColor} />
      <pointLight position={[-3, -2, 3]} intensity={1.5} color="#4a3f7f" />

      {/* Environment */}
      <Environment preset="night" />

      {/* 3D Objects */}
      <group ref={chipGroupRef} position={[0, 0, 0]} />
      <group ref={aiTextRef} position={[0, 0, 0]} />
      <group ref={lightBeamRef} position={[0, 0, 0]} />
      <group ref={wordsGroupRef} position={[0, 1.5, 0]} opacity={0}>
        <WordsDisplay />
      </group>

      {/* Effects */}
      <Sparkles count={60} scale={3} size={3} speed={0.4} opacity={0.6} />

      <EffectComposer>
        <Bloom
          luminanceThreshold={CONFIG.bloomThreshold}
          luminanceSmoothing={0.9}
          intensity={CONFIG.bloomIntensity}
        />
        <DepthOfField focusDistance={5} focalLength={0.02} bokehScale={8} />
        <Vignette darkness={CONFIG.vignetteIntensity} />
      </EffectComposer>
    </>
  );
}

// ========================================================================
// CREATE AI TEXT GEOMETRY
// ========================================================================
function createAIText(group: THREE.Group) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = CONFIG.textColor;
  ctx.font = "bold 160px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("AI", 256, 128);

  // Add glow effect
  ctx.strokeStyle = CONFIG.chipGlowColor;
  ctx.lineWidth = 3;
  ctx.strokeText("AI", 256, 128);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    emissive: CONFIG.textColor,
    emissiveIntensity: CONFIG.textEmissiveIntensity,
    metalness: 0.7,
    roughness: 0.2,
  });

  const geometry = new THREE.PlaneGeometry(3, 1.5);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = 0.2;
  group.add(mesh);
}

// ========================================================================
// WORDS DISPLAY COMPONENT
// ========================================================================
function WordsDisplay() {
  const words = ["Blockchain", "Big Data", "IoT"];

  return (
    <>
      {words.map((word, index) => (
        <WordMesh key={word} text={word} index={index} />
      ))}

      {/* Radial light rays */}
      {[...Array(24)].map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        return (
          <line key={`ray-${i}`} position={[0, 0, 0]}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, 0, 0, Math.cos(angle) * 4, 0, Math.sin(angle) * 4])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color={CONFIG.chipGlowColor} linewidth={1} />
          </line>
        );
      })}
    </>
  );
}

// ========================================================================
// INDIVIDUAL WORD MESH
// ========================================================================
function WordMesh({ text, index }: { text: string; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!meshRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = CONFIG.textColor;
    ctx.font = "bold 140px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 512, 128);

    const texture = new THREE.CanvasTexture(canvas);
    meshRef.current.material = new THREE.MeshStandardMaterial({
      map: texture,
      emissive: CONFIG.textColor,
      emissiveIntensity: CONFIG.textEmissiveIntensity,
      metalness: 0.6,
      roughness: 0.3,
    });
  }, [text]);

  const startDelay = index * 2.5;
  const xPos = (index - 1) * 3.5;

  return (
    <mesh
      ref={meshRef}
      position={[xPos, 0.5 + index * 0.5, 0]}
      scale={[1.2, 1.2, 1]}
    >
      <planeGeometry args={[4.5, 1.2]} />
      <meshStandardMaterial color={CONFIG.textColor} />
    </mesh>
  );
}

// ========================================================================
// EXPORT - Main 3D Canvas Component
// ========================================================================
export function Chip3DSceneV3() {
  return (
    <Canvas
      style={{ width: "100%", height: "100%" }}
      camera={{
        position: [0, 2, CONFIG.cameraPositionZ],
        fov: 45,
        near: 0.1,
        far: 1000,
      }}
      gl={{
        antialias: true,
        alpha: true,
        pixelRatio: Math.min(window.devicePixelRatio, 1.5),
      }}
      dpr={[1, 1.5]}
    >
      <SceneContent />
    </Canvas>
  );
}
