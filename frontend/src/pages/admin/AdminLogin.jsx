import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ASSETS } from "@/lib/assets";
import { toast } from "sonner";

export default function AdminLogin() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) nav("/admin");
  }, [user, nav]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) {
      toast.success("Welcome back.");
      nav("/admin");
    } else {
      setError(res.error);
    }
  };

  const inputCls =
    "w-full bg-transparent border border-white/20 px-4 py-3 text-sm text-[#F5F5F0] placeholder:text-[#6b6560] focus:outline-none focus:border-wine transition-colors";

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6 celtic-weave" data-testid="admin-login-page">
      <div className="w-full max-w-md bg-[#141414] border border-white/10 p-10">
        <div className="text-center mb-9">
          <img src={ASSETS.logo} alt="Sineann" className="h-14 w-14 object-contain mx-auto mb-4" />
          <p className="overline mb-1">Sineann Winery</p>
          <h1 className="font-heading text-3xl font-light text-[#F5F5F0]">Staff Login</h1>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="overline block mb-2">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="admin@sineann.com" data-testid="admin-email-input" />
          </div>
          <div>
            <label className="overline block mb-2">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" data-testid="admin-password-input" />
          </div>
          {error && <p className="text-red-400 text-sm" data-testid="admin-login-error">{error}</p>}
          <button type="submit" disabled={loading} data-testid="admin-login-submit" className="w-full bg-wine hover:bg-wine-hover text-[#F5F5F0] py-3.5 text-[0.8rem] tracking-[0.16em] uppercase transition-colors disabled:opacity-60">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
