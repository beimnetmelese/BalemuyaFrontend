import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiMapPin, FiStar, FiFilter, FiX } from "react-icons/fi";
import { FaTelegram } from "react-icons/fa";

interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  category?: { id: number; name: string };
  tags?: string[];
  average_rating: number;
  available: boolean;
  image?: string;
}

export default function ServiceList() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    minRating: 0,
    minPrice: 0,
    maxPrice: Infinity,
    category: "",
    availableOnly: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log("[ServiceList] Fetching services...", { search });
        setLoading(true);
        const res = await api.get("/services/", {
          params: { search }, // Send search term to backend
        });
        console.log("[ServiceList] Response from /services/:", res);
        // Defensive: ensure data is an array
        if (Array.isArray(res.data)) {
          setServices(res.data);
        } else if (Array.isArray(res.data?.results)) {
          setServices(res.data.results);
        } else {
          setServices([]);
          setError(
            typeof res.data === "object" && res.data !== null && res.data.detail
              ? res.data.detail
              : "Unexpected response from server.",
          );
        }
      } catch (err: any) {
        console.error("[ServiceList] Error fetching services:", err);
        // Add error UI state
        setError(
          err?.response?.data?.detail ||
            err?.message ||
            "Failed to load services. Please try again later.",
        );
      } finally {
        setLoading(false);
      }
    };

    // Debounce search requests
    const delayDebounce = setTimeout(() => {
      fetchServices();
    }, 400); // adjust delay as needed

    return () => clearTimeout(delayDebounce);
  }, [search]);

  // Apply filters
  useEffect(() => {
    const filtered = services.filter((service) => {
      const matchesLocation =
        filters.location === "" ||
        service.location.toLowerCase().includes(filters.location.toLowerCase());

      const matchesRating = service.average_rating >= filters.minRating;
      const matchesPrice =
        service.price >= filters.minPrice && service.price <= filters.maxPrice;
      const matchesAvailability = !filters.availableOnly || service.available;

      return (
        matchesLocation && matchesRating && matchesPrice && matchesAvailability
      );
    });

    setFiltered(filtered.sort((a, b) => b.average_rating - a.average_rating));
  }, [filters, services]);

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

  const resetFilters = () => {
    setFilters({
      location: "",
      minRating: 0,
      minPrice: 0,
      maxPrice: Infinity,
      category: "",
      availableOnly: false,
    });
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-4 pb-20">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaTelegram className="text-3xl text-indigo-500" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Balemuya
            </h1>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-indigo-500 text-white rounded-full text-sm font-medium"
            onClick={() => navigate("/clientbooking")}
          >
            My Bookings
          </motion.button>
        </div>
      </motion.header>

      {/* Search and Filters */}
      <div className="max-w-6xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Find services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl shadow-sm border-none focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-indigo-100 text-indigo-600 p-2 rounded-lg"
          >
            <FiFilter />
          </motion.button>
        </motion.div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Filters</h3>
                  <button
                    onClick={resetFilters}
                    className="text-sm text-indigo-600"
                  >
                    Reset all
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Any location"
                        value={filters.location}
                        onChange={(e) =>
                          setFilters({ ...filters, location: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <div className="flex space-x-2">
                      {[0, 1, 2, 3, 4].map((rating) => (
                        <motion.button
                          key={rating}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            setFilters({ ...filters, minRating: rating })
                          }
                          className={`flex items-center px-3 py-1 rounded-full text-sm ${
                            filters.minRating === rating
                              ? "bg-indigo-500 text-white"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {rating === 0 ? "Any" : `${rating}+`}
                          {rating > 0 && <FiStar className="ml-1" />}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Price
                      </label>
                      <input
                        type="number"
                        placeholder="$0"
                        value={filters.minPrice}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            minPrice: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Price
                      </label>
                      <input
                        type="number"
                        placeholder="No limit"
                        value={
                          filters.maxPrice === Infinity ? "" : filters.maxPrice
                        }
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            maxPrice:
                              e.target.value === ""
                                ? Infinity
                                : Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="availableOnly"
                      checked={filters.availableOnly}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          availableOnly: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="availableOnly"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Available only
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Services Grid */}
      <div className="max-w-6xl mx-auto">
        {error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <FiX className="text-3xl text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-red-700">{error}</h3>
            <button
              onClick={() => {
                setError(null);
                setSearch("");
                setFilters({
                  location: "",
                  minRating: 0,
                  minPrice: 0,
                  maxPrice: Infinity,
                  category: "",
                  availableOnly: false,
                });
              }}
              className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-full text-sm font-medium"
            >
              Try Again
            </button>
          </motion.div>
        ) : loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <div className="animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <FiX className="text-3xl text-indigo-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No services found
            </h3>
            <p className="mt-2 text-gray-500">
              Try adjusting your search or filters
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-full text-sm font-medium"
            >
              Reset filters
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filtered.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    delay: i * 0.05,
                    type: "spring",
                    stiffness: 100,
                  }}
                  layout
                >
                  <Link to={`/services/${service.id}`}>
                    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                      <div className="relative h-48 overflow-hidden">
                        <motion.img
                          src={
                            service.image ||
                            `https://source.unsplash.com/random/400x300/?${
                              service.category?.name || "service"
                            }`
                          }
                          alt={service.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.05 }}
                        />
                        {!service.available && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            Unavailable
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-grow">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                            {service.title}
                          </h3>
                          <p className="text-indigo-600 font-bold whitespace-nowrap ml-2">
                            ${service.price}
                          </p>
                        </div>
                        {service.category && (
                          <p className="text-sm text-indigo-500 mt-1">
                            {service.category.name}
                          </p>
                        )}
                        <div className="flex items-center mt-2">
                          <div className="flex mr-2">
                            {renderStars(service.average_rating)}
                          </div>
                          <span className="text-sm text-gray-500">
                            ({service.average_rating.toFixed(1)})
                          </span>
                        </div>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <FiMapPin className="mr-1" />
                          <span className="truncate">{service.location}</span>
                        </div>
                      </div>
                      <div className="px-4 pb-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium"
                        >
                          Book Now
                        </motion.button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 right-6"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowFilters(!showFilters)}
          className="p-4 bg-indigo-500 text-white rounded-full shadow-lg"
        >
          <FiFilter className="text-xl" />
        </motion.button>
      </motion.div>
    </div>
  );
}
