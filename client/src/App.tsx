import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Home from "./pages/Home";
import JobPage from "./pages/JobPage";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="konnect-theme">
      <Router>
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 transition-colors duration-300">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs/:id" element={<JobPage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
