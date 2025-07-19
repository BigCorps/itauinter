import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "./components/Header";
import { HomePage } from "./pages/HomePage";
import { TokenPage } from "./pages/TokenPage";
import { PixPage } from "./pages/PixPage";
import { BoletoPage } from "./pages/BoletoPage";
import { AccountPage } from "./pages/AccountPage";
import { WebhookPage } from "./pages/WebhookPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/token" element={<TokenPage />} />
            <Route path="/pix" element={<PixPage />} />
            <Route path="/boleto" element={<BoletoPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/webhook" element={<WebhookPage />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  );
}
