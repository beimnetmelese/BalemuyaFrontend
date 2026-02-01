import { useState, useEffect } from "react";
import api from "../api/api";
import webApp from "@twa-dev/sdk";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiDollarSign,
  FiInfo,
  FiCheckCircle,
  FiClock,
  FiLoader,
  FiCheck,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiMapPin,
  FiStar,
} from "react-icons/fi";
import { FaTelegram } from "react-icons/fa";

interface Booking {
  id: number;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  scheduled_date: string;
  notes: string;
  price: string;
  created_at: string;
  customer: {
    id: number;
    telegram_id: string;
    username: string;
    full_name: string;
    phone_number: string;
  };
  service: {
    id: number;
    title: string;
    description: string;
    price: string;
    location: string;
    provider_name: string;
    average_rating: number;
    category?: { id: number; name: string };
    reviews: {
      id: number;
      reviewer_name: string;
      rating: number;
      comment: string;
      created_at: string;
    }[];
  };
}

const statusColors = {
  pending: "bg-amber-100 text-amber-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusIcons = {
  pending: <FiClock className="mr-2" />,
  in_progress: <FiLoader className="mr-2 animate-spin" />,
  completed: <FiCheckCircle className="mr-2" />,
  cancelled: <FiInfo className="mr-2" />,
};
export default function ClientBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<
    "all" | "pending" | "in_progress" | "completed" | "cancelled"
  >("all");
  const [loading, setLoading] = useState(false);
  const [expandedBooking, setExpandedBooking] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  // Review modal state
  const [showReview, setShowReview] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  // Contact modal state
  const [showContact, setShowContact] = useState(false);
  const [contactBooking, setContactBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const telegram_id = webApp.initDataUnsafe?.user?.id?.toString() || "";
      if (!telegram_id) throw new Error("Telegram ID not found");
      const res = await api.get(`/bookings/?telegram_id=${telegram_id}`);
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleComplete = async (bookingId: number) => {
    try {
      await api.patch(`/bookings/${bookingId}/`, {
        status: "completed",
      });
      toast.success("Booking completed successfully!");
      // Find the booking and open review modal
      const booking = bookings.find((b) => b.id === bookingId) || null;
      setReviewBooking(booking);
      setShowReview(true);
      setReviewRating(0);
      setReviewComment("");
      fetchBookings();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update booking");
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewBooking || !reviewRating) return;
    setReviewLoading(true);
    try {
      await api.post(`/services/reviews/`, {
        service: reviewBooking.service.id,
        rating: reviewRating,
        reviewer: reviewBooking.customer.id, // assumes customer.id is user id
        comment: reviewComment,
      });
      toast.success("Thank you for your review!");
      setShowReview(false);
      setReviewBooking(null);
      setReviewRating(0);
      setReviewComment("");
      fetchBookings();
    } catch (err: any) {
      let msg = "Failed to submit review";
      if (err.response && err.response.data) {
        if (typeof err.response.data === "string") {
          msg = err.response.data;
        } else if (typeof err.response.data === "object") {
          msg = Object.values(err.response.data).join(" ");
        }
      }
      toast.error(msg);
    } finally {
      setReviewLoading(false);
    }
  };

  const filteredBookings = bookings.filter(
    (b) => filter === "all" || b.status === filter,
  );

  const toggleBookingExpand = (id: number) => {
    setExpandedBooking(expandedBooking === id ? null : id);
  };

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <FiStar
          key={i}
          className={`${
            i < Math.floor(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          }`}
        />
      ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-4 pb-28">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-8 flex items-center justify-between"
      >
        <div className="flex items-center">
          <FaTelegram className="text-2xl text-indigo-500 mr-2" />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Balemuya Bookings
          </h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-indigo-500 text-white rounded-full text-sm font-medium"
          onClick={() => navigate("/")}
        >
          New Booking
        </motion.button>
      </motion.header>

      <div className="max-w-4xl mx-auto">
        {/* Review Modal */}
        <AnimatePresence>
          {showReview && reviewBooking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-transparent"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
              >
                <h3 className="text-lg font-bold mb-2 text-indigo-700">
                  Rate & Review Service
                </h3>
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={
                        star <= reviewRating
                          ? "text-yellow-400 text-2xl"
                          : "text-gray-300 text-2xl"
                      }
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    >
                      <FiStar />
                    </button>
                  ))}
                </div>
                <textarea
                  className="w-full border rounded-lg p-2 mb-4"
                  rows={3}
                  placeholder="Write your feedback (optional)"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  disabled={reviewLoading}
                />
                <div className="flex gap-2">
                  <button
                    className="flex-1 py-2 rounded-lg bg-indigo-500 text-white font-medium disabled:opacity-60"
                    onClick={handleReviewSubmit}
                    disabled={reviewLoading || !reviewRating}
                  >
                    {reviewLoading ? "Submitting..." : "Submit Review"}
                  </button>
                  <button
                    className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium"
                    onClick={() => setShowReview(false)}
                    disabled={reviewLoading}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Contact Modal */}
        <AnimatePresence>
          {showContact && contactBooking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-transparent"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
              >
                <h3 className="text-lg font-bold mb-4 text-indigo-700">
                  Provider Contact Info
                </h3>
                <div className="mb-4">
                  <div className="font-medium text-gray-900 flex items-center mb-2">
                    <FiUser className="mr-2" />
                    {contactBooking.service.provider_name}
                  </div>
                  <div className="text-gray-700 mb-1">
                    <span className="font-semibold">Phone:</span>{" "}
                    {contactBooking.customer.phone_number || "N/A"}
                  </div>
                  <div className="text-gray-700 mb-1">
                    <span className="font-semibold">Telegram:</span>{" "}
                    {contactBooking.customer.telegram_id || "N/A"}
                  </div>
                  <div className="text-gray-700">
                    <span className="font-semibold">Username:</span>{" "}
                    {contactBooking.customer.username || "N/A"}
                  </div>
                </div>
                <button
                  className="w-full py-2 rounded-lg bg-indigo-500 text-white font-medium mt-2"
                  onClick={() => setShowContact(false)}
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Filter Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm p-4 mb-6"
        >
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center">
              <FiFilter className="mr-2 text-indigo-500" />
              <span className="font-medium">Filter Bookings</span>
            </div>
            {showFilters ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    "all",
                    "pending",
                    "in_progress",
                    "completed",
                    "cancelled",
                  ].map((status) => (
                    <motion.button
                      key={status}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setFilter(status as any)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        filter === status
                          ? "bg-indigo-500 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {status.replace("_", " ")}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm p-4"
                >
                  <div className="animate-pulse space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </motion.div>
              ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-sm p-8 text-center"
          >
            <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <FiCalendar className="text-3xl text-indigo-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-500 mb-4">
              {filter === "all"
                ? "You don't have any bookings yet."
                : `You don't have any ${filter.replace("_", " ")} bookings.`}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 bg-indigo-500 text-white rounded-lg"
            >
              Book a Service
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredBookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => toggleBookingExpand(booking.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-lg truncate">
                            {booking.service.title}
                          </h3>
                          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {booking.service.category?.name || "General"}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full ${
                              statusColors[booking.status]
                            }`}
                          >
                            {statusIcons[booking.status]}
                            {booking.status.replace("_", " ")}
                          </span>

                          <div className="flex items-center text-sm text-gray-500">
                            <FiCalendar className="mr-1.5 flex-shrink-0" />
                            <span className="whitespace-nowrap">
                              {new Date(
                                booking.scheduled_date,
                              ).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="mx-1">•</span>
                            <span className="whitespace-nowrap">
                              {new Date(
                                booking.scheduled_date,
                              ).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div className="flex items-center text-sm text-gray-500">
                            <FiUser className="mr-1.5 flex-shrink-0" />
                            <span className="truncate">
                              {booking.service.provider_name}
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-indigo-500 flex items-center">
                          <FiChevronDown className="mr-1 animate-bounce" />
                          Press for more details
                        </p>
                      </div>

                      <div className="ml-4 text-right">
                        <p className="text-lg font-bold text-indigo-600 whitespace-nowrap">
                          {parseFloat(booking.price).toLocaleString()} ETB
                        </p>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedBooking === booking.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t">
                          {/* Service Details */}
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-900 mb-2">
                              Service Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">
                                  Provider
                                </p>
                                <p className="font-medium flex items-center">
                                  <FiUser className="mr-2" />
                                  {booking.service.provider_name}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  Location
                                </p>
                                <p className="font-medium flex items-center">
                                  <FiMapPin className="mr-2" />
                                  {booking.service.location}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Rating</p>
                                <div className="flex items-center">
                                  {renderStars(booking.service.average_rating)}
                                  <span className="ml-2 text-sm text-gray-500">
                                    ({booking.service.average_rating.toFixed(1)}
                                    )
                                  </span>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  Service Price
                                </p>
                                <p className="font-medium flex items-center">
                                  <FiDollarSign className="mr-2" />
                                  {parseFloat(
                                    booking.service.price,
                                  ).toLocaleString()}{" "}
                                  ETB
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Booking Details */}
                          <div className="mt-6">
                            <h4 className="font-medium text-gray-900 mb-2">
                              Booking Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">
                                  Booked On
                                </p>
                                <p className="font-medium">
                                  {new Date(
                                    booking.created_at,
                                  ).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  Scheduled For
                                </p>
                                <p className="font-medium">
                                  {new Date(
                                    booking.scheduled_date,
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Customer Notes */}
                          {booking.notes && (
                            <div className="mt-6">
                              <h4 className="font-medium text-gray-900 mb-2">
                                Your Notes
                              </h4>
                              <div className="bg-indigo-50 rounded-lg p-3">
                                <p className="text-indigo-800">
                                  {booking.notes}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {booking.status === "in_progress" && (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleComplete(booking.id)}
                                className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium flex items-center justify-center"
                              >
                                <FiCheck className="mr-2" />
                                Mark as Completed
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full py-2 bg-indigo-500 text-white rounded-lg font-medium"
                              onClick={() => {
                                setContactBooking(booking);
                                setShowContact(true);
                              }}
                            >
                              Contact Provider
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Status Legend */}
    </div>
  );
}
