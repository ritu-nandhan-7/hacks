import { useEffect, useState } from "react";

export function useHtmlWithCss(htmlPath: string, cssPath: string) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    let styleEl: HTMLStyleElement | null = null;

    // Load HTML
    fetch(htmlPath)
      .then((res) => res.text())
      .then(setHtml);

    // Load CSS
    fetch(cssPath)
      .then((res) => res.text())
      .then((css) => {
        styleEl = document.createElement("style");
        styleEl.innerHTML = css;
        document.head.appendChild(styleEl);
      });

    return () => {
      if (styleEl) document.head.removeChild(styleEl);
    };
  }, [htmlPath, cssPath]);

  return html;
}