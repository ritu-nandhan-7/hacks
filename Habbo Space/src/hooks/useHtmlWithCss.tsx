import { useEffect, useState } from "react";

export function useHtmlWithCss(htmlPath: string, cssPath: string) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    fetch(htmlPath)
      .then(res => res.text())
      .then(setHtml);

    fetch(cssPath)
      .then(res => res.text())
      .then(css => {
        const style = document.createElement("style");
        style.innerHTML = css;
        document.head.appendChild(style);
      });
  }, [htmlPath, cssPath]);

  return html;
}