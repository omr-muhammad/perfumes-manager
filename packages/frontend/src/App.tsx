import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

const router = createBrowserRouter([
  {
    path: "/",
    Component: () => <h1>There's no war in Ba Sing Se.</h1>,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
