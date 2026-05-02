import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { enforceHttpsInProduction } from './lib/security'

enforceHttpsInProduction()
createRoot(document.getElementById("root")!).render(<App />);
