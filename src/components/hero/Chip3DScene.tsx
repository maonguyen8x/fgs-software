"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, PerformanceMonitor, Sparkles, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField, Vignette } from "@react-three/postprocessing";
import gsap from "gsap";

// ============================================================================
// CONFIGURATION - All tweakable parameters in one place
// ============================================================================
const CONFIG = {
  // Animation Scene Durations (seconds)
  scene1Duration: 13,
  scene2Duration: 8,
  scene3Duration: 10,

  // Colors
  chipBaseColor: "#0b0b10",
  edgeGlowColor: "#ffb347",
  accentColor: "#ff7a18",
  lightColor: "#ffa500",
  violetFill: "#4a3f7f",

  // Material Properties
  chipMetalness: 0.9,
  chipRoughness: 0.25,
  chipClearcoat: 1,
  edgeEmissiveIntensity: 3,
  dotEmissiveIntensity: 1.5,
  textEmissiveIntensity: 2,

  // Geometry
  chipWidth: 2.6,
  chipDepth: 0.28,
  chipHeight: 2.6,
  aiTextSize: 0.7,
  aiTextHeight: 0.18,

  // Particles & Effects
  particleCount: 200,
  sparkleCount: 100,
  dustParticles: 80,

  // Camera
  cameraPositionX: 0,
  cameraPositionY: 3.2,
  cameraPositionZ: 6.5,
  cameraFOV: 40,

  // Post-processing
  bloomThreshold: 0.2,
  bloomIntensity: 1.2,
  vignetteIntensity: 0.25,
  dofFocusDistance: 8,
  dofFocusRange: 5,

  // Performance
  maxDPR: 1.75,
};

// ============================================================================
// HELPER: Create extruded text geometry
// ============================================================================
function createTextGeometry(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 120px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 128);

  const texture = new THREE.CanvasTexture(canvas);
  const geometry = new THREE.PlaneGeometry(3, 1.5);
  return { geometry, texture };
}

// ============================================================================
// THE CHIP - Main 3D object
// ============================================================================
function ChipBase() {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    // Base chip - RoundedBox approximation
    const chipGeometry = new THREE.BoxGeometry(CONFIG.chipWidth, CONFIG.chipDepth, CONFIG.chipHeight);
    const edges = new THREE.EdgesGeometry(chipGeometry);
    const edgeIndices = edges.index?.array as Uint16Array;

    // Round corners by subdividing
    const positions = chipGeometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      positions[i] *= Math.cos(Math.abs(x) * 0.3);
      positions[i + 2] *= Math.cos(Math.abs(z) * 0.3);
    }

    chipGeometry.attributes.position.needsUpdate = true;

    const chipMaterial = new THREE.MeshPhysicalMaterial({
      color: CONFIG.chipBaseColor,
      metalness: CONFIG.chipMetalness,
      roughness: CONFIG.chipRoughness,
      clearcoat: CONFIG.chipClearcoat,
    });

    const chip = new THREE.Mesh(chipGeometry, chipMaterial);
    chip.castShadow = true;
    chip.receiveShadow = true;
    groupRef.current.add(chip);

    // Edge glow frame
    const edgeGeometry = new THREE.BoxGeometry(CONFIG.chipWidth - 0.1, 0.05, CONFIG.chipHeight - 0.1);
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: CONFIG.edgeGlowColor,
      emissive: CONFIG.edgeGlowColor,
      emissiveIntensity: CONFIG.edgeEmissiveIntensity,
    });
    const edgeMesh = new THREE.Mesh(edgeGeometry, edgeMaterial);
    edgeMesh.position.y = CONFIG.chipDepth / 2 + 0.05;
    groupRef.current.add(edgeMesh);

    // Dots using InstancedMesh (~1500 dots)
    const dotGeometry = new THREE.SphereGeometry(0.06, 8, 8);
    const dotMaterial = new THREE.MeshStandardMaterial({
      color: CONFIG.accentColor,
      emissive: CONFIG.accentColor,
      emissiveIntensity: CONFIG.dotEmissiveIntensity,
    });

    const dotCount = 1500;
    const instancedDots = new THREE.InstancedMesh(dotGeometry, dotMaterial, dotCount);

    let index = 0;
    for (let i = 0; i < 30; i++) {
      for (let j = 0; j < 50; j++) {
        const x = (i / 30) * CONFIG.chipWidth - CONFIG.chipWidth / 2;
        const z = (j / 50) * CONFIG.chipHeight - CONFIG.chipHeight / 2;

        // Skip center recess area
        const distToCenter = Math.sqrt(x * x + z * z);
        if (distToCenter < 0.5) continue;

        const scale = 0.8 + Math.random() * 0.4;
        const matrix = new THREE.Matrix4();
        matrix.setPosition(x, CONFIG.chipDepth / 2 + 0.15, z);
        matrix.scale(new THREE.Vector3(scale, scale, scale));
        instancedDots.setMatrixAt(index, matrix);

        index++;
      }
    }

    instancedDots.instanceMatrix.needsUpdate = true;
    groupRef.current.add(instancedDots);

    // Center recess outline
    const recessOutline = new THREE.TorusGeometry(0.6, 0.02, 16, 100);
    const outlineMaterial = new THREE.MeshStandardMaterial({
      color: CONFIG.edgeGlowColor,
      emissive: CONFIG.edgeGlowColor,
      emissiveIntensity: 2,
    });
    const outline = new THREE.Mesh(recessOutline, outlineMaterial);
    outline.rotation.x = Math.PI / 2;
    outline.position.y = CONFIG.chipDepth / 2 + 0.15;
    groupRef.current.add(outline);

    return () => {
      chipGeometry.dispose();
      chipMaterial.dispose();
      edgeGeometry.dispose();
      edgeMaterial.dispose();
      dotGeometry.dispose();
      dotMaterial.dispose();
      recessOutline.dispose();
      outlineMaterial.dispose();
    };
  }, []);

  return <group ref={groupRef} />;
}

// ============================================================================
// 3D AI TEXT
// ============================================================================
function AILetters() {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    // Create AI text using canvas
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffb347";
    ctx.font = "bold 140px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AI", 256, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const textGeometry = new THREE.PlaneGeometry(1.5, 0.75);
    const textMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      emissive: CONFIG.edgeGlowColor,
      emissiveIntensity: CONFIG.textEmissiveIntensity,
      metalness: 0.6,
      roughness: 0.2,
    });

    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.y = 0.5;
    groupRef.current.add(textMesh);

    return () => {
      textGeometry.dispose();
      textMaterial.dispose();
      texture.dispose();
    };
  }, []);

  return <group ref={groupRef} />;
}

// ============================================================================
// CIRCUIT TRACES
// ============================================================================
function CircuitTraces() {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    const traceCount = 200;
    const traceLength = 4;

    for (let i = 0; i < traceCount; i++) {
      // Random starting point on chip edge
      const angle = Math.random() * Math.PI * 2;
      const startX = Math.cos(angle) * (CONFIG.chipWidth / 2);
      const startZ = Math.sin(angle) * (CONFIG.chipHeight / 2);

      // Create trace with multiple segments
      const segmentCount = 3 + Math.floor(Math.random() * 3);
      const points = [new THREE.Vector3(startX, -0.2, startZ)];

      for (let j = 0; j < segmentCount; j++) {
        const prevPoint = points[points.length - 1];
        const randomDir = Math.random() > 0.5 ? 1 : -1;
        const nextPoint = new THREE.Vector3(
          prevPoint.x + (Math.random() - 0.5) * 2 * randomDir,
          prevPoint.y - 0.1,
          prevPoint.z + (Math.random() - 0.5) * 2 * randomDir
        );
        points.push(nextPoint);
      }

      // Create tube geometry for trace
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.03, 8);
      const traceMaterial = new THREE.MeshStandardMaterial({
        color: CONFIG.lightColor,
        emissive: CONFIG.lightColor,
        emissiveIntensity: 1.5,
      });

      const traceMesh = new THREE.Mesh(tubeGeometry, traceMaterial);
      traceMesh.userData.isTrace = true;
      groupRef.current.add(traceMesh);
    }

    return () => {
      groupRef.current?.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      });
    };
  }, []);

  return <group ref={groupRef} />;
}

// ============================================================================
// LIGHT BEAMS
// ============================================================================
function LightBeams() {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    // Volumetric beam
    const beamGeometry = new THREE.ConeGeometry(0.8, 3, 32);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: CONFIG.lightColor,
      transparent: true,
      opacity: 0.2,
    });
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.position.y = -1;
    groupRef.current.add(beam);

    return () => {
      beamGeometry.dispose();
      beamMaterial.dispose();
    };
  }, []);

  return <group ref={groupRef} />;
}

// ============================================================================
// 3D WORDS (Blockchain, Big Data, IoT)
// ============================================================================
function WordsDisplay() {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    const words = ["Blockchain", "Big Data", "IoT"];

    words.forEach((word, index) => {
      const { geometry, texture } = createTextGeometry(word);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        emissive: CONFIG.edgeGlowColor,
        emissiveIntensity: 1.5,
        metalness: 0.7,
        roughness: 0.2,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = 2 + index * 0.8;
      mesh.position.z = 1;
      mesh.userData.word = word;
      groupRef.current?.add(mesh);
    });

    return () => {
      groupRef.current?.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      });
    };
  }, []);

  return <group ref={groupRef} />;
}

// ============================================================================
// FLOOR LIGHT RAYS
// ============================================================================
function FloorLightRays() {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    const rayCount = 24;
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const x = Math.cos(angle) * 3;
      const z = Math.sin(angle) * 3;

      const rayGeometry = new THREE.PlaneGeometry(0.1, 4);
      const rayMaterial = new THREE.MeshBasicMaterial({
        color: CONFIG.lightColor,
        transparent: true,
        opacity: 0.1,
      });

      const ray = new THREE.Mesh(rayGeometry, rayMaterial);
      ray.position.set(x, 0, z);
      ray.rotation.x = -Math.PI / 2;
      ray.lookAt(0, 0, 0);
      groupRef.current.add(ray);
    }

    return () => {
      groupRef.current?.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      });
    };
  }, []);

  return <group ref={groupRef} />;
}

// ============================================================================
// MAIN SCENE CONTENT
// ============================================================================
function SceneContent() {
  const groupRef = useRef<THREE.Group>(null);
  const aiLettersRef = useRef<THREE.Group>(null);
  const wordsGroupRef = useRef<THREE.Group>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const tl = gsap.timeline({ repeat: -1 });
    const totalDuration = CONFIG.scene1Duration + CONFIG.scene2Duration + CONFIG.scene3Duration;

    // Scene 1: AI Rises
    if (groupRef.current) {
      tl.to(groupRef.current.position, { y: 0, duration: 1, ease: "power2.out" }, 0);

      tl.to(
        groupRef.current.rotation,
        {
          y: Math.PI * 0.3,
          duration: CONFIG.scene1Duration,
          ease: "power2.inOut",
        },
        0
      );
    }

    if (aiLettersRef.current) {
      tl.to(
        aiLettersRef.current.position,
        {
          y: 2,
          duration: 6,
          ease: "power1.inOut",
        },
        0.5
      );

      tl.to(
        aiLettersRef.current.rotation,
        {
          z: Math.PI * 2,
          duration: 5,
          ease: "expo.out",
        },
        1
      );
    }

    // Scene 2: Light Through Chip
    if (groupRef.current) {
      tl.to(
        groupRef.current.rotation,
        {
          x: Math.PI * 0.2,
          z: Math.PI * 0.1,
          duration: CONFIG.scene2Duration,
          ease: "power1.inOut",
        },
        CONFIG.scene1Duration
      );
    }

    // Scene 3: Words Reveal
    if (wordsGroupRef.current) {
      if (groupRef.current) {
        tl.to(
          groupRef.current.position,
          {
            y: -5,
            duration: 1,
            ease: "power2.in",
          },
          CONFIG.scene1Duration + CONFIG.scene2Duration
        );
      }

      tl.to(
        wordsGroupRef.current.position,
        {
          y: 0,
          duration: 1,
          ease: "power2.out",
        },
        CONFIG.scene1Duration + CONFIG.scene2Duration
      );

      // Words fade in sequence
      wordsGroupRef.current.children.forEach((child, index) => {
        tl.to(
          child.position,
          {
            z: 0,
            duration: 2,
            ease: "power2.out",
          },
          CONFIG.scene1Duration + CONFIG.scene2Duration + index * 2.5
        );

        tl.to(
          child.scale,
          {
            x: 1,
            y: 1,
            z: 1,
            duration: 2,
            ease: "back.out",
          },
          CONFIG.scene1Duration + CONFIG.scene2Duration + index * 2.5
        );
      });

      // Fade out words
      tl.to(
        wordsGroupRef.current,
        {
          opacity: 0,
          duration: 1,
          ease: "power2.in",
        },
        CONFIG.scene1Duration + CONFIG.scene2Duration + CONFIG.scene3Duration - 1
      );
    }

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <>
      <group ref={groupRef} userData={{ isMainGroup: true }}>
        <ChipBase />
        <group ref={aiLettersRef}>
          <AILetters />
        </group>
        <CircuitTraces />
        <LightBeams />
      </group>

      <group ref={wordsGroupRef} userData={{ isWordsGroup: true }} scale={0.5} position={[0, -5, 0]}>
        <WordsDisplay />
        <FloorLightRays />
      </group>

      <Sparkles count={CONFIG.sparkleCount} size={2} speed={0.4} scale={8} />
    </>
  );
}

// ============================================================================
// MAIN CANVAS
// ============================================================================
export function Chip3DScene() {
  const [dpr, setDpr] = useState(1);

  useEffect(() => {
    const dpr = Math.min(window.devicePixelRatio, CONFIG.maxDPR);
    setDpr(dpr);
  }, []);

  return (
    <Canvas
      camera={{
        position: [CONFIG.cameraPositionX, CONFIG.cameraPositionY, CONFIG.cameraPositionZ],
        fov: CONFIG.cameraFOV,
      }}
      dpr={dpr}
      style={{ width: "100%", height: "100%" }}
      performance={{ min: 0.5, max: 1, debounce: 200 }}
    >
      <color attach="background" args={["#05060f"]} />
      <fog attach="fog" args={["#05060f", 5, 20]} />

      {/* Lighting */}
      <ambientLight intensity={0.4} color={CONFIG.violetFill} />
      <directionalLight
        position={[10, 15, 8]}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[5, 5, 5]} intensity={1.5} color={CONFIG.lightColor} />
      <pointLight position={[-5, 3, -5]} intensity={0.8} color={CONFIG.violetFill} />

      <Environment preset="city" />

      {/* Main Scene */}
      <SceneContent />

      {/* Effects */}
      <EffectComposer>
        <Bloom
          intensity={CONFIG.bloomIntensity}
          luminanceThreshold={CONFIG.bloomThreshold}
          luminanceSmoothing={0.9}
        />
        <DepthOfField
          focusDistance={CONFIG.dofFocusDistance}
          focusRange={CONFIG.dofFocusRange}
          bokehScale={8}
        />
        <Vignette offset={0.3} darkness={CONFIG.vignetteIntensity} />
      </EffectComposer>

      <PerformanceMonitor onDecline={() => {}} />
    </Canvas>
  );
}
