import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import SeoLandingPage from "./pages/SeoLandingPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/font-subset-online" element={<SeoLandingPage slug="font-subset-online" />} />
        <Route path="/woff2-converter" element={<SeoLandingPage slug="woff2-converter" />} />
        <Route path="/variable-font-instance" element={<SeoLandingPage slug="variable-font-instance" />} />
        <Route path="/ttf-to-woff2" element={<SeoLandingPage slug="ttf-to-woff2" />} />
        <Route path="/font-glyph-coverage" element={<SeoLandingPage slug="font-glyph-coverage" />} />
      </Route>
    </Routes>
  );
}
