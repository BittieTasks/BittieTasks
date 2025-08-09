import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log('🚀 Starting working BittieTasks app...');

// Debug: Check if root element exists
const rootElement = document.getElementById("root");
console.log('🔍 Root element found:', !!rootElement);
console.log('🔍 Root element HTML:', rootElement?.outerHTML);

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    console.log('🔍 React root created successfully');
    root.render(<App />);
    console.log('🔍 App component rendered');
  } catch (error) {
    console.error('❌ Error creating/rendering React app:', error);
    // Fallback: Show a simple message
    rootElement.innerHTML = '<div style="padding: 20px; font-family: Arial;"><h1>BittieTasks Loading...</h1><p>Debug: React render failed. Check console for details.</p></div>';
  }
} else {
  console.error('❌ Root element not found!');
}
