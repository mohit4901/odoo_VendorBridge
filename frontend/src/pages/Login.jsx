import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ShieldAlert, CheckSquare } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import { motion } from 'framer-motion';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@vendorbridge.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
      }
    }, 800); // Add a small loading transition
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex">
      {/* Left Pane - Branding & Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 border-r border-zinc-900/60 p-16 flex-col justify-between relative overflow-hidden">
        {/* Glow element */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Brand */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center glow-cyan">
            <span className="text-cyan-400 font-bold text-lg tracking-wider">VB</span>
          </div>
          <span className="text-zinc-100 font-bold text-xl tracking-wider">
            Vendor<span className="text-cyan-400">Bridge</span>
          </span>
        </div>

        {/* Hero Message */}
        <div className="my-auto max-w-lg space-y-6 relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
            Next-Gen Procurement & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Vendor Management</span>
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Unify your supply chain lifecycle. Standardize RFQ responses, automate purchase orders, reconcile invoices, and monitor vendor performance in real-time.
          </p>

          {/* Features checkmark list */}
          <div className="space-y-3 pt-4">
            {[
              'Direct RFQ publishing to cataloged suppliers',
              'Multi-criteria quotation comparison matrix',
              'Two-step automated approval workflows',
              'SLA analytics and direct compliance scoring'
            ].map((feat, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xs text-zinc-300 font-medium">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div className="text-xs text-zinc-500 relative z-10 flex justify-between items-center">
          <span>Version 1.0.0 (Enterprise Console)</span>
          <span className="text-[10px] uppercase font-semibold text-cyan-400 tracking-wider">Secure Node</span>
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-16 lg:px-24 xl:px-32 relative">
        {/* Glow element for mobile */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none lg:hidden"></div>

        <div className="mx-auto w-full max-w-md space-y-8 relative z-10">
          {/* Header */}
          <div>
            <div className="lg:hidden flex justify-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center glow-cyan">
                <span className="text-cyan-400 font-bold text-xl">VB</span>
              </div>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white text-center lg:text-left">
              Log in to the console
            </h3>
            <p className="mt-2 text-xs text-zinc-500 text-center lg:text-left">
              Demo admin credentials pre-loaded for review.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-lg bg-red-950/20 border border-red-900/40 text-red-400 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs font-semibold leading-normal">{error}</div>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Corporate Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              icon={Mail}
              required
            />

            <Input
              label="Account Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
              required
            />

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 bg-zinc-950 border border-zinc-800 rounded text-cyan-500 focus:ring-offset-black cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 text-xs text-zinc-400 select-none cursor-pointer">
                  Remember session
                </label>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? 'Validating Session...' : 'Authenticate Console'}
            </Button>
          </form>

          {/* Footer Register Link */}
          <div className="text-center pt-2 text-xs">
            <span className="text-zinc-500">Need to register a vendor profile? </span>
            <Link to="/register" className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline">
              Onboard Vendor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
