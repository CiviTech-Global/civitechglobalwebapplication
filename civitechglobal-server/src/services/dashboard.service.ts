import { prisma } from '../config/database.js';

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
    prisma.user.count(),
    prisma.order.count(),
    prisma.ticket.count(),
    prisma.product.count(),
    prisma.service.count(),
    prisma.opportunity.count(),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.opportunityApplication.count({ where: { status: 'PENDING' } }),
    prisma.ticket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: { select: { firstName: true, lastName: true } } } }),
    prisma.ticket.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: { select: { firstName: true, lastName: true } } } }),
    prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { title: true } }, subcategory: { select: { title: true } } },
    }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { in: ['COMPLETED', 'CONFIRMED', 'IN_PROGRESS'] } } }),
  ]);

  return {
    stats: {
      totalUsers, totalOrders, totalTickets, totalProducts, totalServices, totalOpportunities,
      totalLeads, newLeads,
      pendingApplications, openTickets,
      totalRevenue: revenue._sum.total || 0,
    },
    recentOrders,
    recentTickets,
    recentLeads,
  };
}
