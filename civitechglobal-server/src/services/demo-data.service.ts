import { prisma } from '../config/database.js';
import { hashPassword } from '../utils/password.js';

const DEMO_EMAIL_DOMAIN = '@demo.civitechglobal.com';
const DEMO_TAG = '[DEMO]';

const DEMO_USERS = [
  { email: 'alice@demo.civitechglobal.com', username: 'demo_alice', firstName: 'Alice', lastName: 'Johnson', role: 'USER' as const },
  { email: 'bob@demo.civitechglobal.com', username: 'demo_bob', firstName: 'Bob', lastName: 'Williams', role: 'USER' as const },
  { email: 'carol@demo.civitechglobal.com', username: 'demo_carol', firstName: 'Carol', lastName: 'Martinez', role: 'USER' as const },
  { email: 'dave@demo.civitechglobal.com', username: 'demo_dave', firstName: 'Dave', lastName: 'Brown', role: 'ADMIN' as const },
  { email: 'eve@demo.civitechglobal.com', username: 'demo_eve', firstName: 'Eve', lastName: 'Davis', role: 'USER' as const },
];

const DEMO_PRODUCTS = [
  {
    name: 'Jarvis', slug: 'jarvis', category: 'AI',
    description: `${DEMO_TAG} Jarvis is an AI-powered smart assistant that helps organizations automate their daily processes.`,
    features: ['Natural language processing', 'Task automation', 'Tool integration', 'Continuous learning', 'Smart chatbot'],
    image: '/images/products/jarvis.jpg',
    githubUrl: 'https://github.com/CiviTech-Global/Jarvis-landing-page',
    landingPageUrl: 'https://civitech-global.github.io/Jarvis-landing-page/',
  },
  {
    name: 'TradeMaster', slug: 'trade-master', category: 'Commerce',
    description: `${DEMO_TAG} TradeMaster is an intelligent trade and transaction management system.`,
    features: ['Transaction management', 'Inventory tracking', 'Market analysis', 'Financial reports', 'Order automation'],
    image: '/images/products/trade-master.jpg',
    githubUrl: 'https://github.com/CiviTech-Global/TradeMaster',
    landingPageUrl: 'https://civitech-global.github.io/TradeMaster-landing-page/',
  },
  {
    name: 'TrustMaven', slug: 'trust-maven', category: 'Platform',
    description: `${DEMO_TAG} TrustMaven is a trust management and digital credential verification platform.`,
    features: ['Multi-layer authentication', 'Trust scoring', 'Analytics dashboard', 'Integration API', 'Advanced reporting'],
    image: '/images/products/trust-maven.jpg',
    githubUrl: 'https://github.com/CiviTech-Global/trust-maven',
    landingPageUrl: 'https://civitech-global.github.io/trust-maven-landing-page/',
  },
  {
    name: 'People Square', slug: 'people-square', category: 'HR',
    description: `${DEMO_TAG} People Square is a human resources management and organizational communication platform.`,
    features: ['Recruitment management', 'Performance evaluation', 'Employee portal', 'HR reports', 'Calendar integration'],
    image: '/images/products/people-square.jpg',
    githubUrl: 'https://github.com/CiviTech-Global/people-square',
  },
  {
    name: 'University Nutrition System', slug: 'university-nutrition-system', category: 'Education',
    description: `${DEMO_TAG} A comprehensive food reservation and distribution management system for universities.`,
    features: ['Online food reservation', 'Weekly menu management', 'Digital wallet', 'Statistical reports', 'Mobile application'],
    image: '/images/products/nutrition-system.jpg',
    githubUrl: 'https://github.com/CiviTech-Global/university-nutrition-system',
  },
  {
    name: 'Smart Waste Management', slug: 'smart-waste-management', category: 'Smart City',
    description: `${DEMO_TAG} An IoT-based system for optimizing urban waste collection and management.`,
    features: ['IoT sensors', 'Smart routing', 'Real-time dashboard', 'Predictive analysis', 'Environmental reports'],
    image: '/images/products/waste-management.jpg',
    githubUrl: 'https://github.com/CiviTech-Global/smart-waste-management',
  },
  {
    name: 'Chekker', slug: 'chekker', category: 'Quality Assurance',
    description: `${DEMO_TAG} Chekker is an upcoming intelligent verification and quality assurance platform.`,
    features: ['Automated testing', 'Quality metrics', 'CI/CD integration', 'Reporting dashboard', 'Team collaboration'],
    image: '/images/products/chekker.jpg',
    isActive: false,
  },
];

const DEMO_SERVICES = [
  {
    name: 'Freelancers Center', slug: 'freelancers-center', category: 'Marketplace', serviceType: 'FREELANCERS_CENTER',
    description: `${DEMO_TAG} A comprehensive platform connecting businesses with skilled freelance professionals.`,
    features: ['Verified professionals', 'Project matching', 'Secure payments', 'Real-time collaboration', 'Review system', 'Portfolio showcase'],
    image: '/images/services/freelancers.jpg',
  },
  {
    name: 'Insurance Marketplace', slug: 'insurance-marketplace', category: 'Insurance', serviceType: 'INSURANCE_MARKETPLACE',
    description: `${DEMO_TAG} A comprehensive platform for comparing and purchasing various insurance policies online.`,
    features: ['Compare insurance policies', 'Online purchase', 'Expert consultation', 'Policy management', 'Online claims', '24/7 support'],
    image: '/images/services/insurance.jpg',
  },
];

const DEMO_OPPORTUNITIES = [
  {
    title: 'Demo Frontend Developer', slug: 'demo-frontend-developer',
    description: `${DEMO_TAG} Join our frontend team and build modern web applications with React and TypeScript.`,
    requirements: ['React/TypeScript experience', 'HTML/CSS proficiency', 'Git basics'],
    duration: '3 months', location: 'Remote', type: 'Remote', opportunityType: 'INTERNSHIP' as const,
  },
  {
    title: 'Demo Backend Engineer', slug: 'demo-backend-engineer',
    description: `${DEMO_TAG} Work with our backend team on Node.js/Express APIs and PostgreSQL databases.`,
    requirements: ['Node.js/Express experience', 'SQL proficiency', 'REST API concepts'],
    duration: 'Full-time', location: 'Remote', type: 'Remote', opportunityType: 'JOB' as const,
  },
  {
    title: 'Demo UI/UX Designer', slug: 'demo-ui-ux-designer',
    description: `${DEMO_TAG} Help design visual user interfaces for civic technology platforms.`,
    requirements: ['Figma proficiency', 'UI/UX design principles', 'Design portfolio'],
    duration: '3 months', location: 'Hybrid', type: 'Hybrid', opportunityType: 'INTERNSHIP' as const,
  },
  {
    title: 'Demo DevOps Engineer', slug: 'demo-devops-engineer',
    description: `${DEMO_TAG} Manage cloud infrastructure, CI/CD pipelines, and deployment automation.`,
    requirements: ['AWS or Azure experience', 'Docker & Kubernetes', 'Terraform'],
    duration: 'Full-time', location: 'Remote', type: 'Remote', opportunityType: 'JOB' as const,
  },
];

export async function seedDemoData() {
  // Check if demo data already exists
  const existingDemoUsers = await prisma.user.count({
    where: { email: { endsWith: DEMO_EMAIL_DOMAIN } },
  });
  if (existingDemoUsers > 0) {
    return { message: 'Demo data already exists. Clear it first before re-seeding.', seeded: false };
  }

  const hashedPassword = await hashPassword('DemoUser@123');

  const result = await prisma.$transaction(async (tx) => {
    // 1. Seed demo users
    const users = await Promise.all(
      DEMO_USERS.map((u) =>
        tx.user.create({
          data: { ...u, password: hashedPassword },
        }),
      ),
    );

    // 2. Seed demo products (only if none exist)
    const existingProductCount = await tx.product.count();
    let products: { id: string; price: number | null }[] = [];
    if (existingProductCount === 0) {
      products = await Promise.all(
        DEMO_PRODUCTS.map((p) => tx.product.create({ data: p })),
      );
    }

    // 3. Seed demo services (only if none exist)
    const existingServiceCount = await tx.service.count();
    let services: { id: string }[] = [];
    if (existingServiceCount === 0) {
      services = await Promise.all(
        DEMO_SERVICES.map((s) => tx.service.create({ data: s })),
      );
    }

    // 4. Seed demo opportunities
    const opportunities = await Promise.all(
      DEMO_OPPORTUNITIES.map((o) => tx.opportunity.create({ data: o })),
    );

    // 5. Seed demo orders (need products to exist)
    const allProducts = products.length > 0
      ? products
      : await tx.product.findMany({ select: { id: true, price: true }, take: 7 });

    const demoUserIds = users.filter((u) => u.role === 'USER').map((u) => u.id);
    const orderStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
    const orders: { id: string }[] = [];

    for (let i = 0; i < 7; i++) {
      const userId = demoUserIds[i % demoUserIds.length];
      const product = allProducts[i % allProducts.length];
      const price = product.price ?? 0;
      const status = orderStatuses[i % orderStatuses.length];

      const order = await tx.order.create({
        data: {
          userId,
          status,
          total: price,
          notes: `${DEMO_TAG} Demo order #${i + 1}`,
          items: {
            create: [{ productId: product.id, quantity: 1, price }],
          },
        },
      });
      orders.push(order);
    }

    // 6. Seed demo tickets
    const ticketPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
    const ticketStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;
    const ticketSubjects = [
      'Question about product integration',
      'Billing inquiry for subscription',
      'Feature request for dashboard',
      'Bug report on login page',
      'Partnership collaboration proposal',
      'API documentation clarification',
    ];

    const tickets: { id: string }[] = [];
    for (let i = 0; i < 6; i++) {
      const userId = demoUserIds[i % demoUserIds.length];
      const demoUser = users.find((u) => u.id === userId)!;
      const ticket = await tx.ticket.create({
        data: {
          userId,
          subject: `${DEMO_TAG} ${ticketSubjects[i]}`,
          email: demoUser.email,
          category: i % 2 === 0 ? 'SUPPORT' : 'SALES',
          status: ticketStatuses[i % ticketStatuses.length],
          priority: ticketPriorities[i % ticketPriorities.length],
        },
      });
      tickets.push(ticket);
    }

    return {
      users: users.length,
      products: products.length,
      services: services.length,
      opportunities: opportunities.length,
      orders: orders.length,
      tickets: tickets.length,
    };
  });

  return {
    message: 'Demo data seeded successfully',
    seeded: true,
    counts: result,
  };
}

export async function clearDemoData() {
  const result = await prisma.$transaction(async (tx) => {
    // Get demo user IDs for cascading cleanup
    const demoUsers = await tx.user.findMany({
      where: { email: { endsWith: DEMO_EMAIL_DOMAIN } },
      select: { id: true },
    });
    const demoUserIds = demoUsers.map((u) => u.id);

    // Delete orders with [DEMO] notes (order items cascade)
    const deletedOrders = await tx.order.deleteMany({
      where: { notes: { contains: DEMO_TAG } },
    });

    // Delete tickets with [DEMO] subject (messages cascade)
    const deletedTickets = await tx.ticket.deleteMany({
      where: { subject: { contains: DEMO_TAG } },
    });

    // Delete opportunity applications from demo users
    const deletedApplications = await tx.opportunityApplication.deleteMany({
      where: { userId: { in: demoUserIds } },
    });

    // Delete opportunities with [DEMO] description
    const deletedOpportunities = await tx.opportunity.deleteMany({
      where: { description: { contains: DEMO_TAG } },
    });

    // Delete products with [DEMO] description
    const deletedProducts = await tx.product.deleteMany({
      where: { description: { contains: DEMO_TAG } },
    });

    // Delete services with [DEMO] description
    const deletedServices = await tx.service.deleteMany({
      where: { description: { contains: DEMO_TAG } },
    });

    // Delete demo users
    const deletedUsers = await tx.user.deleteMany({
      where: { email: { endsWith: DEMO_EMAIL_DOMAIN } },
    });

    return {
      users: deletedUsers.count,
      products: deletedProducts.count,
      services: deletedServices.count,
      opportunities: deletedOpportunities.count,
      orders: deletedOrders.count,
      tickets: deletedTickets.count,
      applications: deletedApplications.count,
    };
  });

  return { message: 'Demo data cleared successfully', counts: result };
}

export async function getDemoStatus() {
  const [demoUsers, demoProducts, demoOrders, demoTickets, demoOpportunities, demoServices] =
    await Promise.all([
      prisma.user.count({ where: { email: { endsWith: DEMO_EMAIL_DOMAIN } } }),
      prisma.product.count({ where: { description: { contains: DEMO_TAG } } }),
      prisma.order.count({ where: { notes: { contains: DEMO_TAG } } }),
      prisma.ticket.count({ where: { subject: { contains: DEMO_TAG } } }),
      prisma.opportunity.count({ where: { description: { contains: DEMO_TAG } } }),
      prisma.service.count({ where: { description: { contains: DEMO_TAG } } }),
    ]);

  return { demoUsers, demoProducts, demoOrders, demoTickets, demoOpportunities, demoServices };
}
