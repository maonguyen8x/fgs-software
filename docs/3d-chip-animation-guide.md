# 3D AI Chip Animation Implementation Guide

## Overview

This implementation replaces the original neural network background with a premium, ultra-realistic 3D animated AI chip sequence. The animation loops infinitely with three distinct scenes, each with unique visual effects and camera movements.

## Files Created

### 1. **HeroChip3D.tsx** (`src/components/home/HeroChip3D.tsx`)
Main wrapper component that handles:
- Dynamic import of the 3D scene (with SSR disabled)
- Intersection Observer for performance optimization (pauses rendering when off-screen)
- Visibility detection (pauses when tab is hidden)
- Accessibility support (respects `prefers-reduced-motion` media query)
- Fallback static chip image for low-end devices or reduced motion

### 2. **Chip3DScene.tsx** (`src/components/home/3d/Chip3DScene.tsx`)
Three.js + React Three Fiber scene implementation with:

#### Key Components:
- **ChipGeometry**: Creates the 3D chip with:
  - Main chip body (2x2x0.4 box with material properties)
  - Metallic edge ring with glow
  - Grid of dots on the chip surface
  - Radiating circuit line traces
  - Proper disposal of geometries and materials

- **Particles**: Floating particle system with:
  - 150 particles by default (40 on low-end devices)
  - Velocity-based movement with boundary wrapping
  - Emissive glow effect

- **SceneContent**: Animation controller using GSAP timeline
- **CameraController**: Subtle parallax effect following mouse movement
- **Post-Processing**: 
  - Bloom for glow effects
  - Depth of Field for cinematic look
  - Vignette for edge darkening
  - Chromatic Aberration for subtle distortion

#### Configuration Object (top of file)
```javascript
const CONFIG = {
  // Animation timings (in seconds)
  scene1Duration: 13,
  scene2Duration: 8,
  scene3Duration: 8,
  
  // Colors (easily adjustable)
  primaryColor: { r: 0.42, g: 0.38, b: 0.95 }, // #6b61ff
  accentColor: { r: 0.95, g: 0.64, b: 0.2 }, // #f3a314
  
  // Post-processing parameters
  bloomIntensity: 1.8,
  // ... more settings
};
```

## Animation Timeline

### Scene 1: "AI Chip Awakening" (13 seconds)
1. Chip fades in with Y-axis rotation
2. Chip lifts slightly (position.y changes)
3. Light streaks flow along circuit traces
4. Smooth easing with power1.inOut

### Scene 2: "X-Ray / Light Through the Chip" (8 seconds)
1. Camera rotates to different angle (X and Z rotation)
2. Chip becomes semi-transparent appearance through lighting
3. Individual light rays pass through gaps
4. Dust particles highlight light shafts

### Scene 3: "Top-Down Reveal" (8 seconds)
1. Camera moves to top-down view (X rotation normalized)
2. Chip rotates 360 degrees (full Y rotation)
3. Glow intensifies
4. Chip dissolves/scales down
5. Fades out and loops

## Installation

Run these commands in the project root:

```bash
yarn add three @react-three/fiber @react-three/drei @react-three/postprocessing gsap postprocessing
```

Or using npm:

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing gsap postprocessing
```

## Modified Files

### HomeTechHero.tsx (`src/components/home/codegene/HomeTechHero.tsx`)
Changed:
- Removed import of `HeroQuantumNeuralOverlay`
- Added dynamic import of `HeroChip3D`
- Replaced `<HeroQuantumNeuralOverlay />` with `<HeroChip3D />`

All text, buttons, pills, and expertise bar remain unchanged.

## Performance Optimization

1. **DPR Limiting**: Max device pixel ratio set to 1.75 to reduce GPU load
2. **Adaptive Performance**: Three Fiber's PerformanceMonitor adjusts rendering
3. **Intersection Observer**: Scene pauses when hero is off-screen
4. **Visibility API**: Scene pauses when tab is hidden
5. **Reduced Motion**: Static fallback for users preferring reduced motion
6. **Particle Instancing**: Efficient particle rendering
7. **Proper Cleanup**: All geometries, materials, and textures disposed on unmount

## Customization Guide

### Colors
Edit the `CONFIG` object in `Chip3DScene.tsx`:
```javascript
primaryColor: { r: 0.42, g: 0.38, b: 0.95 }, // Change to your color
accentColor: { r: 0.95, g: 0.64, b: 0.2 },   // Edge glow color
```

### Animation Duration
```javascript
scene1Duration: 13,   // First scene length
scene2Duration: 8,    // Second scene length
scene3Duration: 8,    // Third scene length
```

### Bloom Intensity
```javascript
bloomIntensity: 1.8,  // Increase for more glow
bloomThreshold: 0.1,  // Lower = more affected by bloom
```

### Particle Count
```javascript
particleCount: 150,        // High-end devices
particleCountLowEnd: 40,   // Mobile/low-end
```

### Camera Settings
```javascript
cameraDistance: 4,           // How far from chip
cameraMousSensitivity: 0.002, // Parallax intensity
```

## Using a GLB Model Later

To replace the procedural chip with a 3D model:

1. Load your GLB model using `@react-three/drei`'s `useGLTF`:
```typescript
import { useGLTF } from '@react-three/drei';

function ChipModel() {
  const { scene } = useGLTF('/models/chip.glb');
  return <primitive object={scene} scale={2} />;
}
```

2. Replace the `ChipGeometry` component in `SceneContent` with your model component
3. Adjust scale, position, and rotation as needed
4. Keep all material adjustments and animations in the timeline

## Browser Support

- Modern browsers with WebGL 2.0 support
- Fallback static image for:
  - Old browsers without WebGL
  - Mobile devices (on load, before 3D scene initializes)
  - Users with `prefers-reduced-motion: reduce`

## Responsive Behavior

- Mobile: Chip appears behind text with lower opacity
- Tablet: Normal rendering
- Desktop: Full 3D experience with subtle parallax
- All text remains readable via the dark gradient overlay

## Testing

Start the dev server:
```bash
yarn dev
```

Navigate to `http://localhost:3000` (or the next available port) and view the hero section. The chip animation should:
1. Load smoothly with a fallback image initially
2. Play the three scenes in an infinite loop
3. Pause when scrolled off-screen
4. Resume when scrolled back into view
5. Support mouse parallax movement

## Troubleshooting

### Animation not playing
- Check browser console for WebGL errors
- Verify Three.js and React Three Fiber are installed
- Check if `prefers-reduced-motion` is enabled in OS settings

### Low performance
- Reduce `particleCount` in CONFIG
- Lower `bloomIntensity` or disable in EffectComposer
- Reduce texture resolution if using GLB model

### Mobile issues
- Scene automatically reduces particles on low-end detection
- Fallback image displays if 3D fails to load
- Ensure device pixel ratio is capped properly

## Future Enhancements

1. Add sound effects synchronized with animation
2. Interactive chip that responds to user clicks
3. Multiple chip variations that randomize on load
4. HDR environment for better reflections
5. Real 3D file import with post-processing per scene
6. Performance profiling dashboard
