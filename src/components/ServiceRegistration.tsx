import { useEffect, useState } from "react";
import webApp from "@twa-dev/sdk";
import api from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUpload,
  FiUser,
  FiDollarSign,
  FiMapPin,
  FiCheckCircle,
} from "react-icons/fi";

type Category = { id: number; name: string };

export default function ProviderOnboarding() {
  const [telegramId, setTelegramId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [registeredMessage, setRegisteredMessage] = useState(
    "You already have an account",
  );
  const [activeStep, setActiveStep] = useState(0);

  // Form states
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [category, setCategory] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Handle image preview
  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  // Grab Telegram ID using @twa-dev/sdk
  useEffect(() => {
    const user = webApp.initDataUnsafe?.user;
    if (user?.id) setTelegramId(String(user.id));
    if (user?.username) setUsername(user.username);
  }, []);

  // Load categories
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/services/categories/");
        setCategories(res.data);
      } catch (e: any) {
        console.error(e);
      }
    })();
  }, []);

  // Check if user already exists and whether they already have a service
  useEffect(() => {
    if (!telegramId) return;
    (async () => {
      setLoading(true);
      try {
        const [accountRes, servicesRes] = await Promise.all([
          api.get(`/accounts/${telegramId}/`),
          api.get(`/services/`, {
            params: { provider_telegram_id: telegramId },
          }),
        ]);

        // If user exists, skip step 0 and go to service registration only
        if (accountRes.data && accountRes.data.telegram_id) {
          setFullName(accountRes.data.full_name || "");
          setUsername(accountRes.data.username || "");
          setPhoneNumber(accountRes.data.phone_number || "");
          setActiveStep(1); // Only show service registration
        }

        const existingServices = Array.isArray(servicesRes.data)
          ? servicesRes.data
          : servicesRes.data?.results || [];

        if (existingServices.length > 0) {
          setRegisteredMessage("You already have a service registered.");
          setAlreadyRegistered(true);
        }
      } catch (err: any) {
        // If not found, do nothing (user will register as usual)
        if (err?.response?.status !== 404) {
          setError("Failed to check user account. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [telegramId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate current step before proceeding
    if (activeStep === 0 && (!fullName || !phoneNumber)) {
      setError("Please fill in all required fields.");
      return;
    }

    if (activeStep === 1 && (!category || !title || !description || !price)) {
      setError("Please fill in all required fields.");
      return;
    }

    if (activeStep < 1) {
      setActiveStep((prev) => prev + 1);
      return;
    }

    try {
      setLoading(true);

      // Create/Update provider
      const userPayload = {
        telegram_id: telegramId || "12345678954",
        username: username || null,
        full_name: fullName,
        phone_number: phoneNumber,
        role: "pro",
      };

      try {
        await api.post("/accounts/", userPayload);
      } catch (err: any) {
        if (
          !err?.response?.data?.detail?.toLowerCase().includes("already") &&
          err?.response?.status !== 400
        ) {
          throw err;
        }
      }

      // Create service
      const formData = new FormData();
      formData.append("provider", telegramId || "12345678954");
      formData.append("category", category);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("location", location);
      if (image) formData.append("image", image);

      await api.post("/services/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl bg-white shadow-2xl rounded-3xl overflow-hidden"
      >
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 w-full">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
            initial={{ width: "0%" }}
            animate={{ width: `${(activeStep + 1) * 50}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {success ? "Success!" : "Become a Provider"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {success
                  ? "Your service is now live!"
                  : "Complete your profile in 2 simple steps"}
              </p>
            </div>
            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
              TG ID: {telegramId || "—"}
            </span>
          </div>

          {/* Steps indicator */}
          {!success && (
            <div className="flex justify-between mb-8 relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -z-10"></div>
              {[0, 1].map((step) => (
                <button
                  key={step}
                  onClick={() => setActiveStep(step)}
                  className={`flex flex-col items-center ${
                    activeStep >= step ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activeStep >= step
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-400"
                    } ${activeStep === step ? "ring-4 ring-indigo-200" : ""}`}
                  >
                    {step + 1}
                  </div>
                  <span
                    className={`text-xs mt-2 ${
                      activeStep >= step
                        ? "text-indigo-600 font-medium"
                        : "text-gray-400"
                    }`}
                  >
                    {step === 0 ? "Your Info" : "Service Details"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-6 mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {alreadyRegistered ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="text-indigo-500 text-4xl" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Completed</h2>
            <p className="text-gray-600 mb-6">{registeredMessage}</p>
            <button
              onClick={() => (window as any).Telegram?.WebApp?.close()}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </motion.div>
        ) : success ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="text-green-500 text-4xl" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Congratulations!
            </h2>
            <p className="text-gray-600 mb-6">
              Your provider profile and service have been successfully created.
            </p>
            <button
              onClick={() => (window as any).Telegram?.WebApp?.close()}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition-opacity"
            >
              Close & Return
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 pt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: activeStep === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeStep === 0 ? 20 : -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeStep === 0 ? (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <FiUser className="text-indigo-500" />
                      Personal Information
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition"
                          placeholder="John Legend"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Username (optional)
                        </label>
                        <input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition"
                          placeholder="@username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition"
                          placeholder="+2519…"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Role
                        </label>
                        <input
                          value="Professional"
                          disabled
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <FiDollarSign className="text-indigo-500" />
                      Service Details
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category *
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiAjdjkgN2E2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlsaW5lIHBvaW50cz0iNiA5IDEyIDE1IDE4IDkiPjwvcG9seWxpbmU+PC9zdmc+')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1rem]"
                        >
                          <option value="">Select category…</option>
                          {categories.map((c) => (
                            <option value={String(c.id)} key={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title *
                        </label>
                        <input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition"
                          placeholder="e.g., Private Math Tutor"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description *
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition"
                          rows={4}
                          placeholder="Describe your service in detail..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (ETB) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            ETB
                          </span>
                          <input
                            type="number"
                            inputMode="decimal"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition"
                            placeholder="1000"
                            min="0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <div className="relative">
                          <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition"
                            placeholder="Addis Ababa"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Service Image
                        </label>
                        <div className="mt-1 flex items-center gap-4">
                          <label className="flex-1 cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files?.length)
                                  setImage(e.target.files[0]);
                              }}
                              className="hidden"
                            />
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-300 transition-colors">
                              <FiUpload className="mx-auto text-gray-400 text-2xl mb-2" />
                              <p className="text-sm text-gray-600">
                                {preview ? "Change image" : "Upload an image"}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                PNG, JPG up to 5MB
                              </p>
                            </div>
                          </label>
                          {preview && (
                            <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                              <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex gap-3">
              {activeStep > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => prev - 1)}
                  className="flex-1 py-3 rounded-xl font-medium text-indigo-600 border border-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  Back
                </button>
              )}
              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className={`flex-1 py-3 rounded-xl font-semibold text-white ${
                  activeStep < 1
                    ? "bg-indigo-600"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600"
                } hover:opacity-90 transition-opacity disabled:opacity-70`}
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Processing...
                  </span>
                ) : activeStep < 1 ? (
                  "Continue"
                ) : (
                  "Submit"
                )}
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
