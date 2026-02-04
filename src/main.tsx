import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider } from "react-redux"; // 1. Import Provider
import { store } from "../src/store/store.ts";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}> 
    <App />
  </Provider>
);
