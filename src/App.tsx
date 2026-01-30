import { Routes, Route } from "react-router-dom";
import ClientRegistration from "./components/clientRegistration";
import ServiceDetail from "./components/ServiceDetail";
import ServiceList from "./components/ServiceList";
import ClientBookings from "./components/ClientBooking";
import ProviderOnboarding from "./components/ServiceRegistration";
import Profile from "./components/ProviderProfile";
import ProviderDashboard from "./components/ProviderDashboard";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<ServiceList />} />
        <Route path="/register" element={<ClientRegistration />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/clientbooking" element={<ClientBookings />} />
        <Route path="/provider" element={<ProviderOnboarding />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        {/* Add more routes as needed */}
      </Routes>
    </>
  );
}

export default App;
