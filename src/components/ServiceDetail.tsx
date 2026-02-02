import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiStar,
  FiMapPin,
  FiUser,
  FiCalendar,
  FiArrowLeft,
  FiSend,
  FiPhone,
} from "react-icons/fi";
import { FaTelegram, FaWhatsapp } from "react-icons/fa";
import { IoCheckmarkDone } from "react-icons/io5";
import webApp from "@twa-dev/sdk";

interface Review {
  id: number;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_avatar?: string;
}

interface Service {
  id: number;
  title: string;
  description: string;
  price: string;
  location: string;
  category: { id: number; name: string } | null;
  average_rating: number;
  reviews: Review[];
  provider_name: string;
  provider_avatar?: string;
  provider_contact?: string;
  image?: string;
  duration?: string;
  available: boolean;
}

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [note, setNote] = useState("");

  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const res = await api.get(`/services/${id}/`);
      setService(res.data);
      if (res.data.available_dates?.length) {
        setSelectedDate(res.data.available_dates[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderStars = (rating: number, size = "text-xl") => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <FiStar
          key={i}
          className={`${
            i < Math.floor(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          } ${size}`}
        />
      ));
  };

  const handleReviewSubmit = async () => {
    if (!newRating) return;
    try {
      setLoading(true);
      await api.post(`/services/reviews/`, {
        service: service?.id,
        rating: newRating,
        reviewer: 1,
        comment: newComment,
      });
      setNewRating(0);
      setNewComment("");
      fetchService(); // refresh
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    try {
      setLoading(true);
      const telegram_id = webApp.initDataUnsafe?.user?.id?.toString() || null;
      console.log("Telegram ID:", telegram_id);
      await api.post(
        `/bookings/?telegram_id=${encodeURIComponent(telegram_id ?? "")}`,
        {
          service: service?.id,
          scheduled_date: selectedDate,
          price: service?.price,
          note: note,
        },
      );
      setBookingSuccess(true);
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingSuccess(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!service)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-4 pb-20">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto mb-6 flex items-center justify-between"
      >
        <Link to="/" className="flex items-center">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <FiArrowLeft className="text-2xl text-indigo-600" />
          </motion.div>
          <h1 className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Balemuya
          </h1>
        </Link>
        <div className="flex items-center">
          <FaTelegram className="text-2xl text-indigo-500 mr-3" />
          <FaWhatsapp className="text-2xl text-green-500" />
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-3xl mx-auto"
      >
        {/* Image Gallery */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl mb-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="aspect-w-16 aspect-h-9 bg-gray-200"
          >
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* Service Info */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {service.title}
              </h1>
              {service.category && (
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm mt-2">
                  {service.category.name}
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-indigo-600">
                ${service.price}
              </p>
              {service.duration && (
                <p className="text-sm text-gray-500">{service.duration}</p>
              )}
            </div>
          </div>

          <div className="flex items-center mt-4">
            <div className="flex mr-2">
              {renderStars(service.average_rating)}
            </div>
            <span className="text-sm text-gray-500">
              ({service.average_rating.toFixed(1)})
            </span>
          </div>

          {service.location && (
            <div className="flex items-center mt-3 text-gray-600">
              <FiMapPin className="mr-2" />
              <span>{service.location}</span>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-line">
              {service.description}
            </p>
          </div>
        </motion.div>

        {/* Provider Info */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6"
        >
          <h3 className="font-semibold text-lg mb-4">Service Provider</h3>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden mr-4">
              {service.provider_avatar ? (
                <img
                  src={service.provider_avatar}
                  alt={service.provider_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser className="text-indigo-500 text-xl" />
              )}
            </div>
            <div>
              <p className="font-medium">{service.provider_name}</p>
              {service.provider_contact && (
                <a
                  href={`tel:${service.provider_contact}`}
                  className="text-sm text-indigo-600 flex items-center"
                >
                  <FiPhone className="mr-1" /> {service.provider_contact}
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Reviews */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Reviews</h3>
            <span className="text-sm text-gray-500">
              {service.reviews.length} reviews
            </span>
          </div>

          {service.reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {service.reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-gray-100 pb-4 last:border-0"
                >
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mr-3">
                        {review.reviewer_avatar ? (
                          <img
                            src={review.reviewer_avatar}
                            alt={review.reviewer_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FiUser className="text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{review.reviewer_name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      {renderStars(review.rating, "text-base")}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-gray-700 pl-13">{review.comment}</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Add Review */}
          <div className="mt-8">
            <h3 className="font-semibold text-lg mb-4">Add Your Review</h3>
            <div className="flex items-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setNewRating(star)}
                  className="mr-1"
                >
                  <FiStar
                    className={`text-2xl ${
                      star <= (hoverRating || newRating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </motion.button>
              ))}
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 mb-4 focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              placeholder="Share your experience..."
              rows={3}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReviewSubmit}
              disabled={loading || !newRating}
              className={`w-full py-3 rounded-xl font-medium text-white flex items-center justify-center ${
                loading || !newRating
                  ? "bg-indigo-300"
                  : "bg-gradient-to-r from-indigo-500 to-purple-500"
              }`}
            >
              {loading ? "Submitting..." : "Submit Review"}{" "}
              <FiSend className="ml-2" />
            </motion.button>
          </div>
        </motion.div>

        {/* Fixed Booking Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="fixed bottom-6 left-0 right-0 px-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowBookingModal(true)}
            className="w-full max-w-3xl mx-auto py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-lg font-bold text-lg"
          >
            Book Now
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => !bookingSuccess && setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {bookingSuccess ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <IoCheckmarkDone className="text-green-500 text-4xl" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Booking Confirmed!
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Your booking for {service.title} has been confirmed.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowBookingModal(false)}
                    className="w-full py-3 bg-indigo-500 text-white rounded-xl font-medium"
                  >
                    Close
                  </motion.button>
                </motion.div>
              ) : (
                <>
                  <div className="p-6 border-b">
                    <h3 className="text-xl font-bold text-gray-900">
                      Book Service
                    </h3>
                    <p className="text-gray-500">{service.title}</p>
                  </div>
                  <div className="p-6">
                    {service.available ? (
                      <>
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Date
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              value={selectedDate}
                              onChange={(e) => setSelectedDate(e.target.value)}
                              min={new Date().toISOString().split("T")[0]} // Disable past dates
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <FiCalendar className="absolute right-3 top-3.5 text-gray-400" />
                          </div>
                          {selectedDate && (
                            <p className="mt-2 text-sm text-gray-500">
                              Selected:{" "}
                              {new Date(selectedDate).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </p>
                          )}
                        </div>
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Notes
                          </label>
                          <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Any special requests or notes?"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            rows={3}
                          />
                        </div>

                        <div className="flex items-center justify-between mb-6">
                          <span className="text-gray-700">Total</span>
                          <span className="font-bold text-lg">
                            ${service.price}
                          </span>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleBooking}
                          disabled={loading || !selectedDate}
                          className={`w-full py-3 rounded-xl font-medium text-white ${
                            loading
                              ? "bg-indigo-400"
                              : !selectedDate
                                ? "bg-gray-400"
                                : "bg-indigo-500"
                          }`}
                        >
                          {loading ? "Processing..." : "Confirm Booking"}
                        </motion.button>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <FiCalendar className="mx-auto text-4xl text-gray-400 mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          No Available Dates
                        </h4>
                        <p className="text-gray-500 mb-6">
                          This service is currently not available for booking.
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowBookingModal(false)}
                          className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-medium"
                        >
                          Close
                        </motion.button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
