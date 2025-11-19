import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import FAQ from "@/pages/FAQ";

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
