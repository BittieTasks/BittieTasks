import { createRoot } from "react-dom/client";
import App from "./App-mobile-test";
import "./index.css";

console.log('🚀 Starting working BittieTasks app...');
createRoot(document.getElementById("root")!).render(<App />);
