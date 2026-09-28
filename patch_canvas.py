import sys
import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

old_func = """    const convertViaBrowserCanvas = (colorStr: string): string | null => {
      try {
        if (!testColorCtx) {
          const c = document.createElement("canvas");
          c.width = 1;
          c.height = 1;
          testColorCtx = c.getContext("2d", { willReadFrequently: true });
        }
        if (!testColorCtx) return null;
        testColorCtx.fillStyle = "rgba(0,0,0,0)";
        testColorCtx.fillStyle = colorStr;
        const res = testColorCtx.fillStyle;
        if (res && res !== "rgba(0,0,0,0)" && res !== "#00000000") {
          return res;
        }
      } catch {}
      return null;
    };"""

new_func = """    const convertViaBrowserCanvas = (colorStr: string): string | null => {
      try {
        if (!testColorCtx) {
          const c = document.createElement("canvas");
          c.width = 1;
          c.height = 1;
          testColorCtx = c.getContext("2d", { willReadFrequently: true });
        }
        if (!testColorCtx) return null;
        
        // Clear canvas
        testColorCtx.clearRect(0, 0, 1, 1);
        
        // Fill with color
        testColorCtx.fillStyle = colorStr;
        testColorCtx.fillRect(0, 0, 1, 1);
        
        // Read raw RGBA pixels
        const data = testColorCtx.getImageData(0, 0, 1, 1).data;
        
        // If it's fully transparent black and the input wasn't explicitly transparent, 
        // the color was likely invalid/unsupported by the browser canvas
        if (data[0] === 0 && data[1] === 0 && data[2] === 0 && data[3] === 0 && !colorStr.includes("transparent")) {
          return null;
        }
        
        return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
      } catch {}
      return null;
    };"""

if old_func in code:
    code = code.replace(old_func, new_func)
    print("Patched convertViaBrowserCanvas successfully.")
else:
    print("Failed to patch convertViaBrowserCanvas.")

with open('src/App.tsx', 'w') as f:
    f.write(code)
