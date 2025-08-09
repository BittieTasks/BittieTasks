import { createRoot } from "react-dom/client";
import App from "./App-ultra-minimal";
import "./index.css";

console.log('🚀 Starting ULTRA minimal BittieTasks app - ZERO API CALLS...');
createRoot(document.getElementById("root")!).render(<App />);
