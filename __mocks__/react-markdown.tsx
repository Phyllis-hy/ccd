import React from "react";

type ReactMarkdownProps = {
  children?: React.ReactNode;
};

export default function ReactMarkdown({ children }: ReactMarkdownProps) {
  return React.createElement(React.Fragment, null, children);
}
