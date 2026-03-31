import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize Netlify Identity widget
import netlifyIdentity from "netlify-identity-widget";
netlifyIdentity.init();

createRoot(document.getElementById("root")!).render(<App />);
