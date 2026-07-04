import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

// Fonts
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/playfair-display/700-italic.css";

// General Styles
import "./index.css";

const root = document.getElementById("root")!;

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
