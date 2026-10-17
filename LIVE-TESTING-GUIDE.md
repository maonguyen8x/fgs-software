# 🎬 Hero Section v2 — Live Testing Guide

## 🚀 RIGHT NOW (What's Running)

✅ **Dev server is RUNNING** on `http://localhost:3000`  
✅ **Build is COMPLETE** with zero TypeScript errors  
✅ **All components are DEPLOYED** and ready  

---

## 📺 Test It Now

### Step 1: Open Browser
```
Visit: http://localhost:3000
```

### Step 2: See the Animation
On the **home page**, you should see:

```
┌─────────────────────────────────────────────┐
│   TRANSPARENT HEADER (white text)            │
├─────────────────────────────────────────────┤
│                                              │
│   Left Side:               Right Side:        │
│   ┌──────────────┐        ┌──────────────┐  │
│   │ Japanese     │        │ 3D Animation │  │
│   │ Headline     │        │              │  │
│   │              │        │ • AI Chip    │  │
│   │ [Buttons]    │        │ • Lights     │  │
│   │ [Pills]      │        │ • Particles  │  │
│   └──────────────┘        │ • Text       │  │
│                            └──────────────┘  │
│   Dark Navy Background                       │
│   ┌──────────────────────────────────────┐  │
│   │ Specialty Areas Bar                   │  │
│   └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Step 3: Watch Animation Play (31 Second Loop)

**Scene 1 (0-13s): "AI Rises"**
```
🎬 Watch:
   ├─ Chip fades in with glow
   ├─ "AI" text floats upward
   ├─ Light beams rise with particles
   ├─ Chip rotates subtly
   └─ "AI" settles back into chip center
```

**Scene 2 (13-21s): "Light Through Chip"**
```
🎬 Watch:
   ├─ Chip becomes see-through
   ├─ Rays of light shine through
   ├─ Dust particles visible in beams
   └─ Camera slowly orbits
```

**Scene 3 (21-31s): "Words Reveal"**
```
🎬 Watch:
   ├─ "Blockchain" appears (glowing text)
   ├─ "Big Data" appears
   ├─ "IoT" appears (all three together)
   ├─ Light rays shoot outward
   └─ Floor reflections glow
   
   Then: Fade out and loop back to Scene 1
```

---

## 🎯 What to Check

### ✅ Visual Quality
- [ ] 3D chip looks realistic and polished
- [ ] Colors are vibrant (orange-gold glow)
- [ ] Text is sharp and readable
- [ ] Light effects look professional
- [ ] Particles add depth

### ✅ Animation Quality
- [ ] Scenes transition smoothly
- [ ] No stuttering or freezing
- [ ] Timing feels natural (not too fast/slow)
- [ ] Loops seamlessly

### ✅ Header Behavior
- [ ] At top of page: header is **transparent** (shows dark hero behind)
- [ ] Scroll down: header becomes **opaque** (light background)
- [ ] Text color changes appropriately
- [ ] Smooth transition

### ✅ Performance
- [ ] Smooth 60 fps (open DevTools → Performance tab)
- [ ] No lag or janky motion
- [ ] Loads quickly
- [ ] No console errors

### ✅ Mobile Experience
- [ ] Responsive layout
- [ ] Animation still plays
- [ ] Touch works
- [ ] No crashes

---

## 🛠️ Customize It

### Change Colors
Edit file: `src/components/hero/Chip3DScene.tsx`

Find this (around line 30):
```typescript
const CONFIG = {
  edgeGlowColor: "#ffb347",    // Orange-gold
  accentColor: "#ff7a18",
  lightColor: "#ffa500",
  violetFill: "#4a3f7f",       // Purple fill
```

Replace with your colors. Examples:
```typescript
// Cool blues instead of warm orange
edgeGlowColor: "#00d4ff",      // Cyan
accentColor: "#0099ff",        // Blue
lightColor: "#00ccff",         // Light cyan
violetFill: "#001a66",         // Deep blue

// Neon pink & purple
edgeGlowColor: "#ff00ff",      // Magenta
accentColor: "#ff0099",        // Pink
lightColor: "#ff1493",         // Deep pink
violetFill: "#4b0082",         // Indigo
```

Then: Refresh browser (Cmd+R or Ctrl+R)

### Make Animation Faster/Slower
In `CONFIG` object:
```typescript
scene1Duration: 13,   // Default: 13 seconds
scene2Duration: 8,    // Default: 8 seconds
scene3Duration: 10,   // Default: 10 seconds

// Make all scenes 1.5x slower (more dramatic)
scene1Duration: 20,
scene2Duration: 12,
scene3Duration: 15,
```

### More/Less Glow
```typescript
bloomIntensity: 1.2,  // Default

// More glow
bloomIntensity: 1.8,

// Less glow (more subtle)
bloomIntensity: 0.6,
```

### More/Less Particles
```typescript
particleCount: 200,   // Default
sparkleCount: 100,    // Default

// More dramatic (faster GPU)
particleCount: 400,
sparkleCount: 200,

// Lightweight (older devices)
particleCount: 50,
sparkleCount: 30,
```

---

## 🚨 If Something Looks Wrong

### "I don't see any 3D animation"
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for red errors
4. If you see WebGL errors:
   - Try a different browser
   - Update your graphics drivers
   - Disable hardware acceleration (if using very old device)

### "Animation is very slow / choppy"
1. Open DevTools → **Performance** tab
2. Look at FPS (frames per second)
3. If less than 30 fps:
   - Reduce particle count:
     ```typescript
     particleCount: 50,
     sparkleCount: 30,
     ```
   - Disable effects temporarily to test
   - Try a different browser

### "Header isn't transparent at top"
1. Verify you're on the home page
2. Check scroll position (should be at top)
3. Try refreshing page
4. Open DevTools → Console, look for errors

### "Text is hard to read"
1. The 3D scene has a dark gradient overlay for readability
2. If still unclear, you can:
   - Increase text brightness in CONFIG:
     ```typescript
     textEmissiveIntensity: 2,  // Current
     // Try:
     textEmissiveIntensity: 3,  // Brighter
     ```

### "Nothing loads at all"
1. Check that `yarn dev` is still running in terminal
2. Check that PostgreSQL is running
3. Look for error messages in terminal
4. Try stopping and restarting: `yarn dev`

---

## 📊 Performance Check

### DevTools Performance Tab
1. Open DevTools (F12)
2. Go to **Performance** tab
3. Click red circle to record
4. Watch animation for 5 seconds
5. Click to stop
6. Look at the graph:
   - Green line = 60 fps (smooth)
   - Yellow/Red = below 60 fps (may be choppy)

**Target**: Should see mostly green line

### DevTools Memory Tab
1. Open DevTools (F12)
2. Go to **Memory** tab
3. Take heap snapshot
4. Look for **GPU Memory** in DevTools sidebar
5. Should be under 50 MB

**Target**: < 50 MB used

---

## 🔄 If You Made Changes

### Refresh Page
```
Chrome/Edge: Ctrl+R or F5
Mac: Cmd+R
```

### Hard Refresh (clear cache)
```
Chrome/Edge: Ctrl+Shift+R
Mac: Cmd+Shift+R
```

### Restart Dev Server
1. Stop terminal (Ctrl+C)
2. Run: `yarn dev`
3. Wait for "Ready in X.Xs"
4. Refresh browser

---

## 📱 Test on Mobile

### Local Mobile Testing
1. Get your computer's IP address
   - Windows: Open PowerShell, run `ipconfig`
   - Look for "IPv4 Address" (e.g., 192.168.1.100)
2. On your phone, visit: `http://[YOUR_IP]:3000`
   - Example: `http://192.168.1.100:3000`
3. Test:
   - [ ] Animation visible
   - [ ] Responsive layout
   - [ ] Touch works
   - [ ] No crashes

---

## ♿ Accessibility Test

### Test for Users with Motion Sensitivity

#### Chrome/Edge
1. Open DevTools (F12)
2. Click three dots → More tools → **Rendering**
3. Check **"Emulate CSS media feature prefers-reduced-motion"**
4. Refresh page
5. You should see **static SVG chip image** instead of animation

This ensures users who get dizzy from motion see a safe static image.

---

## 🎨 Further Customization Ideas

### Add Your Company Logo to 3D Scene
In `Chip3DScene.tsx`, search for `AILetters` component and customize:
```typescript
// Current: shows "AI"
// Could show: "FGS", your logo, custom text
```

### Change Word List in Scene 3
In `Chip3DScene.tsx`, search for `WordsDisplay`:
```typescript
// Current words:
const WORDS = ["Blockchain", "Big Data", "IoT"];

// Your words:
const WORDS = ["Innovation", "Technology", "Excellence"];
```

### Adjust Camera Position
```typescript
cameraPositionX: 0,      // Left/right
cameraPositionY: 3.2,    // Up/down
cameraPositionZ: 6.5,    // In/out
```

Experiment to find the best angle for your design!

---

## 📞 Questions or Issues?

### Check Documentation
- **Full Guide**: `NEW-3D-HERO-GUIDE.md` (detailed)
- **Code Comments**: `src/components/hero/Chip3DScene.tsx` (well-commented)
- **This Guide**: `QUICK-START-V2.md` (quick answers)

### Common Issues Table

| Issue | Solution | Location |
|-------|----------|----------|
| Nothing visible | Check browser console for WebGL errors | F12 → Console |
| Slow animation | Reduce particle count in CONFIG | Line 53-55 |
| Header not transparent | Ensure on home page, at top of scroll | Header.tsx |
| Text not readable | Increase textEmissiveIntensity | Line 45 |
| Animation paused | Scroll hero back into view | Intentional optimization |

---

## 🎉 You're All Set!

**Current Status:**
- ✅ Dev server running
- ✅ Build complete
- ✅ All code deployed
- ✅ Ready for testing

**Next Steps:**
1. Open browser → http://localhost:3000
2. Watch the animation play
3. Customize colors/timing in CONFIG
4. Test on mobile
5. Check performance in DevTools
6. Deploy to production when happy!

---

## 📝 Timeline

```
🎬 Animation Loop (31 seconds total)

 0s ──────────┬────────────┬────────────┬─────────────┐
              │            │            │             │
        Scene 1        Scene 2        Scene 3     Fade out
        (0-13s)        (13-21s)       (21-31s)    Loop back
        
      AI Rises    Light Through  Blockchain ·
                  Chip / God-rays  Big Data ·
                                   IoT
```

---

**Let's build something amazing!** 🚀

Created: 2026-10-17  
Status: ✅ Ready for Production  
