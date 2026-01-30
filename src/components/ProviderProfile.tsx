import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getTelegramId } from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEdit,
  FiStar,
  FiUser,
  FiPhone,
  FiMail,
  FiCheck,
  FiX,
  FiPlus,
} from "react-icons/fi";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

interface Review {
  id: number;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Service {
  id: number;
  provider_name: string;
  average_rating: number;
  reviews: Review[];
  title: string;
  description: string;
  price: string;
  location: string;
  available: boolean;
  created_at: string;
  image: string;
  provider: number;
  category: number;
}

interface User {
  id: number;
  telegram_id: string;
  username?: string;
  full_name?: string;
  phone_number?: string;
  role: string;
  joined_at: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState(false);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"services" | "reviews">(
    "services",
  );

  // Get Telegram ID from WebApp
  const telegram_id = getTelegramId();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    if (!telegram_id) return;
    api
      .get(`/accounts/${telegram_id}/`)
      .then((res) => setUser(res.data))
      .catch(console.error);

    api
      .get(`/services/myservices/?telegram_id=${telegram_id}`)
      .then((res) => setServices(res.data))
      .catch(console.error);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const saveUser = async () => {
    if (!user || !telegram_id) return;

    try {
      const formData = new FormData();
      formData.append("full_name", user.full_name || "");
      formData.append("username", user.username || "");
      formData.append("phone_number", user.phone_number || "");
      if (newImage) formData.append("image", newImage);

      await api.patch(`/accounts/${telegram_id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEditingUser(false);
      setNewImage(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const saveService = async (service: Service) => {
    if (!telegram_id) return;
    const formData = new FormData();
    formData.append("title", service.title);
    formData.append("description", service.description);
    formData.append("price", service.price);
    formData.append("location", service.location);
    formData.append("available", String(service.available));
    if (newImage) formData.append("image", newImage);

    try {
      await api.patch(
        `/services/myservices/${service.id}/?telegram_id=${telegram_id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setEditingServiceId(null);
      setNewImage(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }

    return stars;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/provider/dashboard")}
        className="mb-4 flex items-center gap-2 text-indigo-600 hover:underline font-medium"
      >
        <svg
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Dashboard
      </button>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* User Profile Section */}
        {user && (
          <motion.div
            className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
            whileHover={{ y: -2 }}
          >
            <div className="md:flex">
              <div className="md:w-1/3 p-6 bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center text-white">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/30">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser className="text-5xl text-white/70" />
                    )}
                  </div>
                  {editingUser && (
                    <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100 transition">
                      <FiEdit className="text-indigo-600" />
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                    </label>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-center mb-1">
                  {editingUser ? (
                    <input
                      type="text"
                      value={user.full_name || ""}
                      onChange={(e) =>
                        setUser({ ...user, full_name: e.target.value })
                      }
                      className="bg-transparent border-b border-white/50 focus:border-white focus:outline-none text-center"
                    />
                  ) : (
                    user.full_name || "Anonymous"
                  )}
                </h2>

                <p className="text-white/80 mb-4">
                  @{user.username || "no_username"}
                </p>

                <div className="flex items-center gap-2 bg-white/20 px-4 py-1 rounded-full">
                  <span className="capitalize">{user.role}</span>
                  <span className="text-xs opacity-70">
                    since {formatDate(user.joined_at)}
                  </span>
                </div>
              </div>

              <div className="md:w-2/3 p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Profile Information
                  </h3>
                  {editingUser ? (
                    <div className="flex gap-2">
                      <button
                        onClick={saveUser}
                        className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-sm"
                      >
                        <FiCheck size={14} /> Save
                      </button>
                      <button
                        onClick={() => setEditingUser(false)}
                        className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-full text-sm"
                      >
                        <FiX size={14} /> Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingUser(true)}
                      className="flex items-center gap-1 bg-indigo-500 text-white px-3 py-1 rounded-full text-sm"
                    >
                      <FiEdit size={14} /> Edit Profile
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <FiPhone className="text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Phone Number</p>
                      {editingUser ? (
                        <input
                          type="text"
                          value={user.phone_number || ""}
                          onChange={(e) =>
                            setUser({ ...user, phone_number: e.target.value })
                          }
                          className="w-full border-b border-gray-200 focus:border-indigo-500 focus:outline-none py-1"
                        />
                      ) : (
                        <p className="font-medium">
                          {user.phone_number || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <FiMail className="text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Telegram ID</p>
                      <p className="font-medium">{user.telegram_id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Services & Reviews Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("services")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex-1 ${
                  activeTab === "services"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                My Services
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex-1 ${
                  activeTab === "reviews"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Reviews
              </button>
            </nav>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === "services" ? (
                <motion.div
                  key="services"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {services.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">
                        You haven't created any services yet
                      </p>
                      <button className="bg-indigo-500 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2">
                        <FiPlus /> Create First Service
                      </button>
                    </div>
                  ) : (
                    services.map((service) => (
                      <motion.div
                        key={service.id}
                        whileHover={{ y: -2 }}
                        className="border border-gray-200 rounded-xl overflow-hidden"
                      >
                        <div className="md:flex">
                          <div className="md:w-1/3 bg-gray-100 relative">
                            <img
                              src={
                                service.image ||
                                "https://via.placeholder.com/300x200"
                              }
                              alt={service.title}
                              className="w-full h-full object-cover min-h-48"
                            />
                            {editingServiceId === service.id && (
                              <label className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md flex items-center gap-1 text-sm cursor-pointer hover:bg-white transition">
                                <FiEdit size={14} /> Change Image
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={handleImageChange}
                                  accept="image/*"
                                />
                              </label>
                            )}
                          </div>

                          <div className="md:w-2/3 p-6">
                            <div className="flex justify-between items-start mb-2">
                              {editingServiceId === service.id ? (
                                <input
                                  type="text"
                                  value={service.title}
                                  onChange={(e) => {
                                    const updatedServices = services.map((s) =>
                                      s.id === service.id
                                        ? { ...s, title: e.target.value }
                                        : s,
                                    );
                                    setServices(updatedServices);
                                  }}
                                  className="text-2xl font-bold w-full border-b border-gray-200 focus:border-indigo-500 focus:outline-none pb-1"
                                />
                              ) : (
                                <h3 className="text-2xl font-bold text-gray-800">
                                  {service.title}
                                </h3>
                              )}

                              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                                <FiStar className="text-yellow-400" />
                                <span className="font-medium">
                                  {service.average_rating.toFixed(1)}
                                </span>
                                <span className="text-gray-500 text-sm">
                                  ({service.reviews.length})
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                              <span>{formatDate(service.created_at)}</span>
                              <span>•</span>
                              <span>{service.location}</span>
                            </div>

                            {editingServiceId === service.id ? (
                              <textarea
                                value={service.description}
                                onChange={(e) => {
                                  const updatedServices = services.map((s) =>
                                    s.id === service.id
                                      ? { ...s, description: e.target.value }
                                      : s,
                                  );
                                  setServices(updatedServices);
                                }}
                                className="w-full border border-gray-200 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 focus:outline-none"
                                rows={3}
                              />
                            ) : (
                              <p className="text-gray-600 mb-4">
                                {service.description}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-indigo-600">
                                  {parseFloat(service.price).toLocaleString()}{" "}
                                  ETB
                                </span>
                                {editingServiceId === service.id && (
                                  <input
                                    type="number"
                                    value={service.price}
                                    onChange={(e) => {
                                      const updatedServices = services.map(
                                        (s) =>
                                          s.id === service.id
                                            ? { ...s, price: e.target.value }
                                            : s,
                                      );
                                      setServices(updatedServices);
                                    }}
                                    className="w-32 border-b border-gray-200 focus:border-indigo-500 focus:outline-none px-2 py-1"
                                  />
                                )}
                              </div>

                              <div className="flex gap-2">
                                {editingServiceId === service.id ? (
                                  <>
                                    <button
                                      onClick={() => saveService(service)}
                                      className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-1"
                                    >
                                      <FiCheck /> Save
                                    </button>
                                    <button
                                      onClick={() => setEditingServiceId(null)}
                                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() =>
                                      setEditingServiceId(service.id)
                                    }
                                    className="bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-1"
                                  >
                                    <FiEdit /> Edit Service
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {services.flatMap((service) => service.reviews).length ===
                  0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FiStar className="text-gray-400 text-2xl" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-1">
                        No Reviews Yet
                      </h3>
                      <p className="text-gray-500">
                        You haven't received any reviews for your services
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {services.map(
                        (service) =>
                          service.reviews.length > 0 && (
                            <div key={service.id} className="mb-8">
                              <div className="flex items-center gap-3 mb-4">
                                <h4 className="text-lg font-semibold">
                                  {service.title}
                                </h4>
                                <div className="flex items-center gap-1">
                                  {renderStars(service.average_rating)}
                                  <span className="text-sm text-gray-500 ml-1">
                                    ({service.reviews.length} review
                                    {service.reviews.length !== 1 ? "s" : ""})
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-4">
                                {service.reviews.map((review) => (
                                  <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gray-50 rounded-xl p-4"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                          <FiUser className="text-indigo-600" />
                                        </div>
                                        <div>
                                          <p className="font-medium">
                                            {review.reviewer_name}
                                          </p>
                                          <div className="flex items-center gap-1">
                                            {renderStars(review.rating)}
                                          </div>
                                        </div>
                                      </div>
                                      <span className="text-sm text-gray-400">
                                        {formatDate(review.created_at)}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 pl-13">
                                      {review.comment}
                                    </p>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          ),
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
