import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./i18";

// -------------------- Fonts --------------------
// En
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/playfair-display/700-italic.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";

// Ar
import "@fontsource/amiri/700.css";
import "@fontsource/amiri/700-italic.css";
import "@fontsource/cairo/400.css";
import "@fontsource/cairo/500.css";
import "@fontsource/cairo/600.css";

// -----------------------------------------------

// -------------------- General Styles --------------------
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";
// --------------------------------------------------------

const root = document.getElementById("root")!;

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
