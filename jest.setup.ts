import "@testing-library/jest-dom";
import React from "react";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ComponentProps<"img">) =>
    React.createElement("img", props),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    React.createElement(
      "a",
      { href: href as string, ...rest },
      children
    )
  ),
}));

jest.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: new Proxy(
    {},
    {
      get: () => (props: { children?: React.ReactNode }) => props.children ?? null,
    }
  ),
  useAnimation: () => ({ start: jest.fn() }),
}));

Object.defineProperty(HTMLMediaElement.prototype, "play", {
  configurable: true,
  writable: true,
  value: jest.fn().mockResolvedValue(undefined),
});

Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  configurable: true,
  writable: true,
  value: jest.fn(),
});
