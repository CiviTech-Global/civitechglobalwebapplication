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

async function main() {
  console.log('Seeding database...');

  // Create Super Admin
  const superAdminHashed = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: SUPER_ADMIN_EMAIL },
    update: {},
    create: {
      email: SUPER_ADMIN_EMAIL,
      password: superAdminHashed,
      firstName: SUPER_ADMIN_FIRST_NAME,
      lastName: SUPER_ADMIN_LAST_NAME,
      role: 'SUPER_ADMIN',
      permissions: ['products', 'services', 'opportunities', 'orders', 'tickets', 'users', 'content', 'analytics'],
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
      password: adminHashed,
      firstName: DEMO_ADMIN_FIRST_NAME,
      lastName: DEMO_ADMIN_LAST_NAME,
      role: 'ADMIN',
      permissions: ['products', 'orders', 'tickets'],
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

  // Products (6 real GitHub-hosted products, no price)
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: 'trust-maven' },
      update: {},
      create: {
        name: 'TrustMaven',
        slug: 'trust-maven',
        description: 'TrustMaven is a trust management and digital credential verification platform that helps organizations optimize their identity verification and trust-building processes. Using advanced algorithms, it evaluates and manages trust levels between parties.\n\nتراست ماون یک پلتفرم مدیریت اعتماد و اعتبارسنجی دیجیتال است که به سازمان‌ها کمک می‌کند فرآیندهای احراز هویت و اعتمادسازی دیجیتال خود را بهینه‌سازی کنند. این سیستم با استفاده از الگوریتم‌های پیشرفته، سطح اعتماد بین طرفین را ارزیابی و مدیریت می‌کند.\n\nMore descriptions: https://github.com/CiviTech-Global/trustmaven',
        category: 'Platform',
        features: ['Multi-layer authentication / احراز هویت چندلایه', 'Trust scoring / امتیازدهی اعتماد', 'Analytics dashboard / داشبورد تحلیلی', 'Integration API / API یکپارچه‌سازی', 'Advanced reporting / گزارش‌گیری پیشرفته'],
        githubUrl: 'https://github.com/CiviTech-Global/trust-maven',
        image: '/images/products/trust-maven.jpg',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'people-square' },
      update: {},
      create: {
        name: 'People Square',
        slug: 'people-square',
        description: 'People Square is a human resources management and organizational communication platform that handles recruitment, performance evaluation, and employee development in an integrated environment. Designed for modern organizations with distributed teams.\n\nپیپل اسکوئر یک پلتفرم مدیریت منابع انسانی و ارتباطات سازمانی است که فرآیندهای استخدام، ارزیابی عملکرد و توسعه کارکنان را در یک محیط یکپارچه مدیریت می‌کند. طراحی شده برای سازمان‌های مدرن با تیم‌های توزیع‌شده.',
        category: 'HR',
        features: ['Recruitment management / مدیریت استخدام', 'Performance evaluation / ارزیابی عملکرد', 'Employee portal / پورتال کارکنان', 'HR reports / گزارش‌های HR', 'Calendar integration / یکپارچه با تقویم'],
        githubUrl: 'https://github.com/CiviTech-Global/people-square',
        image: '/images/products/people-square.jpg',
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
        image: '/images/products/trade-master.jpg',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'university-nutrition-system' },
      update: {},
      create: {
        name: 'University Nutrition System',
        slug: 'university-nutrition-system',
        description: 'The University Nutrition System is a comprehensive food reservation and distribution management system for universities and educational centers. It provides online food reservation, menu management, cost control, and statistical reporting.\n\nسامانه تغذیه دانشگاهی یک سیستم جامع مدیریت رزرو و توزیع غذا در دانشگاه‌ها و مراکز آموزشی است. این سامانه امکان رزرو آنلاین غذا، مدیریت منو، کنترل هزینه‌ها و گزارش‌گیری آماری را فراهم می‌کند.',
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
        description: 'Smart Waste Management is an IoT-based system for optimizing urban waste collection and management. Using smart sensors and routing algorithms, it reduces collection costs and increases recycling.\n\nمدیریت هوشمند پسماند یک سامانه مبتنی بر اینترنت اشیا برای بهینه‌سازی جمع‌آوری و مدیریت زباله شهری است. با استفاده از سنسورهای هوشمند و الگوریتم‌های مسیریابی، هزینه‌های جمع‌آوری را کاهش و بازیافت را افزایش می‌دهد.',
        category: 'Smart City',
        features: ['IoT sensors / سنسورهای IoT', 'Smart routing / مسیریابی هوشمند', 'Real-time dashboard / داشبورد بلادرنگ', 'Predictive analysis / تحلیل پیش‌بینی', 'Environmental reports / گزارش زیست‌محیطی'],
        githubUrl: 'https://github.com/CiviTech-Global/smart-waste-management',
        image: '/images/products/waste-management.jpg',
      },
    }),
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
        image: '/images/products/jarvis.jpg',
      },
    }),
  ]);
  console.log(`Created ${products.length} products`);

  // Services (2 specific services)
  const services = await Promise.all([
    prisma.service.upsert({
      where: { slug: 'insurance-marketplace' },
      update: {},
      create: {
        name: 'Insurance Marketplace',
        slug: 'insurance-marketplace',
        description: 'Insurance Marketplace is a comprehensive platform for comparing and purchasing various insurance policies online. This service allows users to compare insurance plans from different companies and choose the best option. Includes life, health, auto, fire, and liability insurance.\n\nبازار بیمه یک پلتفرم جامع برای مقایسه و خرید آنلاین انواع بیمه‌نامه‌ها است. این سرویس به کاربران امکان می‌دهد تا بیمه‌نامه‌های مختلف را از شرکت‌های مختلف مقایسه کرده و بهترین گزینه را انتخاب کنند. شامل بیمه عمر، درمان، خودرو، آتش‌سوزی و مسئولیت.',
        category: 'Insurance',
        features: ['Compare insurance policies / مقایسه بیمه‌نامه‌ها', 'Online purchase / خرید آنلاین', 'Expert consultation / مشاوره تخصصی', 'Policy management / مدیریت بیمه‌نامه', 'Online claims / اعلام خسارت آنلاین', '24/7 support / پشتیبانی ۲۴/۷'],
        image: '/images/services/insurance.jpg',
      },
    }),
    prisma.service.upsert({
      where: { slug: 'order-a-project' },
      update: {},
      create: {
        name: 'Order a Project',
        slug: 'order-a-project',
        description: 'The Order a Project service allows you to entrust your software projects to our expert team. From website and mobile app design to enterprise system development, we are ready to execute your ideas. Transparent process, on-time delivery, and post-delivery support.\n\nسرویس سفارش پروژه به شما امکان می‌دهد تا پروژه‌های نرم‌افزاری خود را به تیم متخصص ما بسپارید. از طراحی وب‌سایت و اپلیکیشن موبایل تا توسعه سیستم‌های سازمانی، ما آماده اجرای ایده‌های شما هستیم. فرآیند شفاف، تحویل به‌موقع و پشتیبانی پس از تحویل.',
        category: 'Development',
        features: ['Free consultation / مشاوره رایگان', 'UI/UX design / طراحی UI/UX', 'Full-stack development / توسعه فول‌استک', 'Testing & QA / تست و تضمین کیفیت', 'Deployment & support / استقرار و پشتیبانی', 'On-time delivery / تحویل به‌موقع'],
        image: '/images/services/order-project.jpg',
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
        description: 'Join our frontend team and build modern, responsive web applications with React, TypeScript, and Tailwind CSS. You will work on real projects that impact civic communities.\n\nبه تیم فرانت‌اند ما بپیوندید و اپلیکیشن‌های وب مدرن و واکنش‌گرا با React، TypeScript و Tailwind CSS بسازید. شما روی پروژه‌های واقعی کار خواهید کرد که بر جوامع مدنی تأثیر می‌گذارند.',
        requirements: ['Familiar with React/TypeScript / آشنایی با React/TypeScript', 'HTML/CSS proficiency / تسلط بر HTML/CSS', 'Git basics / مبانی Git', 'Problem-solving skills / مهارت حل مسئله', 'Computer Engineering student or related / دانشجوی رشته مهندسی کامپیوتر یا مرتبط'],
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
        description: 'Work with our backend team on Node.js/Express APIs, PostgreSQL databases, and cloud infrastructure. Build systems that power civic technology solutions.\n\nبا تیم بک‌اند ما روی APIهای Node.js/Express، پایگاه‌داده PostgreSQL و زیرساخت ابری کار کنید. سیستم‌هایی بسازید که راهکارهای فناوری مدنی را قدرت می‌بخشند.',
        requirements: ['Familiar with Node.js/Express / آشنایی با Node.js/Express', 'SQL basics / مبانی SQL', 'REST API concepts / مفاهیم REST API', 'TypeScript preferred / ترجیحاً TypeScript', 'Computer Engineering student or related / دانشجوی رشته مهندسی کامپیوتر یا مرتبط'],
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
        description: 'Help design visual user interfaces for civic technology platforms. You will conduct user research, create wireframes, and develop high-fidelity prototypes.\n\nبه طراحی رابط‌های کاربری بصری برای پلتفرم‌های فناوری مدنی کمک کنید. شما تحقیقات کاربری انجام خواهید داد، وایرفریم‌ها ایجاد می‌کنید و نمونه‌های اولیه با کیفیت بالا توسعه می‌دهید.',
        requirements: ['Figma proficiency / تسلط بر Figma', 'UI/UX design principles / اصول طراحی UI/UX', 'User research basics / مبانی تحقیقات کاربری', 'Design portfolio / نمونه‌کار طراحی', 'Design or HCI student / دانشجوی رشته طراحی یا تعامل انسان و کامپیوتر'],
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
        description: 'As a Senior Full-Stack Developer, you will be responsible for designing and implementing complex systems. You will work closely with the product team and play a key role in technical decisions.\n\nبه عنوان توسعه‌دهنده ارشد فول‌استک، مسئولیت طراحی و پیاده‌سازی سیستم‌های پیچیده را بر عهده خواهید داشت. شما با تیم محصول همکاری نزدیک خواهید داشت و در تصمیمات فنی نقش کلیدی ایفا می‌کنید.',
        requirements: ['At least 3 years React/Node.js experience / حداقل ۳ سال تجربه React/Node.js', 'TypeScript proficiency / تسلط بر TypeScript', 'PostgreSQL and Redis experience / تجربه با PostgreSQL و Redis', 'Docker and CI/CD familiarity / آشنایی با Docker و CI/CD', 'Technical leadership skills / مهارت رهبری فنی'],
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
        description: 'As a DevOps Engineer, you will be responsible for managing cloud infrastructure, CI/CD pipelines, and deployment process automation. We are looking for someone who can build scalable and secure systems.\n\nبه عنوان مهندس DevOps، مسئول مدیریت زیرساخت ابری، خطوط CI/CD و اتوماسیون فرآیندهای استقرار خواهید بود. ما به دنبال فردی هستیم که بتواند سیستم‌های مقیاس‌پذیر و امن بسازد.',
        requirements: ['AWS or Azure experience / تجربه با AWS یا Azure', 'Docker and Kubernetes proficiency / تسلط بر Docker و Kubernetes', 'Terraform familiarity / آشنایی با Terraform', 'GitHub Actions experience / تجربه با GitHub Actions', 'Network security knowledge / دانش امنیت شبکه'],
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
        description: 'As a Product Manager, you will be responsible for defining product roadmaps, prioritizing features, and coordinating between technical and business teams. We are looking for someone with a deep understanding of user needs and the technology market.\n\nبه عنوان مدیر محصول، مسئول تعریف نقشه راه محصولات، اولویت‌بندی ویژگی‌ها و هماهنگی بین تیم‌های فنی و کسب‌وکار خواهید بود. ما به دنبال فردی با درک عمیق از نیازهای کاربران و بازار فناوری هستیم.',
        requirements: ['At least 2 years product management experience / حداقل ۲ سال تجربه مدیریت محصول', 'Agile methodology familiarity / آشنایی با متدولوژی‌های Agile', 'Data analysis skills / مهارت تحلیل داده', 'Strong communication / ارتباطات قوی', 'Technology industry knowledge / آشنایی با صنعت فناوری'],
        duration: 'Full-time',
        location: 'Remote',
        type: 'Remote',
        opportunityType: 'JOB',
      },
    }),
  ]);
  console.log(`Created ${opportunities.length} opportunities`);

  // Demo Orders (for the normal user)
  const demoOrders = await Promise.all([
    prisma.order.create({
      data: {
        userId: demoUser.id,
        status: 'COMPLETED',
        total: 0,
        notes: 'Demo order for TrustMaven product inquiry',
        items: {
          create: [
            { productId: products[0].id, quantity: 1, price: 0 },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        userId: demoUser.id,
        status: 'IN_PROGRESS',
        total: 0,
        notes: 'Demo order for TradeMaster consultation',
        items: {
          create: [
            { productId: products[2].id, quantity: 1, price: 0 },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        userId: demoUser.id,
        status: 'PENDING',
        total: 0,
        notes: 'Demo order for Jarvis AI assistant',
        items: {
          create: [
            { productId: products[5].id, quantity: 1, price: 0 },
          ],
        },
      },
    }),
  ]);
  console.log(`Created ${demoOrders.length} demo orders`);

  // Demo Tickets (for the normal user + some unassigned)
  const demoTickets = await Promise.all([
    prisma.ticket.create({
      data: {
        userId: demoUser.id,
        subject: 'Question about TrustMaven integration',
        email: demoUser.email,
        category: 'SUPPORT',
        status: 'OPEN',
        priority: 'MEDIUM',
      },
    }),
    prisma.ticket.create({
      data: {
        userId: demoUser.id,
        subject: 'Billing inquiry for custom project',
        email: demoUser.email,
        category: 'BILLING',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
      },
    }),
    prisma.ticket.create({
      data: {
        subject: 'General partnership inquiry',
        email: 'partner@example.com',
        category: 'SALES',
        status: 'OPEN',
        priority: 'LOW',
      },
    }),
  ]);
  console.log(`Created ${demoTickets.length} demo tickets`);

  // Demo Opportunity Applications (for the normal user)
  const demoApplications = await Promise.all([
    prisma.opportunityApplication.create({
      data: {
        userId: demoUser.id,
        opportunityId: opportunities[0].id,
        coverLetter: 'I am very interested in the Frontend Developer Intern position. I have experience with React and TypeScript and am eager to contribute to civic technology projects.',
        status: 'PENDING',
      },
    }),
    prisma.opportunityApplication.create({
      data: {
        userId: demoUser.id,
        opportunityId: opportunities[3].id,
        coverLetter: 'With over 4 years of full-stack development experience, I believe I am a strong candidate for the Senior Full-Stack Developer role. I have led multiple projects using React, Node.js, and PostgreSQL.',
        resumeUrl: 'https://example.com/resume.pdf',
        status: 'REVIEWING',
      },
    }),
  ]);
  console.log(`Created ${demoApplications.length} demo applications`);

  // Site Content (bilingual)
  const contentItems = [
    {
      key: 'hero_title',
      value: 'Empowering Communities Through Technology / توانمندسازی جوامع از طریق فناوری',
    },
    {
      key: 'hero_subtitle',
      value: 'We build innovative civic technology solutions that bridge the gap between governments, organizations, and the people they serve. / ما راهکارهای نوآورانه فناوری مدنی می‌سازیم که شکاف میان دولت‌ها، سازمان‌ها و مردمی که به آن‌ها خدمت می‌کنند را پر می‌کند.',
    },
    {
      key: 'about_mission',
      value: 'Our mission is to leverage technology to create more transparent, efficient, and accessible civic engagement platforms for communities worldwide. / مأموریت ما استفاده از فناوری برای ایجاد پلتفرم‌های مشارکت مدنی شفاف‌تر، کارآمدتر و دسترس‌پذیرتر برای جوامع در سراسر جهان است.',
    },
    {
      key: 'about_vision',
      value: 'A world where every citizen has the tools and platforms to actively participate in shaping their community and government decisions. / جهانی که در آن هر شهروند ابزارها و پلتفرم‌هایی برای مشارکت فعال در شکل‌دهی جامعه و تصمیمات دولتی خود داشته باشد.',
    },
    {
      key: 'about_description',
      value: 'CiviTech Global is a technology company dedicated to building software solutions that empower civic engagement. Founded with the belief that technology can bridge the gap between citizens and their governments. / رایان تمدن جهان گستر یک شرکت فناوری است که به ساخت راهکارهای نرم‌افزاری برای توانمندسازی مشارکت مدنی اختصاص دارد. با این باور که فناوری می‌تواند شکاف میان شهروندان و دولت‌هایشان را پر کند، ما پلتفرم‌هایی می‌سازیم که مشارکت عمومی را آسان‌تر، دسترس‌پذیرتر و تأثیرگذارتر می‌کنند.',
    },
  ];

  for (const item of contentItems) {
    await prisma.siteContent.upsert({
      where: { key: item.key },
      update: { value: item.value },
      create: item,
    });
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
