import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { enforceHttpsInProduction } from './lib/security'

enforceHttpsInProduction()

window.addEventListener('vite:preloadError', (event) => {
	// Recover from stale chunk references after a new deploy.
	event.preventDefault()
	window.location.reload()
})

createRoot(document.getElementById("root")!).render(<App />);
