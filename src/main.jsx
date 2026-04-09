
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from "react-router-dom"
import {QueryClient , QueryClientProvider} from "@tanstack/react-query"
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from "sonner";
import './index.css'
import App from './App.jsx'


const queryClient = new QueryClient()
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

console.log("client id: " + googleClientId);

const appTree = (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <App />
       <Toaster position="top-right" richColors />
    </QueryClientProvider>
  </BrowserRouter>
)

createRoot(document.getElementById('root')).render(
  googleClientId
    ? <GoogleOAuthProvider clientId={googleClientId}>{appTree}</GoogleOAuthProvider>
    : appTree
)
