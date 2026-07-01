/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock scrollIntoView for jsdom
Element.prototype.scrollIntoView = vi.fn();
