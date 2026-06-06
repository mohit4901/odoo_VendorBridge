import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Building, CheckCircle2, ShieldAlert } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    role: 'vendor' // default role is vendor onboarding
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const res = register(
        formData.name,
        formData.email,
        formData.password,
        formData.company,
        formData.role
      );
      setLoading(false);

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex">
      {/* Left Pane - Branding & Flow (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 border-r border-zinc-900/60 p-16 flex-col justify-between relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Brand Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center glow-cyan">
            <span className="text-cyan-400 font-bold text-lg tracking-wider">VB</span>
          </div>
          <span className="text-zinc-100 font-bold text-xl tracking-wider">
            Vendor<span className="text-cyan-400">Bridge</span>
          </span>
        </div>

        {/* Informational flow */}
        <div className="my-auto max-w-lg space-y-6 relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Seamless Onboarding for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Enterprise Suppliers</span>
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Create a profile in under two minutes to bid on active Request for Quotations (RFQs), publish pricing catalogs, receive purchase orders, and upload invoices directly.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex gap-3.5">
              <div className="w-6 h-6 rounded-full bg-cyan-950/80 border border-cyan-900 flex items-center justify-center text-[10px] font-bold text-cyan-400">1</div>
              <div>
                <h4 className="text-xs font-bold text-zinc-200">Register Account</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">Submit corporate credentials and vendor basic information.</p>
              </div>
            </div>
            <div className="flex gap-3.5">
              <div className="w-6 h-6 rounded-full bg-cyan-950/80 border border-cyan-900 flex items-center justify-center text-[10px] font-bold text-cyan-400">2</div>
              <div>
                <h4 className="text-xs font-bold text-zinc-200">Verification</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">Automated checks will catalog compliance documents and certificates.</p>
              </div>
            </div>
            <div className="flex gap-3.5">
              <div className="w-6 h-6 rounded-full bg-cyan-950/80 border border-cyan-900 flex items-center justify-center text-[10px] font-bold text-cyan-400">3</div>
              <div>
                <h4 className="text-xs font-bold text-zinc-200">Submit Bids</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">Instantly compare and submit response sheets for pending buyer RFQs.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-zinc-500 relative z-10">
          <span>Secure Supplier Registration Console</span>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-16 lg:px-24 xl:px-32 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none lg:hidden"></div>

        <div className="mx-auto w-full max-w-md space-y-8 relative z-10">
          {success ? (
            /* Onboarding Success Screen */
            <div className="text-center space-y-5">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-950 border border-emerald-900 text-emerald-400 glow-emerald mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Registration Successful!
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Your vendor profile has been recorded in database node. You can now authenticate with the email and password you created.
              </p>
              <div className="pt-4">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  Return to Login Panel
                </Button>
              </div>
            </div>
          ) : (
            /* Form Screen */
            <>
              <div>
                <div className="lg:hidden flex justify-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center glow-cyan">
                    <span className="text-cyan-400 font-bold text-xl">VB</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white text-center lg:text-left">
                  Create supplier profile
                </h3>
                <p className="mt-2 text-xs text-zinc-500 text-center lg:text-left">
                  Register details to connect to the VendorBridge procurement network.
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
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                  label="Contact Name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  icon={User}
                  required
                />

                <Input
                  label="Corporate Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jdoe@company.com"
                  icon={Mail}
                  required
                />

                <Input
                  label="Company Name"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Acme Supplies Ltd."
                  icon={Building}
                  required
                />

                <Input
                  label="Onboarding Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon={Lock}
                  required
                />

                {/* Role select */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Console Profile Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-lg p-2.5 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20"
                  >
                    <option value="vendor">Vendor (Submit quotations, track POs)</option>
                    <option value="buyer">Procurement Officer (Publish RFQs, approve POs)</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-3"
                  disabled={loading}
                >
                  {loading ? 'Creating Profile...' : 'Complete Registration'}
                </Button>
              </form>

              {/* Footer Links */}
              <div className="text-center pt-1 text-xs">
                <span className="text-zinc-500">Already registered? </span>
                <Link to="/login" className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline">
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
