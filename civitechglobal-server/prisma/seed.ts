import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Configurable seed credentials from environment variables
const SUPER_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'superadmin@civitechglobal.com';
const SUPER_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'SuperAdmin@123';
const SUPER_ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME || 'Super';
const SUPER_ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME || 'Admin';

const DEMO_ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL || 'admin@civitechglobal.com';
const DEMO_ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD || 'Admin@123';
const DEMO_ADMIN_FIRST_NAME = process.env.DEMO_ADMIN_FIRST_NAME || 'Manager';
const DEMO_ADMIN_LAST_NAME = process.env.DEMO_ADMIN_LAST_NAME || 'Admin';

const USER_EMAIL = process.env.USER_EMAIL || 'user@civitechglobal.com';
const USER_PASSWORD = process.env.USER_PASSWORD || 'User@123';
const USER_FIRST_NAME = process.env.USER_FIRST_NAME || 'Demo';
const USER_LAST_NAME = process.env.USER_LAST_NAME || 'User';

const ALL_PERMISSIONS = ['products', 'services', 'opportunities', 'orders', 'tickets', 'users', 'content', 'analytics', 'roles', 'admins', 'leads'];

async function main() {
  console.log('Seeding database...');

  // Default Admin Roles
  const superAdminRole = await prisma.adminRole.upsert({
    where: { name: 'Super Admin' },
    update: { permissions: ALL_PERMISSIONS },
    create: { name: 'Super Admin', permissions: ALL_PERMISSIONS },
  });
  console.log('Created role: Super Admin');

  const contentManagerRole = await prisma.adminRole.upsert({
    where: { name: 'Content Manager' },
    update: { permissions: ['products', 'services', 'content', 'opportunities'] },
    create: { name: 'Content Manager', permissions: ['products', 'services', 'content', 'opportunities'] },
  });
  console.log('Created role: Content Manager');

  const supportAgentRole = await prisma.adminRole.upsert({
    where: { name: 'Support Agent' },
    update: { permissions: ['tickets'] },
    create: { name: 'Support Agent', permissions: ['tickets'] },
  });
  console.log('Created role: Support Agent');

  // Create Super Admin
  const superAdminHashed = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: SUPER_ADMIN_EMAIL },
    update: {},
    create: {
      email: SUPER_ADMIN_EMAIL,
      username: 'superadmin',
      password: superAdminHashed,
      firstName: SUPER_ADMIN_FIRST_NAME,
      lastName: SUPER_ADMIN_LAST_NAME,
      role: 'SUPER_ADMIN',
      permissions: ALL_PERMISSIONS,
      adminRoleId: superAdminRole.id,
    },
  });
  console.log('Created super admin:', superAdmin.email);

  // Create Demo Admin (limited permissions)
  const adminHashed = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 12);
  const demoAdmin = await prisma.user.upsert({
    where: { email: DEMO_ADMIN_EMAIL },
    update: {},
    create: {
      email: DEMO_ADMIN_EMAIL,
      username: 'admin',
      password: adminHashed,
      firstName: DEMO_ADMIN_FIRST_NAME,
      lastName: DEMO_ADMIN_LAST_NAME,
      role: 'ADMIN',
      permissions: ['products', 'orders', 'tickets', 'leads'],
      adminRoleId: contentManagerRole.id,
    },
  });
  console.log('Created demo admin:', demoAdmin.email);

  // Create demo user
  const userPassword = await bcrypt.hash(USER_PASSWORD, 12);
  const demoUser = await prisma.user.upsert({
    where: { email: USER_EMAIL },
    update: {},
    create: {
      email: USER_EMAIL,
      password: userPassword,
      firstName: USER_FIRST_NAME,
      lastName: USER_LAST_NAME,
      role: 'USER',
    },
  });
  console.log('Created demo user:', demoUser.email);

  // Products (7 products — 6 real + 1 coming soon)
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: 'jarvis' },
      update: {},
      create: {
        name: 'Jarvis',
        slug: 'jarvis',
        description: 'Jarvis is an AI-powered smart assistant that helps organizations automate their daily processes. From answering frequently asked questions to task management and scheduling, Jarvis increases team productivity.\n\nجارویس یک دستیار هوشمند مبتنی بر هوش مصنوعی است که به سازمان‌ها کمک می‌کند تا فرآیندهای روزمره خود را خودکار کنند. از پاسخگویی به سؤالات متداول تا مدیریت وظایف و زمان‌بندی، جارویس بهره‌وری تیم را افزایش می‌دهد.',
        category: 'AI',
        features: ['Natural language processing / پردازش زبان طبیعی', 'Task automation / اتوماسیون وظایف', 'Tool integration / یکپارچه با ابزارها', 'Continuous learning / یادگیری مستمر', 'Smart chatbot / چت‌بات هوشمند'],
        githubUrl: 'https://github.com/CiviTech-Global/Jarvis-landing-page',
        landingPageUrl: 'https://civitech-global.github.io/Jarvis-landing-page/',
        image: '/images/products/jarvis.jpg',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'trade-master' },
      update: {},
      create: {
        name: 'TradeMaster',
        slug: 'trade-master',
        description: 'TradeMaster is an intelligent trade and transaction management system that enables businesses to automate and optimize their buying and selling operations, inventory management, and supply chain.\n\nترید مستر یک سامانه هوشمند مدیریت معاملات و تجارت است که به کسب‌وکارها امکان می‌دهد عملیات خرید و فروش، مدیریت موجودی و زنجیره تأمین خود را به صورت خودکار و بهینه مدیریت کنند.',
        category: 'Commerce',
        features: ['Transaction management / مدیریت معاملات', 'Inventory tracking / ردیابی موجودی', 'Market analysis / تحلیل بازار', 'Financial reports / گزارش مالی', 'Order automation / اتوماسیون سفارشات'],
        githubUrl: 'https://github.com/CiviTech-Global/TradeMaster',
        landingPageUrl: 'https://civitech-global.github.io/TradeMaster-landing-page/',
        image: '/images/products/trade-master.jpg',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'trust-maven' },
      update: {},
      create: {
        name: 'TrustMaven',
        slug: 'trust-maven',
        description: 'TrustMaven is a trust management and digital credential verification platform that helps organizations optimize their identity verification and trust-building processes. Using advanced algorithms, it evaluates and manages trust levels between parties.\n\nتراست ماون یک پلتفرم مدیریت اعتماد و اعتبارسنجی دیجیتال است که به سازمان‌ها کمک می‌کند فرآیندهای احراز هویت و اعتمادسازی دیجیتال خود را بهینه‌سازی کنند.',
        category: 'Platform',
        features: ['Multi-layer authentication / احراز هویت چندلایه', 'Trust scoring / امتیازدهی اعتماد', 'Analytics dashboard / داشبورد تحلیلی', 'Integration API / API یکپارچه‌سازی', 'Advanced reporting / گزارش‌گیری پیشرفته'],
        githubUrl: 'https://github.com/CiviTech-Global/trust-maven',
        landingPageUrl: 'https://civitech-global.github.io/trust-maven-landing-page/',
        image: '/images/products/trust-maven.jpg',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'people-square' },
      update: {},
      create: {
        name: 'People Square',
        slug: 'people-square',
        description: 'People Square is a human resources management and organizational communication platform that handles recruitment, performance evaluation, and employee development in an integrated environment.\n\nپیپل اسکوئر یک پلتفرم مدیریت منابع انسانی و ارتباطات سازمانی است که فرآیندهای استخدام، ارزیابی عملکرد و توسعه کارکنان را در یک محیط یکپارچه مدیریت می‌کند.',
        category: 'HR',
        features: ['Recruitment management / مدیریت استخدام', 'Performance evaluation / ارزیابی عملکرد', 'Employee portal / پورتال کارکنان', 'HR reports / گزارش‌های HR', 'Calendar integration / یکپارچه با تقویم'],
        githubUrl: 'https://github.com/CiviTech-Global/people-square',
        image: '/images/products/people-square.jpg',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'university-nutrition-system' },
      update: {},
      create: {
        name: 'University Nutrition System',
        slug: 'university-nutrition-system',
        description: 'The University Nutrition System is a comprehensive food reservation and distribution management system for universities and educational centers.\n\nسامانه تغذیه دانشگاهی یک سیستم جامع مدیریت رزرو و توزیع غذا در دانشگاه‌ها و مراکز آموزشی است.',
        category: 'Education',
        features: ['Online food reservation / رزرو آنلاین غذا', 'Weekly menu management / مدیریت منوی هفتگی', 'Digital wallet / کیف پول دیجیتال', 'Statistical reports / گزارش آماری', 'Mobile application / اپلیکیشن موبایل'],
        githubUrl: 'https://github.com/CiviTech-Global/university-nutrition-system',
        image: '/images/products/nutrition-system.jpg',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'smart-waste-management' },
      update: {},
      create: {
        name: 'Smart Waste Management',
        slug: 'smart-waste-management',
        description: 'Smart Waste Management is an IoT-based system for optimizing urban waste collection and management.\n\nمدیریت هوشمند پسماند یک سامانه مبتنی بر اینترنت اشیا برای بهینه‌سازی جمع‌آوری و مدیریت زباله شهری است.',
        category: 'Smart City',
        features: ['IoT sensors / سنسورهای IoT', 'Smart routing / مسیریابی هوشمند', 'Real-time dashboard / داشبورد بلادرنگ', 'Predictive analysis / تحلیل پیش‌بینی', 'Environmental reports / گزارش زیست‌محیطی'],
        githubUrl: 'https://github.com/CiviTech-Global/smart-waste-management',
        image: '/images/products/waste-management.jpg',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'chekker' },
      update: {},
      create: {
        name: 'Chekker',
        slug: 'chekker',
        description: 'Chekker is an upcoming intelligent verification and quality assurance platform. Stay tuned for more details.\n\nچکر یک پلتفرم هوشمند تأیید و تضمین کیفیت است که به زودی معرفی خواهد شد.',
        category: 'Quality Assurance',
        features: ['Automated testing / تست خودکار', 'Quality metrics / معیارهای کیفیت', 'CI/CD integration / یکپارچه‌سازی CI/CD', 'Reporting dashboard / داشبورد گزارش', 'Team collaboration / همکاری تیمی'],
        isActive: false,
        image: '/images/products/chekker.jpg',
      },
    }),
  ]);
  console.log(`Created ${products.length} products`);

  // Services (2 specific services)
  const services = await Promise.all([
    prisma.service.upsert({
      where: { slug: 'freelancers-center' },
      update: {},
      create: {
        name: 'Freelancers Center',
        slug: 'freelancers-center',
        description: 'Freelancers Center is a comprehensive platform connecting businesses with skilled freelance professionals. Find talented developers, designers, and consultants for your projects.\n\nمرکز فریلنسرها یک پلتفرم جامع برای اتصال کسب‌وکارها با متخصصان فریلنس ماهر است. توسعه‌دهندگان، طراحان و مشاوران با استعداد را برای پروژه‌های خود پیدا کنید.',
        category: 'Marketplace',
        serviceType: 'FREELANCERS_CENTER',
        features: ['Verified professionals / متخصصان تأیید شده', 'Project matching / تطبیق پروژه', 'Secure payments / پرداخت امن', 'Real-time collaboration / همکاری بلادرنگ', 'Review system / سیستم نظرات', 'Portfolio showcase / نمایش نمونه‌کار'],
        image: '/images/services/freelancers.jpg',
      },
    }),
    prisma.service.upsert({
      where: { slug: 'insurance-marketplace' },
      update: {},
      create: {
        name: 'Insurance Marketplace',
        slug: 'insurance-marketplace',
        description: 'Insurance Marketplace is a comprehensive platform for comparing and purchasing various insurance policies online. Compare plans from different companies and choose the best option.\n\nبازار بیمه یک پلتفرم جامع برای مقایسه و خرید آنلاین انواع بیمه‌نامه‌ها است. بیمه‌نامه‌های مختلف را از شرکت‌های مختلف مقایسه کرده و بهترین گزینه را انتخاب کنید.',
        category: 'Insurance',
        serviceType: 'INSURANCE_MARKETPLACE',
        features: ['Compare insurance policies / مقایسه بیمه‌نامه‌ها', 'Online purchase / خرید آنلاین', 'Expert consultation / مشاوره تخصصی', 'Policy management / مدیریت بیمه‌نامه', 'Online claims / اعلام خسارت آنلاین', '24/7 support / پشتیبانی ۲۴/۷'],
        image: '/images/services/insurance.jpg',
      },
    }),
  ]);
  console.log(`Created ${services.length} services`);

  // Opportunities (mix of JOB + INTERNSHIP)
  const opportunities = await Promise.all([
    prisma.opportunity.upsert({
      where: { slug: 'frontend-developer-intern' },
      update: {},
      create: {
        title: 'Frontend Developer Intern / کارآموز توسعه فرانت‌اند',
        slug: 'frontend-developer-intern',
        description: 'Join our frontend team and build modern, responsive web applications with React, TypeScript, and Tailwind CSS.\n\nبه تیم فرانت‌اند ما بپیوندید و اپلیکیشن‌های وب مدرن و واکنش‌گرا بسازید.',
        requirements: ['Familiar with React/TypeScript / آشنایی با React/TypeScript', 'HTML/CSS proficiency / تسلط بر HTML/CSS', 'Git basics / مبانی Git', 'Problem-solving skills / مهارت حل مسئله'],
        duration: '3 months',
        location: 'Remote',
        type: 'Remote',
        opportunityType: 'INTERNSHIP',
      },
    }),
    prisma.opportunity.upsert({
      where: { slug: 'backend-developer-intern' },
      update: {},
      create: {
        title: 'Backend Developer Intern / کارآموز توسعه بک‌اند',
        slug: 'backend-developer-intern',
        description: 'Work with our backend team on Node.js/Express APIs, PostgreSQL databases, and cloud infrastructure.\n\nبا تیم بک‌اند ما روی APIهای Node.js/Express و پایگاه‌داده PostgreSQL کار کنید.',
        requirements: ['Familiar with Node.js/Express / آشنایی با Node.js/Express', 'SQL basics / مبانی SQL', 'REST API concepts / مفاهیم REST API', 'TypeScript preferred / ترجیحاً TypeScript'],
        duration: '3 months',
        location: 'Remote',
        type: 'Remote',
        opportunityType: 'INTERNSHIP',
      },
    }),
    prisma.opportunity.upsert({
      where: { slug: 'ui-ux-design-intern' },
      update: {},
      create: {
        title: 'UI/UX Design Intern / کارآموز طراحی UI/UX',
        slug: 'ui-ux-design-intern',
        description: 'Help design visual user interfaces for civic technology platforms.\n\nبه طراحی رابط‌های کاربری بصری برای پلتفرم‌های فناوری مدنی کمک کنید.',
        requirements: ['Figma proficiency / تسلط بر Figma', 'UI/UX design principles / اصول طراحی UI/UX', 'User research basics / مبانی تحقیقات کاربری', 'Design portfolio / نمونه‌کار طراحی'],
        duration: '3 months',
        location: 'Hybrid',
        type: 'Hybrid',
        opportunityType: 'INTERNSHIP',
      },
    }),
    prisma.opportunity.upsert({
      where: { slug: 'senior-fullstack-developer' },
      update: {},
      create: {
        title: 'Senior Full-Stack Developer / توسعه‌دهنده ارشد فول‌استک',
        slug: 'senior-fullstack-developer',
        description: 'Lead complex system design and implementation with our engineering team.\n\nطراحی و پیاده‌سازی سیستم‌های پیچیده را با تیم مهندسی ما رهبری کنید.',
        requirements: ['3+ years React/Node.js / حداقل ۳ سال تجربه', 'TypeScript proficiency / تسلط بر TypeScript', 'PostgreSQL/Redis / تجربه با پایگاه‌داده', 'Docker & CI/CD / آشنایی با DevOps'],
        duration: 'Full-time',
        location: 'Remote',
        type: 'Remote',
        opportunityType: 'JOB',
      },
    }),
    prisma.opportunity.upsert({
      where: { slug: 'devops-engineer' },
      update: {},
      create: {
        title: 'DevOps Engineer / مهندس DevOps',
        slug: 'devops-engineer',
        description: 'Manage cloud infrastructure, CI/CD pipelines, and deployment automation.\n\nمدیریت زیرساخت ابری و اتوماسیون فرآیندهای استقرار.',
        requirements: ['AWS or Azure / تجربه ابری', 'Docker & Kubernetes / کانتینرسازی', 'Terraform / زیرساخت به کد', 'GitHub Actions / CI/CD'],
        duration: 'Full-time',
        location: 'Hybrid',
        type: 'Hybrid',
        opportunityType: 'JOB',
      },
    }),
    prisma.opportunity.upsert({
      where: { slug: 'product-manager' },
      update: {},
      create: {
        title: 'Product Manager / مدیر محصول',
        slug: 'product-manager',
        description: 'Define product roadmaps and coordinate between technical and business teams.\n\nنقشه راه محصولات را تعریف و بین تیم‌های فنی و کسب‌وکار هماهنگ کنید.',
        requirements: ['2+ years PM experience / تجربه مدیریت محصول', 'Agile methodology / متدولوژی Agile', 'Data analysis / تحلیل داده', 'Strong communication / ارتباطات قوی'],
        duration: 'Full-time',
        location: 'Remote',
        type: 'Remote',
        opportunityType: 'JOB',
      },
    }),
  ]);
  console.log(`Created ${opportunities.length} opportunities`);

  // Demo Orders
  const demoOrders = await Promise.all([
    prisma.order.create({
      data: {
        userId: demoUser.id, status: 'COMPLETED', total: 0,
        notes: 'Demo order for TrustMaven product inquiry',
        items: { create: [{ productId: products[2].id, quantity: 1, price: 0 }] },
      },
    }),
    prisma.order.create({
      data: {
        userId: demoUser.id, status: 'IN_PROGRESS', total: 0,
        notes: 'Demo order for TradeMaster consultation',
        items: { create: [{ productId: products[1].id, quantity: 1, price: 0 }] },
      },
    }),
  ]);
  console.log(`Created ${demoOrders.length} demo orders`);

  // Demo Tickets
  const demoTickets = await Promise.all([
    prisma.ticket.create({
      data: { userId: demoUser.id, subject: 'Question about TrustMaven integration', email: demoUser.email, category: 'SUPPORT', status: 'OPEN', priority: 'MEDIUM' },
    }),
    prisma.ticket.create({
      data: { subject: 'General partnership inquiry', email: 'partner@example.com', category: 'SALES', status: 'OPEN', priority: 'LOW' },
    }),
  ]);
  console.log(`Created ${demoTickets.length} demo tickets`);

  // Demo Opportunity Applications
  await prisma.opportunityApplication.upsert({
    where: { userId_opportunityId: { userId: demoUser.id, opportunityId: opportunities[0].id } },
    update: {},
    create: { userId: demoUser.id, opportunityId: opportunities[0].id, coverLetter: 'I am interested in the Frontend Developer Intern position.', status: 'PENDING' },
  });
  console.log('Created 1 demo application');

  // Insurance Categories & Subcategories
  const insuranceCategories = [
    {
      title: 'بیمه وسایل نقلیه',
      emoji: '🚗',
      subcategories: ['شخص ثالث', 'بدنه', 'موتورسیکلت'],
    },
    {
      title: 'بیمه خانه',
      emoji: '🏠',
      subcategories: ['بسته جامع مسکونی', 'آتش‌سوزی مسکونی', 'زلزله مسکونی', 'آسانسور'],
    },
    {
      title: 'بیمه درمان تکمیلی',
      emoji: '❤️',
      subcategories: ['درمان تکمیلی انفرادی', 'درمان تکمیلی خانوادگی', 'تکمیلی شرکتی'],
    },
    {
      title: 'بیمه عمر',
      emoji: '👨‍👩‍👧‍👦',
      subcategories: [
        'طرح‌های عمر و سرمایه‌گذاری',
        'عمر گروهی',
        'عمر مانده بدهکار',
        'عمر مستمری فوت در اثر حادثه',
        'طرح‌های عمر و مستمری شوکا',
      ],
    },
    {
      title: 'بیمه مسئولیت',
      emoji: '⚖️',
      subcategories: [
        'پزشکان و پیراپزشکان',
        'تمام خطر مهندسی',
        'مسئولیت مدیران ساختمان',
        'مسئولیت حرفه‌ای مهندسین ناظر',
        'سایر',
      ],
    },
    {
      title: 'بیمه باربری',
      emoji: '🚢',
      subcategories: ['وارداتی', 'صادراتی', 'مرهونات'],
    },
    {
      title: 'بیمه مسافرتی',
      emoji: '✈️',
      subcategories: ['خارجی', 'داخلی', 'زائرین', 'ورودی به ایران'],
    },
    {
      title: 'بیمه کارفرما',
      emoji: '👷',
      subcategories: ['ساختمانی', 'غیر ساختمانی'],
    },
    {
      title: 'بیمه کسب و کار',
      emoji: '🏢',
      subcategories: ['آتش‌سوزی اداری و تجاری', 'آتش‌سوزی صنعتی', 'آسانسور'],
    },
    {
      title: 'بیمه حوادث',
      emoji: '⚠️',
      subcategories: ['حوادث انفرادی', 'حوادث گروهی'],
    },
    {
      title: 'بیمه تجهیزات الکترونیکی',
      emoji: '📱',
      subcategories: ['موبایل'],
    },
  ];

  for (const category of insuranceCategories) {
    const upsertedCategory = await prisma.insuranceCategory.upsert({
      where: { title: category.title },
      update: { emoji: category.emoji },
      create: { title: category.title, emoji: category.emoji },
    });

    for (const subcategoryTitle of category.subcategories) {
      const existingSubcategory = await prisma.insuranceSubcategory.findFirst({
        where: { categoryId: upsertedCategory.id, title: subcategoryTitle },
      });

      if (existingSubcategory) {
        await prisma.insuranceSubcategory.update({
          where: { id: existingSubcategory.id },
          data: { title: subcategoryTitle },
        });
      } else {
        await prisma.insuranceSubcategory.create({
          data: {
            categoryId: upsertedCategory.id,
            title: subcategoryTitle,
          },
        });
      }
    }
  }
  console.log(`Created ${insuranceCategories.length} insurance categories with subcategories`);

  // Site Content
  const contentItems = [
    { key: 'hero_title', value: 'Empowering Communities Through Technology / توانمندسازی جوامع از طریق فناوری' },
    { key: 'hero_subtitle', value: 'We build innovative civic technology solutions that bridge the gap between governments, organizations, and the people they serve. / ما راهکارهای نوآورانه فناوری مدنی می‌سازیم.' },
    { key: 'about_mission', value: 'Our mission is to leverage technology for more transparent and accessible civic engagement. / مأموریت ما بهره‌گیری از فناوری برای مشارکت مدنی شفاف‌تر و قابل دسترس‌تر است.' },
    { key: 'about_vision', value: 'A world where every citizen has the tools to actively participate in shaping their community. / جهانی که هر شهروند ابزار مشارکت فعال داشته باشد.' },
    { key: 'about_description', value: 'CiviTech Global is a technology company dedicated to building software solutions that empower civic engagement. / رایان تمدن جهان گستر یک شرکت فناوری است که به ساخت راهکارهای نرم‌افزاری برای توانمندسازی مشارکت مدنی اختصاص دارد.' },
  ];

  for (const item of contentItems) {
    await prisma.siteContent.upsert({ where: { key: item.key }, update: { value: item.value }, create: item });
  }
  console.log(`Created ${contentItems.length} content items`);

  console.log('Seeding complete!');
  console.log('----------------------------------------');
  console.log('Super Admin :', SUPER_ADMIN_EMAIL, '/', SUPER_ADMIN_PASSWORD);
  console.log('Demo Admin  :', DEMO_ADMIN_EMAIL, '/', DEMO_ADMIN_PASSWORD);
  console.log('Demo User   :', USER_EMAIL, '/', USER_PASSWORD);
  console.log('----------------------------------------');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
