import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Suspense } from "react";
import { RouterProvider } from "react-router/dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";

import { Spinner } from "@/ui/Spinner";

import { queryClient } from "@/lib/queryClient";

import { router } from "@/router";

import "@/i18";

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
      <Suspense fallback={<Spinner />}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />

          <Toaster position="top-center" reverseOrder={false} />
          <RouterProvider router={router} />
        </QueryClientProvider>
      </Suspense>
    </ThemeProvider>
  </StrictMode>,
);
