import { createRoot } from "react-dom/client";
import App from "./App-minimal";
import "./index.css";

console.log('🚀 Starting minimal BittieTasks app...');
createRoot(document.getElementById("root")!).render(<App />);
