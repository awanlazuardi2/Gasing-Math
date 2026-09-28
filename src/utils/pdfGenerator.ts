/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Helper to convert oklab to rgb mathematical representation
function oklabToRgb(L: number, a: number, b: number, alpha?: string): string {
  if (isNaN(L)) L = 0;
  if (isNaN(a)) a = 0;
  if (isNaN(b)) b = 0;

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l_3 = l_ * l_ * l_;
  const m_3 = m_ * m_ * m_;
  const s_3 = s_ * s_ * s_;

  const r = +4.0767416621 * l_3 - 3.3077115913 * m_3 + 0.2309699292 * s_3;
  const g = -1.2684380046 * l_3 + 2.6097574011 * m_3 - 0.3413193965 * s_3;
  const b_ = -0.0041960863 * l_3 - 0.7034186147 * m_3 + 1.7076147010 * s_3;

  const fn = (x: number) => {
    const clamped = Math.max(0, Math.min(1, x));
    return clamped > 0.0031308
      ? 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055
      : 12.92 * clamped;
  };

  const r255 = Math.round(fn(r) * 255);
  const g255 = Math.round(fn(g) * 255);
  const b255 = Math.round(fn(b_) * 255);

  if (alpha !== undefined && alpha !== "1") {
    return `rgba(${r255}, ${g255}, ${b255}, ${alpha})`;
  }
  return `rgb(${r255}, ${g255}, ${b255})`;
}

// Canvas-based color converter for modern browser color spaces
let testColorCtx: CanvasRenderingContext2D | null = null;
function convertViaBrowserCanvas(colorStr: string): string | null {
  try {
    if (!testColorCtx) {
      const c = document.createElement("canvas");
      c.width = 1;
      c.height = 1;
      testColorCtx = c.getContext("2d", { willReadFrequently: true });
    }
    if (!testColorCtx) return null;

    testColorCtx.clearRect(0, 0, 1, 1);
    testColorCtx.fillStyle = colorStr;
    testColorCtx.fillRect(0, 0, 1, 1);

    const data = testColorCtx.getImageData(0, 0, 1, 1).data;
    if (
      data[0] === 0 &&
      data[1] === 0 &&
      data[2] === 0 &&
      data[3] === 0 &&
      !colorStr.includes("transparent")
    ) {
      return null;
    }
    return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
  } catch {
    return null;
  }
}

export function sanitizeColorsInString(cssText: string): string {
  if (!cssText) return cssText;
  if (
    !cssText.includes("oklab") &&
    !cssText.includes("oklch") &&
    !cssText.includes("color(") &&
    !cssText.includes("lab(") &&
    !cssText.includes("lch(")
  ) {
    return cssText;
  }

  const colorRegex = /(?:oklab|oklch|color|lab|lch)\((?:[^)(]+|\([^)(]*\))*\)/gi;
  return cssText.replace(colorRegex, (match) => {
    const converted = convertViaBrowserCanvas(match);
    return converted ? converted : "rgb(30, 41, 59)";
  });
}

function createComputedStyleProxy(cs: CSSStyleDeclaration) {
  return new Proxy(cs, {
    get(target, prop, receiver) {
      if (prop === "getPropertyValue") {
        return (propertyName: string) => {
          const val = target.getPropertyValue(propertyName);
          if (
            typeof val === "string" &&
            (val.includes("oklab") ||
              val.includes("oklch") ||
              val.includes("color(") ||
              val.includes("lab(") ||
              val.includes("lch("))
          ) {
            return sanitizeColorsInString(val);
          }
          return val;
        };
      }
      const val = Reflect.get(target, prop, target);
      if (
        typeof val === "string" &&
        (val.includes("oklab") ||
          val.includes("oklch") ||
          val.includes("color(") ||
          val.includes("lab(") ||
          val.includes("lch("))
      ) {
        return sanitizeColorsInString(val);
      }
      if (typeof val === "function") {
        return val.bind(target);
      }
      return val;
    },
  });
}

/**
 * Downloads a worksheet element as an exact, high-fidelity A4 PDF.
 * If container has multiple .a4-worksheet-page elements, captures each as an independent page.
 * Uses an isolated DOM staging sandbox to eliminate mobile viewport compression and parent transform artifacts.
 */
export async function exportWorksheetToPdf(
  container: HTMLElement,
  fileName: string,
  onStatusChange?: (isPrinting: boolean) => void
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;

  const originalWindowGetComputedStyle = window.getComputedStyle;
  const styleEls = Array.from(document.querySelectorAll("style"));
  const styleBackups: { el: HTMLStyleElement; text: string }[] = [];

  // Viewport & body width states to restore
  const viewportMeta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  const originalViewport = viewportMeta ? viewportMeta.content : null;
  const origDocWidth = document.documentElement.style.width;
  const origBodyWidth = document.body.style.width;
  const origDocMinWidth = document.documentElement.style.minWidth;
  const origBodyMinWidth = document.body.style.minWidth;

  let stagingHost: HTMLDivElement | null = null;

  try {
    if (onStatusChange) onStatusChange(true);

    // 1. Wait for document fonts to be ready
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch {}
    }

    // 2. Temporarily set viewport meta tag and document width to standard desktop layout (1024px)
    // This prevents mobile browsers from compressing elements into a narrow screen width
    if (viewportMeta) {
      viewportMeta.content = "width=1024, initial-scale=1.0";
    }
    document.documentElement.style.width = "1024px";
    document.body.style.width = "1024px";
    document.documentElement.style.minWidth = "1024px";
    document.body.style.minWidth = "1024px";

    // 3. Sanitize stylesheets in DOM temporarily for html2canvas
    for (const el of styleEls) {
      const text = el.textContent || "";
      if (
        text.includes("oklch") ||
        text.includes("oklab") ||
        text.includes("color(") ||
        text.includes("lab(") ||
        text.includes("lch(")
      ) {
        styleBackups.push({ el, text });
        el.textContent = sanitizeColorsInString(text);
      }
    }

    // 4. Wrap window.getComputedStyle temporarily
    window.getComputedStyle = function (el: Element, pseudo?: string | null) {
      const cs = originalWindowGetComputedStyle.call(window, el, pseudo);
      return createComputedStyleProxy(cs);
    };

    // 5. Create an isolated staging wrapper at top-level document.body
    // Positioned at (0, 0) with exact A4 96DPI dimensions (794 x 1123 px)
    stagingHost = document.createElement("div");
    stagingHost.id = "pdf-staging-host";
    stagingHost.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 794px !important;
      min-width: 794px !important;
      max-width: 794px !important;
      height: 1123px !important;
      min-height: 1123px !important;
      max-height: 1123px !important;
      background-color: #ffffff !important;
      z-index: 45 !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      transform: none !important;
      box-shadow: none !important;
      pointer-events: none !important;
    `;
    document.body.appendChild(stagingHost);

    // 6. Find all .a4-worksheet-page elements
    let pageEls = Array.from(
      container.querySelectorAll<HTMLElement>(".a4-worksheet-page")
    );

    // If container itself is the page or no .a4-worksheet-page child found, use container
    if (pageEls.length === 0) {
      pageEls = [container];
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfWidth = 210;
    const pdfHeight = 297;

    for (let p = 0; p < pageEls.length; p++) {
      const pageEl = pageEls[p];
      if (p > 0) {
        pdf.addPage("a4", "portrait");
      }

      // Clear staging host and insert cloned page
      stagingHost.innerHTML = "";
      const clonedPage = pageEl.cloneNode(true) as HTMLElement;

      // Enforce clean, uncompressed A4 styles on the cloned page
      clonedPage.style.cssText = `
        width: 794px !important;
        min-width: 794px !important;
        max-width: 794px !important;
        height: 1123px !important;
        min-height: 1123px !important;
        max-height: 1123px !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        padding: 40px !important;
        background-color: #ffffff !important;
        transform: none !important;
        box-shadow: none !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
        text-align: left !important;
      `;

      stagingHost.appendChild(clonedPage);

      // Wait for any cloned images (e.g. school logo) to be fully loaded
      const images = Array.from(stagingHost.querySelectorAll("img"));
      if (images.length > 0) {
        await Promise.all(
          images.map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise((res) => {
              img.onload = res;
              img.onerror = res;
            });
          })
        );
      }

      // Allow DOM layout pass to settle
      await new Promise((r) => requestAnimationFrame(r));

      const canvas = await html2canvas(stagingHost, {
        scale: 2.0, // High-DPI crisp print resolution (1588 x 2246 px)
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: 794,
        height: 1123,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1024,
        windowHeight: 1400,
        onclone: (clonedDoc) => {
          // Sanitize cloned stylesheets
          const clonedStyles = Array.from(clonedDoc.querySelectorAll("style"));
          for (const s of clonedStyles) {
            if (s.textContent) {
              s.textContent = sanitizeColorsInString(s.textContent);
            }
          }

          if (clonedDoc.defaultView) {
            const origClonedGCS = clonedDoc.defaultView.getComputedStyle;
            clonedDoc.defaultView.getComputedStyle = function (
              el: Element,
              pseudo?: string | null
            ) {
              const cs = origClonedGCS.call(clonedDoc.defaultView, el, pseudo);
              return createComputedStyleProxy(cs);
            };
          }

          const clonedViewport = clonedDoc.querySelector<HTMLMetaElement>('meta[name="viewport"]');
          if (clonedViewport) {
            clonedViewport.content = "width=1024";
          }
          clonedDoc.documentElement.style.width = "1024px";
          clonedDoc.body.style.width = "1024px";

          const clonedStaging = clonedDoc.getElementById("pdf-staging-host");
          if (clonedStaging) {
            clonedStaging.style.position = "fixed";
            clonedStaging.style.top = "0";
            clonedStaging.style.left = "0";
            clonedStaging.style.width = "794px";
            clonedStaging.style.minWidth = "794px";
            clonedStaging.style.maxWidth = "794px";
            clonedStaging.style.height = "1123px";
            clonedStaging.style.minHeight = "1123px";
            clonedStaging.style.maxHeight = "1123px";
            clonedStaging.style.transform = "none";
            clonedStaging.style.margin = "0";
            clonedStaging.style.padding = "0";
          }
        },
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
    }

    pdf.save(fileName);
  } finally {
    // Remove staging host element
    if (stagingHost && stagingHost.parentNode) {
      stagingHost.parentNode.removeChild(stagingHost);
    }

    // Restore viewport meta
    if (viewportMeta && originalViewport) {
      viewportMeta.content = originalViewport;
    }

    // Restore document & body styles
    document.documentElement.style.width = origDocWidth;
    document.body.style.width = origBodyWidth;
    document.documentElement.style.minWidth = origDocMinWidth;
    document.body.style.minWidth = origBodyMinWidth;

    // Restore window.getComputedStyle
    if (originalWindowGetComputedStyle) {
      window.getComputedStyle = originalWindowGetComputedStyle;
    }

    // Restore stylesheets
    for (const backup of styleBackups) {
      try {
        backup.el.textContent = backup.text;
      } catch {}
    }

    if (onStatusChange) onStatusChange(false);
  }
}
