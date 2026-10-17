# Quick Reference - 3D AI Chip Hero Implementation

## Files Created

| File | Purpose |
|------|---------|
| `src/components/home/HeroChip3D.tsx` | Main wrapper component with dynamic loading & accessibility |
| `src/components/home/3d/Chip3DScene.tsx` | Three.js scene with animation timeline and effects |
| `docs/3d-chip-animation-guide.md` | Comprehensive implementation & customization guide |
| `3D-CHIP-IMPLEMENTATION.md` | Summary with testing checklist & quick reference |

## Files Modified

| File | Changes |
|------|---------|
| `src/components/home/codegene/HomeTechHero.tsx` | Replaced `HeroQuantumNeuralOverlay` with `HeroChip3D` |

## Installation (One Command)

```bash
yarn add three @react-three/fiber @react-three/drei @react-three/postprocessing gsap postprocessing
```

## Running the Project

```bash
yarn dev
# Open browser to http://localhost:3001 (or shown port)
# Navigate to home page
```

## Key Configuration

Edit `CONFIG` object in `src/components/home/3d/Chip3DScene.tsx`:

```javascript
// Animation timing (seconds)
scene1Duration: 13,  // "AI Chip Awakening"
scene2Duration: 8,   // "X-Ray / Light Through"
scene3Duration: 8,   // "Top-Down Reveal"

// Colors (RGB normalized 0-1)
primaryColor: { r: 0.42, g: 0.38, b: 0.95 },  // Violet
accentColor: { r: 0.95, g: 0.64, b: 0.2 },    // Orange-gold

// Effects
bloomIntensity: 1.8,
vignetteIntensity: 0.35,
depthOfFieldFocusDistance: 3,

// Performance
particleCount: 150,
maxDPR: 1.75,

// Camera
cameraMousSensitivity: 0.002,
```

## Animation Timeline

**Scene 1: AI Chip Awakening (13 sec)**
- Chip fades in
- Y-axis rotation with lift animation
- Light particles flow through circuit traces

**Scene 2: X-Ray View (8 sec)**
- Camera angle shifts
- X-ray effect via lighting
- God-rays through particle system

**Scene 3: Top-Down Reveal (8 sec)**
- Top-down camera view
- 360° rotation
- Scale-down fade-out

## Component Architecture

```
HomeTechHero.tsx
└── HeroChip3D.tsx (dynamic import, SSR disabled)
    └── Chip3DScene.tsx (Three.js canvas)
        ├── ChipGeometry (procedural chip model)
        ├── Particles (floating particle system)
        ├── SceneContent (GSAP animation timeline)
        ├── CameraController (mouse parallax)
        └── EffectComposer (post-processing)
```

## Performance Features

- ✅ Off-screen rendering pause (Intersection Observer)
- ✅ Tab visibility detection
- ✅ Reduced motion accessibility support
- ✅ Adaptive DPR limiting (max 1.75)
- ✅ Proper memory cleanup
- ✅ Static SVG fallback for low-end devices

## Accessibility

```javascript
// Automatic detection and support for:
- prefers-reduced-motion media query → static image
- Off-screen → rendering paused
- Tab hidden → rendering paused
- Mobile devices → lower particle count
```

## Customization Examples

**Change to Warmer Colors:**
```javascript
primaryColor: { r: 0.95, g: 0.64, b: 0.2 },   // Orange primary
accentColor: { r: 0.42, g: 0.38, b: 0.95 },   // Violet accent
```

**Slower Animation:**
```javascript
scene1Duration: 20,  // Was 13
scene2Duration: 12,  // Was 8
scene3Duration: 12,  // Was 8
```

**More Bloom Effect:**
```javascript
bloomIntensity: 2.5,      // Was 1.8
bloomThreshold: 0.05,     // Was 0.1 (more area affected)
```

**Reduce Particle Load:**
```javascript
particleCount: 50,        // Was 150
```

## Using a GLB Model

1. Place `chip.glb` in `public/models/`
2. Replace `ChipGeometry` in `SceneContent`:

```typescript
import { useGLTF } from '@react-three/drei';

function ChipModel() {
  const { scene } = useGLTF('/models/chip.glb');
  return <primitive object={scene} scale={2} />;
}

// Then in SceneContent:
<group ref={groupRef}>
  <ChipModel />  // Replace <ChipGeometry />
  <Particles />
</group>
```

## Browser DevTools Testing

**Check WebGL Support:**
```javascript
console.log(!!window.WebGLRenderingContext)
```

**Monitor Performance:**
- Performance tab → Start recording → Scroll hero → Stop
- Look for consistent 60fps with no jank

**Check Accessibility Mode:**
```javascript
// In console:
window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

## Deployment Checklist

- ✅ Dependencies installed: `yarn install`
- ✅ Build succeeds: `yarn build`
- ✅ No TypeScript errors: `yarn tsc --noEmit`
- ✅ Dev server runs: `yarn dev`
- ✅ Hero loads on `/en`, `/ja`, `/vi`
- ✅ Animation plays automatically
- ✅ Pauses when off-screen
- ✅ Static fallback works
- ✅ Mobile responsive
- ✅ No console errors

## File Structure

```
src/components/home/
├── HeroChip3D.tsx                     ← Main wrapper
├── 3d/
│   └── Chip3DScene.tsx               ← Three.js scene
├── codegene/
│   └── HomeTechHero.tsx              ← Updated to use HeroChip3D
└── ... (other components)

docs/
├── 3d-chip-animation-guide.md        ← Detailed guide
└── ... (other docs)

3D-CHIP-IMPLEMENTATION.md             ← This summary
```

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Initial load | < 2s | 3D assets load async |
| Frame rate | 60 fps | Adaptive performance enabled |
| GPU memory | < 50MB | Efficient geometry/texture reuse |
| First paint | < 1s | Static fallback renders immediately |

## Testing Instructions

1. **Basic Load Test**
   - Start dev server
   - Visit home page
   - Verify chip appears and animates

2. **Performance Test**
   - Open DevTools Performance tab
   - Record while hero is visible
   - Check for 60fps consistency

3. **Accessibility Test**
   - Enable "Reduce motion" in OS settings
   - Reload page
   - Verify static image shows instead of animation

4. **Mobile Test**
   - View on mobile device or use DevTools device emulation
   - Verify animation plays smoothly
   - Check particle count is reduced

## Common Tweaks

**Make chip bigger:**
```javascript
// In ChipGeometry - change box dimensions:
const chipGeometry = new THREE.BoxGeometry(3, 3, 0.6); // Was 2, 2, 0.4
```

**Faster rotation:**
```javascript
// In scene1Duration:
y: Math.PI * 1,  // Was Math.PI * 0.5
```

**Different lighting:**
```javascript
// Change colors in lighting section:
<ambientLight intensity={0.5} color="#ff6b9d" /> // Change to hot pink
```

**Enable/disable specific effects:**
```javascript
// In EffectComposer, comment out to disable:
{/* <Bloom ... /> */}  // Disable bloom
// <DepthOfField ... />  // Disable DOF
```

## Troubleshooting Quick Fixes

| Issue | Fix |
|-------|-----|
| Animation stutters | Reduce `particleCount` or disable `ChromaticAberration` |
| Scene not visible | Check z-index layering and dark background |
| Mobile performance | Lower `maxDPR` or reduce `particleCount` |
| Memory leak | Clear browser cache and hard refresh |
| Animation won't play | Check `prefers-reduced-motion` setting |
| Text not readable | Increase gradient overlay opacity |

## Support

For detailed information, see:
- `docs/3d-chip-animation-guide.md` - Complete guide
- `3D-CHIP-IMPLEMENTATION.md` - Full summary
- Console logs for runtime errors
- DevTools for WebGL debugging

---

**Version**: 1.0
**Created**: 2026-10-17
**Status**: Production Ready
