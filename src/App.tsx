import { BrowserRouter, Routes, Route } from "react-router-dom";

import FAQ from "@/pages/FAQ";
import Home from "@/pages/Home";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/faq" element={<FAQ />} />
      </Routes>
    </BrowserRouter>
  );
}
