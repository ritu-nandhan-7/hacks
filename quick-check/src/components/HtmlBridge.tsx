import React from "react";
import parse, { domToReact, Element } from "html-react-parser";

export const HtmlBridge: React.FC<{
  htmlContent: string;
  onAction: (id: string) => void;
  children?: React.ReactNode;
}> = ({ htmlContent, onAction, children }) => {
  const options = {
    replace: (domNode: any) => {
      if (domNode instanceof Element && domNode.attribs) {

        // Buttons
        if (domNode.name === "button") {
          return (
            <button
              className={domNode.attribs.class || ""}
              onClick={() =>
                onAction(domNode.attribs.id || "default")
              }
            >
              {domToReact(domNode.children as any, options)}
            </button>
          );
        }

        // Cards
        if (domNode.attribs.class?.includes("choice-card")) {
          return (
            <div
              className={domNode.attribs.class}
              onClick={() =>
                onAction(domNode.attribs.id || "select")
              }
            >
              {domToReact(domNode.children as any, options)}
            </div>
          );
        }

        // Dynamic content injection
        if (domNode.attribs.id === "habitContainer") {
          return <div className="habit-list">{children}</div>;
        }
      }
    },
  };

  return <>{parse(htmlContent, options)}</>;
};