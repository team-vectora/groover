// src/pages/_app.jsx
import '../global.css';
import './editor.css'; 
import './login.css'; 

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
