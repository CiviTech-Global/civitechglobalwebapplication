import { decryptUser, decryptTicket, decryptLead } from '../utils/piiTransform.js';
import { userRepository } from '../database/prisma/repositories/user.repository.js';
import { orderRepository } from '../database/prisma/repositories/order.repository.js';
import { ticketRepository } from '../database/prisma/repositories/ticket.repository.js';
import { productRepository } from '../database/prisma/repositories/product.repository.js';
import { serviceRepository } from '../database/prisma/repositories/service.repository.js';
import { opportunityRepository } from '../database/prisma/repositories/opportunity.repository.js';
import { opportunityApplicationRepository } from '../database/prisma/repositories/opportunity.repository.js';
import { leadRepository } from '../database/prisma/repositories/lead.repository.js';

export async function getAdminDashboard() {
  const [
    totalUsers,
    totalOrders,
    totalTickets,
    totalProducts,
    totalServices,
    totalOpportunities,
    totalLeads,
    newLeads,
    pendingApplications,
    openTickets,
    recentOrders,
    recentTickets,
    recentLeads,
    revenue,
  ] = await Promise.all([
    userRepository.count(),
    orderRepository.count(),
    ticketRepository.count(),
    productRepository.count(),
    serviceRepository.count(),
    opportunityRepository.count(),
    leadRepository.count(),
    leadRepository.count({ where: { status: 'NEW' } }),
    opportunityApplicationRepository.count({ where: { status: 'PENDING' } }),
    ticketRepository.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    orderRepository.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true } } },
    }),
    ticketRepository.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true } } },
    }),
    leadRepository.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { title: true } }, subcategory: { select: { title: true } } },
    }),
    orderRepository.aggregate({
      _sum: { total: true },
      where: { status: { in: ['COMPLETED', 'CONFIRMED', 'IN_PROGRESS'] } },
    }),
  ]);

  return {
    stats: {
      totalUsers,
      totalOrders,
      totalTickets,
      totalProducts,
      totalServices,
      totalOpportunities,
      totalLeads,
      newLeads,
      pendingApplications,
      openTickets,
      totalRevenue: revenue._sum.total || 0,
    },
    recentOrders: recentOrders.map((o) => ({
      ...o,
      user: o.user ? decryptUser(o.user) : null,
    })),
    recentTickets: recentTickets.map((t) => ({
      ...decryptTicket(t),
      user: t.user ? decryptUser(t.user) : null,
    })),
    recentLeads: recentLeads.map((l) => decryptLead(l)),
  };
}
