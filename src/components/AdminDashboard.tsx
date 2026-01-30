import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTrendingUp,
  FiDollarSign,
  FiUsers,
  FiShoppingCart,
  FiCalendar,
  FiPieChart,
  FiRefreshCw,
  FiBox,
  FiStar,
  FiCreditCard,
  FiUserCheck,
  FiActivity,
} from "react-icons/fi";
import { FaTelegram } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import api from "../api/api";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// TypeScript interfaces based on your Django viewset
interface DateRange {
  from: string;
  to: string;
}

interface SummaryData {
  range: DateRange;
  transactions: {
    gross_revenue: string;
    platform_profit: string;
    providers_take: string;
    count: number;
  };
  bookings: {
    total: number;
    status_counts: Record<string, number>;
  };
  users: {
    new_users: number;
    total_users: number;
  };
}

interface TimeSeriesItem {
  bucket: string;
  gross: string;
  platform_profit: string;
  providers_take: string;
}

interface TimeSeriesData {
  range: DateRange;
  granularity: string;
  series: TimeSeriesItem[];
}

interface TopItem {
  provider_id?: string;
  provider_name?: string;
  service_id?: string;
  service_title?: string;
  revenue: string;
  transactions: number;
}

interface TopData {
  range: DateRange;
  by: string;
  items: TopItem[];
}

const AdminDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData | null>(
    null
  );
  const [topData, setTopData] = useState<TopData>({
    range: { from: "", to: "" },
    by: "providers",
    items: [],
  });
  const [granularity, setGranularity] = useState<string>("day");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeMetric, setActiveMetric] = useState<string>("revenue");

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const { from, to } = dateRange;

      // Fetch summary data
      const { data: summary } = await api.get<SummaryData>(`/admin/summary/`, {
        params: { from, to },
      });
      setSummaryData(summary);

      // Fetch time series data
      const { data: timeSeries } = await api.get<TimeSeriesData>(
        `/admin/timeseries/`,
        { params: { from, to, granularity } }
      );
      setTimeSeriesData(timeSeries);

      // Fetch top data
      const { data: top } = await api.get<TopData>(`/admin/top/`, {
        params: { from, to, by: topData.by, limit: 5 },
      });
      setTopData(top);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, granularity, topData.by]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const handleGranularityChange = (value: string) => {
    setGranularity(value);
  };

  const handleTopByChange = (value: string) => {
    setTopData((prev) => ({ ...prev, by: value }));
  };

  // Format currency values
  const formatCurrency = (value: string | number): string => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  // Format numbers with commas
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  // Prepare chart data for time series
  const timeSeriesChartData = {
    labels:
      timeSeriesData?.series.map((item) => {
        const date = new Date(item.bucket);
        return granularity === "day"
          ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : granularity === "week"
          ? `Week ${Math.ceil(date.getDate() / 7)}`
          : date.toLocaleDateString("en-US", { month: "short" });
      }) || [],
    datasets: [
      {
        label: "Gross Revenue",
        data:
          timeSeriesData?.series.map((item) => parseFloat(item.gross)) || [],
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Platform Profit",
        data:
          timeSeriesData?.series.map((item) =>
            parseFloat(item.platform_profit)
          ) || [],
        borderColor: "rgb(236, 72, 153)",
        backgroundColor: "rgba(236, 72, 153, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Prepare chart data for top items
  const topItemsChartData = {
    labels: topData.items.map((item) =>
      topData.by === "providers" ? item.provider_name : item.service_title
    ),
    datasets: [
      {
        label: "Revenue",
        data: topData.items.map((item) => parseFloat(item.revenue)),
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(249, 115, 22, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(59, 130, 246, 0.8)",
        ],
        borderColor: [
          "rgb(99, 102, 241)",
          "rgb(236, 72, 153)",
          "rgb(249, 115, 22)",
          "rgb(16, 185, 129)",
          "rgb(59, 130, 246)",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Revenue distribution chart data
  const revenueDistributionData = {
    labels: ["Platform Profit", "Providers Take"],
    datasets: [
      {
        data: [
          summaryData
            ? parseFloat(summaryData.transactions.platform_profit)
            : 0,
          summaryData ? parseFloat(summaryData.transactions.providers_take) : 0,
        ],
        backgroundColor: ["rgba(236, 72, 153, 0.8)", "rgba(99, 102, 241, 0.8)"],
        borderColor: ["rgb(236, 72, 153)", "rgb(99, 102, 241)"],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    maintainAspectRatio: false,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-gray-600"
        >
          Loading dashboard data...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaTelegram className="text-indigo-600 mr-2" />
              Balemuya Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {summaryData && (
                <>
                  Data from{" "}
                  {new Date(summaryData.range.from).toLocaleDateString()} to{" "}
                  {new Date(summaryData.range.to).toLocaleDateString()}
                </>
              )}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium"
          >
            <FiRefreshCw className="h-4 w-4" />
            Refresh
          </motion.button>
        </div>
      </motion.header>

      {/* Date Range Selector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm p-6 mb-8"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="date"
                  name="from"
                  value={dateRange.from}
                  onChange={handleDateChange}
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="date"
                  name="to"
                  value={dateRange.to}
                  onChange={handleDateChange}
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            {["day", "week", "month", "year"].map((period) => (
              <motion.button
                key={period}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleGranularityChange(period)}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${
                  granularity === period
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            icon: FiDollarSign,
            label: "Gross Revenue",
            value: summaryData?.transactions.gross_revenue,
            format: formatCurrency,
            color: "indigo",
            change: "+12.3%",
          },
          {
            icon: FiTrendingUp,
            label: "Platform Profit",
            value: summaryData?.transactions.platform_profit,
            format: formatCurrency,
            color: "green",
            change: "+8.5%",
          },
          {
            icon: FiUsers,
            label: "New Users",
            value: summaryData?.users.new_users,
            format: formatNumber,
            color: "blue",
            change: "+5.2%",
          },
          {
            icon: FiShoppingCart,
            label: "Transactions",
            value: summaryData?.transactions.count,
            format: formatNumber,
            color: "purple",
            change: "+15.7%",
          },
        ].map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {card.value !== undefined
                    ? card.format(Number(card.value))
                    : "--"}
                </p>
                <p className="text-xs text-green-500 mt-1 flex items-center">
                  <FiTrendingUp className="mr-1" />
                  {card.change}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-${card.color}-100`}>
                <card.icon className={`h-6 w-6 text-${card.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Revenue Overview
            </h2>
            <div className="flex gap-2 mt-2 sm:mt-0">
              {["revenue", "profit", "users"].map((metric) => (
                <button
                  key={metric}
                  onClick={() => setActiveMetric(metric)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    activeMetric === metric
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80">
            <Line data={timeSeriesChartData} options={chartOptions} />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {summaryData
                  ? formatCurrency(summaryData.transactions.gross_revenue)
                  : "$0.00"}
              </p>
              <p className="text-sm text-gray-500">Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {summaryData
                  ? formatCurrency(summaryData.transactions.platform_profit)
                  : "$0.00"}
              </p>
              <p className="text-sm text-gray-500">Platform Profit</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {summaryData
                  ? formatCurrency(summaryData.transactions.providers_take)
                  : "$0.00"}
              </p>
              <p className="text-sm text-gray-500">Providers Take</p>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Two smaller charts */}
        <div className="grid grid-cols-1 gap-8">
          {/* Revenue Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Revenue Distribution
            </h2>
            <div className="h-64">
              <Doughnut
                data={revenueDistributionData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          return `${context.label}: ${formatCurrency(
                            context.raw as number
                          )}`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </motion.div>

          {/* Top Performers */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Top Performers
              </h2>
              <div className="flex gap-1">
                <button
                  onClick={() => handleTopByChange("providers")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    topData.by === "providers"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Providers
                </button>
                <button
                  onClick={() => handleTopByChange("services")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    topData.by === "services"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Services
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {topData.items.length > 0 ? (
                topData.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-indigo-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {topData.by === "providers"
                            ? item.provider_name
                            : item.service_title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.transactions} transactions
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-indigo-600">
                      {formatCurrency(item.revenue)}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiBox className="mx-auto h-8 w-8 mb-2" />
                  <p>No data available</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* User Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-sm p-6 mt-8"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Platform Statistics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-indigo-50 rounded-xl">
            <FiUsers className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {summaryData?.users.total_users || 0}
            </p>
            <p className="text-sm text-gray-600">Total Users</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-xl">
            <FiUserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {summaryData?.users.new_users || 0}
            </p>
            <p className="text-sm text-gray-600">New Users</p>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <FiShoppingCart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {summaryData?.bookings.total || 0}
            </p>
            <p className="text-sm text-gray-600">Total Bookings</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <FiCreditCard className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {summaryData?.transactions.count || 0}
            </p>
            <p className="text-sm text-gray-600">Transactions</p>
          </div>
        </div>

        {/* Booking Status Overview */}
        <div className="mt-8">
          <h3 className="text-md font-medium text-gray-900 mb-4">
            Booking Status Distribution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summaryData?.bookings.status_counts ? (
              Object.entries(summaryData.bookings.status_counts).map(
                ([status, count]) => (
                  <div key={status} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {status}
                    </p>
                    <p className="text-lg font-bold text-indigo-600">{count}</p>
                  </div>
                )
              )
            ) : (
              <p className="text-gray-500">No booking data available</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 text-center text-sm text-gray-500"
      >
        <p>
          Balemuya Admin Dashboard • {new Date().getFullYear()} • Data updates
          automatically
        </p>
      </motion.footer>
    </div>
  );
};

export default AdminDashboard;
