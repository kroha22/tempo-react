import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Demo } from "./Demo";
import "@/app/globals.css";
import "@/features/practice/adult-lessons.css";
import "@/features/practice/house.css";
import "./pages.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Demo />
  </StrictMode>,
);
