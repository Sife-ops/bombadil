import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Game } from "./pages/game";

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  //   <UrqlProvider value={urql}>
  <App />
  //   </UrqlProvider>
  // </React.StrictMode>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/dev" element={<Dev />} /> */}
        <Route path="/game/:gameId" element={<Game />} />
        <Route path="/error" element={<div>404</div>} />
        <Route path="*" element={<Navigate to="/error" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
