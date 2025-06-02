import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import EditorPage from "./pages/EditorPage";
import LoginPage from "./pages/LoginPage";
function app() {
  return (
      <BrowserRouter>
        <div className="App">
          <div className="content">
            <Routes>
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
  );
}

export default app;