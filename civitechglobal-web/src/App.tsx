import { BrowserRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LocaleProvider } from './contexts/LocaleContext';
import { ToastProvider } from './components/ui/Toast';
import { PublicLayout } from './components/layout/PublicLayout';
import { UserLayout } from './components/layout/UserLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import ProductsPage from './pages/public/ProductsPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import ServicesPage from './pages/public/ServicesPage';
import ServiceDetailPage from './pages/public/ServiceDetailPage';
import OpportunitiesPage from './pages/public/OpportunitiesPage';
import OpportunityDetailPage from './pages/public/OpportunityDetailPage';
import AboutPage from './pages/public/AboutPage';
import SupportPage from './pages/public/SupportPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import NotFoundPage from './pages/public/NotFoundPage';

// User Dashboard Pages
import UserDashboard from './pages/dashboard/DashboardPage';
import UserOrders from './pages/dashboard/OrdersPage';
import UserOrderDetail from './pages/dashboard/OrderDetailPage';
import UserTickets from './pages/dashboard/TicketsPage';
import UserTicketDetail from './pages/dashboard/TicketDetailPage';
import UserOpportunities from './pages/dashboard/OpportunitiesPage';
import ProfilePage from './pages/dashboard/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/DashboardPage';
import AdminProducts from './pages/admin/ProductsPage';
import AdminProductForm from './pages/admin/ProductFormPage';
import AdminServices from './pages/admin/ServicesPage';
import AdminServiceForm from './pages/admin/ServiceFormPage';
import AdminOpportunities from './pages/admin/OpportunitiesPage';
import AdminOpportunityForm from './pages/admin/OpportunityFormPage';
import AdminApplications from './pages/admin/ApplicationsPage';
import AdminOrders from './pages/admin/OrdersPage';
import AdminOrderDetail from './pages/admin/OrderDetailPage';
import AdminTickets from './pages/admin/TicketsPage';
import AdminTicketDetail from './pages/admin/TicketDetailPage';
import AdminUsers from './pages/admin/UsersPage';
import AdminUserDetail from './pages/admin/UserDetailPage';
import AdminContent from './pages/admin/ContentPage';
import AdminPermissions from './pages/admin/PermissionsPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route element={<PublicLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="products/:slug" element={<ProductDetailPage />} />
                    <Route path="services" element={<ServicesPage />} />
                    <Route path="services/:slug" element={<ServiceDetailPage />} />
                    <Route path="opportunities" element={<OpportunitiesPage />} />
                    <Route path="opportunities/:slug" element={<OpportunityDetailPage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="support" element={<SupportPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                  </Route>

                  {/* User Dashboard Routes */}
                  <Route path="dashboard" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
                    <Route index element={<UserDashboard />} />
                    <Route path="orders" element={<UserOrders />} />
                    <Route path="orders/:id" element={<UserOrderDetail />} />
                    <Route path="tickets" element={<UserTickets />} />
                    <Route path="tickets/:id" element={<UserTicketDetail />} />
                    <Route path="opportunities" element={<UserOpportunities />} />
                    <Route path="profile" element={<ProfilePage />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route path="admin" element={<ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}><AdminLayout /></ProtectedRoute>}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<AdminProductForm />} />
                    <Route path="products/:id/edit" element={<AdminProductForm />} />
                    <Route path="services" element={<AdminServices />} />
                    <Route path="services/new" element={<AdminServiceForm />} />
                    <Route path="services/:id/edit" element={<AdminServiceForm />} />
                    <Route path="opportunities" element={<AdminOpportunities />} />
                    <Route path="opportunities/new" element={<AdminOpportunityForm />} />
                    <Route path="opportunities/:id/edit" element={<AdminOpportunityForm />} />
                    <Route path="opportunities/applications" element={<AdminApplications />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="orders/:id" element={<AdminOrderDetail />} />
                    <Route path="tickets" element={<AdminTickets />} />
                    <Route path="tickets/:id" element={<AdminTicketDetail />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="users/:id" element={<AdminUserDetail />} />
                    <Route path="content" element={<AdminContent />} />
                    <Route path="permissions" element={<AdminPermissions />} />
                  </Route>

                  {/* 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </BrowserRouter>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}

export default App;
