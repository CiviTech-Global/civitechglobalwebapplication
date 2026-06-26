export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ApplicationStatus = 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED';
export type OpportunityType = 'JOB' | 'INTERNSHIP';

export interface AdminRole {
  id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  _count?: { users: number };
}

export interface User {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  role: Role;
  permissions?: string[];
  avatar?: string;
  phone?: string;
  adminRoleId?: string;
  adminRole?: AdminRole;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price?: number;
  image?: string;
  category?: string;
  features: string[];
  githubUrl?: string;
  landingPageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  price?: number;
  image?: string;
  category?: string;
  serviceType?: string;
  features: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirements: string[];
  duration: string;
  location: string;
  type: string;
  opportunityType: OpportunityType;
  isOpen: boolean;
  createdAt: string;
}

export interface OpportunityApplication {
  id: string;
  userId: string;
  opportunityId: string;
  coverLetter: string;
  resumeUrl?: string;
  status: ApplicationStatus;
  createdAt: string;
  opportunity?: Opportunity;
  user?: User;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  notes?: string;
  createdAt: string;
  items?: OrderItem[];
  user?: User;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Ticket {
  id: string;
  userId?: string;
  subject: string;
  email: string;
  category?: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  messages?: TicketMessage[];
  user?: User;
  _count?: { messages: number };
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  userId?: string;
  content: string;
  isStaff: boolean;
  createdAt: string;
  user?: { id: string; firstName: string; lastName: string; role: Role };
}

export interface SiteContent {
  id: string;
  key: string;
  value: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  stats: {
    totalUsers: number;
    totalOrders: number;
    totalTickets: number;
    totalProducts: number;
    totalServices: number;
    totalOpportunities: number;
    pendingApplications: number;
    openTickets: number;
    totalRevenue: number;
    totalRoles?: number;
    totalAdmins?: number;
  };
  recentOrders: Order[];
  recentTickets: Ticket[];
}
