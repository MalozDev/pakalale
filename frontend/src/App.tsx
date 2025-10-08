import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";

// Pages
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import CustomerDashboard from "./pages/customer-account/CustomerDashboard";
import ShopDashboard from "./pages/shop-account/ShopDashboard";
import LocationsPage from "./pages/customer-account/LocationsPage";
import LocationDetailPage from "./pages/customer-account/LocationDetailPage";
import VirtualShopPage from "./pages/shop-account/VirtualShopPage";
import DealsListPage from "./pages/customer-account/DealsListPage";
import ChatPage from "./pages/shared-pages/ChatPage";
import NotificationsPage from "./pages/customer-account/NotificationsPage";
import SettingsPage from "./pages/customer-account/SettingsPage";
import ShopSettingsPage from "./pages/shop-account/ShopSettingsPage";
import ProductsPage from "./pages/shop-account/ProductsPage";
import SalesPage from "./pages/shop-account/SalesPage";
import OverviewPage from "./pages/shop-account/OverviewPage";
import OrdersPage from "./pages/shop-account/OrdersPage";
import AnalyticsPage from "./pages/shop-account/AnalyticsPage";
import FeedPage from "./pages/shared-pages/FeedPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Protected Route Component
function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: "customer" | "shop_owner";
}) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    if (user?.role === "customer") {
      return <Navigate to="/customer-dashboard" replace />;
    } else if (user?.role === "shop_owner") {
      return <Navigate to="/shop-dashboard" replace />;
    }
  }

  return <>{children}</>;
}

// Public Route Component (redirect if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on user role
    if (user?.role === "customer") {
      return <Navigate to="/customer-dashboard" replace />;
    } else if (user?.role === "shop_owner") {
      return <Navigate to="/shop-dashboard" replace />;
    }
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/customer-dashboard"
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop-dashboard"
              element={
                <ProtectedRoute requiredRole="shop_owner">
                  <ShopDashboard />
                </ProtectedRoute>
              }
            />
            {/* Shop owner sub-pages */}
            <Route
              path="/shop/overview"
              element={
                <ProtectedRoute requiredRole="shop_owner">
                  <OverviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop/virtual-shop"
              element={
                <ProtectedRoute requiredRole="shop_owner">
                  <VirtualShopPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop/products"
              element={
                <ProtectedRoute requiredRole="shop_owner">
                  <ProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop/orders"
              element={
                <ProtectedRoute requiredRole="shop_owner">
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop/chat"
              element={
                <ProtectedRoute requiredRole="shop_owner">
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop/analytics"
              element={
                <ProtectedRoute requiredRole="shop_owner">
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop/feed"
              element={
                <ProtectedRoute requiredRole="shop_owner">
                  <FeedPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop/sales"
              element={
                <ProtectedRoute requiredRole="shop_owner">
                  <SalesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop/settings"
              element={
                <ProtectedRoute requiredRole="shop_owner">
                  <ShopSettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Location and Shop Routes */}
            <Route
              path="/locations"
              element={
                <ProtectedRoute>
                  <LocationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/location/:locationId"
              element={
                <ProtectedRoute>
                  <LocationDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop/:shopId"
              element={
                <ProtectedRoute>
                  <VirtualShopPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deals"
              element={
                <ProtectedRoute>
                  <DealsListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:dealId"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/chat"
              element={
                <ProtectedRoute requiredRole="customer">
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1e293b",
                color: "#f1f5f9",
                border: "1px solid #475569",
              },
              success: {
                iconTheme: {
                  primary: "#f97316",
                  secondary: "#f1f5f9",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#f1f5f9",
                },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
