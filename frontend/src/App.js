import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import SiteLayout from "@/components/SiteLayout";
import Home from "@/pages/Home";
import Wines from "@/pages/Wines";
import WineDetail from "@/pages/WineDetail";
import Story from "@/pages/Story";
import Visit from "@/pages/Visit";
import WineClub from "@/pages/WineClub";
import HowToBuy from "@/pages/HowToBuy";
import TrainSeries from "@/pages/TrainSeries";
import News from "@/pages/News";
import NewsDetail from "@/pages/NewsDetail";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";

function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-[#A8A39D]">Loading…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}

const withLayout = (el) => <SiteLayout>{el}</SiteLayout>;

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Toaster position="top-center" theme="dark" richColors />
          <Routes>
            <Route path="/" element={withLayout(<Home />)} />
            <Route path="/wines" element={withLayout(<Wines />)} />
            <Route path="/wines/:slug" element={withLayout(<WineDetail />)} />
            <Route path="/story" element={withLayout(<Story />)} />
            <Route path="/visit" element={withLayout(<Visit />)} />
            <Route path="/wine-club" element={withLayout(<WineClub />)} />
            <Route path="/how-to-buy" element={withLayout(<HowToBuy />)} />
            <Route path="/train-series" element={withLayout(<TrainSeries />)} />
            <Route path="/news" element={withLayout(<News />)} />
            <Route path="/news/:slug" element={withLayout(<NewsDetail />)} />
            <Route path="/contact" element={withLayout(<Contact />)} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
