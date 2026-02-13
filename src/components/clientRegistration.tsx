import { useEffect, useState, ChangeEvent } from "react";
import webApp from "@twa-dev/sdk";
import api from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiPhone,
  FiArrowRight,
  FiCheckCircle,
  FiShield,
  FiClock,
} from "react-icons/fi";
import { RiCustomerService2Fill } from "react-icons/ri";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: {
          user?: {
            username?: string;
          };
        };
      };
    };
  }
}

interface RegisterResponse {
  id: number;
  full_name: string;
  phone_number: string;
  role: string;
  joined_at: string;
  telegram_id?: string;
  username?: string;
}

export default function ClientRegistration() {
  const [telegramId, setTelegramId] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [registeredMessage, setRegisteredMessage] = useState(
    "You already have an account.",
  );

  useEffect(() => {
    const user = webApp.initDataUnsafe?.user;
    if (user?.id) setTelegramId(String(user.id));
  }, []);

  useEffect(() => {
    if (!telegramId) return;
    (async () => {
      try {
        const res = await api.get(`/accounts/${telegramId}/`);
        if (res.data && res.data.telegram_id) {
          setRegisteredMessage("You already have an account.");
          setAlreadyRegistered(true);
        }
      } catch (err: any) {
        if (err?.response?.status !== 404) {
          setError("Failed to check user account. Please try again.");
        }
      }
    })();
  }, [telegramId]);

  const handleRegister = async () => {
    if (!phoneNumber || !fullName) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Use @twa-dev/sdk to get Telegram user id
      const telegramUser = webApp.initDataUnsafe?.user;
      const telegram_id = telegramUser?.id?.toString() || null;
      if (!telegram_id) {
        setError("Telegram ID not found. Please open in Telegram WebApp.");
        setIsLoading(false);
        return;
      }
      const username = telegramUser?.username || "no_username";
      const response = await api.post<RegisterResponse>("/accounts/", {
        phone_number: phoneNumber,
        full_name: fullName,
        username,
        telegram_id,
        role: "customer",
      });

      console.log("Registration successful:", response.data);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    if (error) setError("");
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/[^0-9+\s-]/g, "");
    setPhoneNumber(cleaned);
    if (error) setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <AnimatePresence mode="wait">
          {success || alreadyRegistered ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: "backOut" }}
              className="bg-gradient-to-br from-white to-slate-50 p-10 rounded-3xl shadow-2xl text-center border border-slate-200/80 backdrop-blur-sm relative overflow-hidden"
            >
              {/* Success background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 to-cyan-50/20"></div>
              <div className="absolute -right-20 -top-20 w-60 h-60 bg-emerald-400/5 rounded-full"></div>
              <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-cyan-400/5 rounded-full"></div>

              <div className="relative z-10">
                <div className="flex justify-center mb-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.2,
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                    }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 blur-xl opacity-50 rounded-full"></div>
                    <FiCheckCircle className="text-emerald-500 text-6xl relative z-10 drop-shadow-lg" />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                    Completed
                  </h2>
                  <p className="text-slate-600 mb-8 font-medium">
                    {alreadyRegistered
                      ? registeredMessage
                      : "Your registration was successful."}
                  </p>
                </motion.div>

                <div className="space-y-4 mb-8">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center space-x-3"
                  >
                    <FiClock className="text-emerald-500" />
                    <span className="text-slate-700">24/7 Service Booking</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center space-x-3"
                  >
                    <RiCustomerService2Fill className="text-cyan-500" />
                    <span className="text-slate-700">
                      Professional Service Providers
                    </span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center justify-center space-x-3"
                  >
                    <FiShield className="text-sky-500" />
                    <span className="text-slate-700">Secure & Reliable</span>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, delay: 0.8, ease: "easeInOut" }}
                  className="h-2 bg-gradient-to-r from-slate-200 to-slate-100 rounded-full overflow-hidden shadow-inner"
                >
                  <div className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-sky-500 rounded-full"></div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
                  onClick={() => (window as any).Telegram?.WebApp?.close()}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gradient-to-br from-white to-slate-50 p-10 rounded-3xl shadow-2xl border border-slate-200/80 backdrop-blur-sm relative overflow-hidden"
            >
              {/* Form background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50"></div>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-400/10 rounded-full"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-400/10 rounded-full"></div>

              <div className="relative z-10">
                <div className="text-center mb-10">
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="inline-flex items-center justify-center mb-4"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200/50">
                        <span className="text-white text-2xl font-bold">B</span>
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl blur opacity-30"></div>
                    </div>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent mb-2"
                  >
                    Balemuya
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-slate-600 font-medium"
                  >
                    Book premium services with confidence
                  </motion.p>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 rounded-xl text-sm flex items-center border border-red-100 shadow-sm"
                    >
                      <svg
                        className="w-5 h-5 mr-3 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-medium">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 ml-1">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiUser className="text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                        </div>
                        <input
                          type="text"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={handleFullNameChange}
                          className="w-full pl-12 pr-4 py-4 bg-white/80 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all text-slate-900 placeholder-slate-400 shadow-sm hover:shadow-md"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 ml-1">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiPhone className="text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                        </div>
                        <input
                          type="tel"
                          inputMode="tel"
                          pattern="[0-9+\s-]*"
                          placeholder="Enter your phone number"
                          value={phoneNumber}
                          onChange={handlePhoneChange}
                          className="w-full pl-12 pr-4 py-4 bg-white/80 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all text-slate-900 placeholder-slate-400 shadow-sm hover:shadow-md"
                        />
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={handleRegister}
                    disabled={isLoading}
                    className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center relative overflow-hidden group shadow-lg ${
                      isLoading
                        ? "bg-gradient-to-r from-emerald-500 to-cyan-500"
                        : "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                    <span className="relative z-10 flex items-center">
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Get Started
                          <FiArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </motion.button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center space-y-4 mt-8 pt-6 border-t border-slate-200/50"
                >
                  <div className="flex items-center justify-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2 text-emerald-600">
                      <FiShield className="text-sm" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center space-x-2 text-cyan-600">
                      <FiClock className="text-sm" />
                      <span>Instant</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sky-600">
                      <RiCustomerService2Fill className="text-sm" />
                      <span>24/7 Support</span>
                    </div>
                  </div>

                  <p className="text-slate-500 text-xs">
                    By registering, you agree to our{" "}
                    <a
                      href="#"
                      className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Add CSS for blob animation */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
