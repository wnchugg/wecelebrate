import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_env.ts'; // Use environment-aware KV store

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function seedDemoUseCaseSites(environmentId: string = 'development') {
  console.log(`Starting demo use case sites seeding for environment: ${environmentId}...`);

  // Check if demo client exists
  const existingClient = await kv.get('client:demo-stakeholder', environmentId);

  let demoClientId: string;

  if (existingClient) {
    demoClientId = existingClient.id;
    console.log('Demo stakeholder client exists:', demoClientId);
  } else {
    // Create demo client
    const clientId = 'client-demo-stakeholder';
    const client = {
      id: clientId,
      name: 'JALA Demo - Stakeholder Sites',
      status: 'active',
      createdAt: new Date().toISOString(),
      settings: {
        primaryColor: '#D91C81',
        secondaryColor: '#1B2A5E',
        tertiaryColor: '#00B4CC'
      }
    };

    await kv.set(`client:${clientId}`, client, environmentId);
    await kv.set('client:demo-stakeholder', client, environmentId);

    demoClientId = clientId;
    console.log('Created demo stakeholder client:', demoClientId);
  }

  // Define demo use case sites
  const demoSites = [
    {
      id: 'demo-event-serial-card',
      slug: 'demo-event-serial-card',
      name: 'Conference 2025 Attendee Gift',
      description: 'Event Gifting - Serial Card Access',
      settings: {
        skipLandingPage: false,
        validationMethod: 'serialCard',
        showWelcomeMessage: true,
        welcomeMessageType: 'letter',
        welcomeMessage: 'Thank you for attending our annual conference! As our way of saying thanks, we\'d like you to select a gift from our exclusive collection. Use the serial code from your conference badge to get started.',
        ceoName: 'Jennifer Martinez',
        ceoTitle: 'Chief Executive Officer',
        ceoImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=800&fit=crop',
        shippingOptions: ['company_ship'],
        showPricing: false,
        enableCelebrations: false,
        catalogTitle: 'Choose Your Conference Gift',
        catalogDescription: 'Select from our curated collection of premium gifts',
        languages: ['en', 'es', 'fr'],
        defaultLanguage: 'en'
      },
      branding: {
        primaryColor: '#D91C81',
        secondaryColor: '#1B2A5E',
        accentColor: '#00B4CC',
        logoUrl: ''
      },
      landingPage: {
        sections: [
          {
            id: 'hero',
            type: 'hero',
            content: {
              title: 'Conference 2025 Attendee Gift 🎉',
              subtitle: 'Thank you for joining us! Select your exclusive attendee gift',
              backgroundImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop',
              ctaText: 'Redeem Your Gift',
              ctaLink: '/access'
            }
          },
          {
            id: 'info',
            type: 'text',
            content: {
              heading: 'How to Redeem',
              body: 'Enter the unique serial code from your conference materials, then choose from our curated selection of premium gifts. We\'ll ship it directly to your home address.'
            }
          }
        ]
      },
      welcomePage: {
        type: 'letter',
        message: 'Thank you for attending our annual conference! As our way of saying thanks, we\'d like you to select a gift from our exclusive collection.',
        senderName: 'Jennifer Martinez',
        senderTitle: 'Chief Executive Officer',
        senderImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=800&fit=crop'
      }
    },
    {
      id: 'demo-event-ship-to-store',
      slug: 'demo-event-ship-to-store',
      name: 'Regional Office Appreciation',
      description: 'Event Gifting - Ship to Store/Office',
      settings: {
        skipLandingPage: false,
        validationMethod: 'email',
        showWelcomeMessage: true,
        welcomeMessageType: 'letter',
        welcomeMessage: 'Thank you for your continued dedication to our team. Please select your appreciation gift and choose your preferred office pickup location.',
        ceoName: 'Michael Chen',
        ceoTitle: 'Regional Director',
        ceoImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop',
        shippingOptions: ['store_pickup'],
        showPricing: false,
        enableCelebrations: false,
        catalogTitle: 'Select Your Gift',
        catalogDescription: 'Available for pickup at your office location',
        languages: ['en', 'es'],
        defaultLanguage: 'en'
      },
      branding: {
        primaryColor: '#1B2A5E',
        secondaryColor: '#D91C81',
        accentColor: '#00B4CC',
        logoUrl: ''
      },
      landingPage: {
        sections: [
          {
            id: 'hero',
            type: 'hero',
            content: {
              title: 'Employee Appreciation Program',
              subtitle: 'Select your gift for pickup at your regional office',
              backgroundImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop',
              ctaText: 'Start Selection',
              ctaLink: '/access'
            }
          }
        ]
      },
      welcomePage: {
        type: 'letter',
        message: 'Thank you for your continued dedication to our team. Please select your appreciation gift and choose your preferred office pickup location.',
        senderName: 'Michael Chen',
        senderTitle: 'Regional Director',
        senderImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop'
      }
    },
    {
      id: 'demo-service-award',
      slug: 'service-award',
      name: '5 Year Service Award',
      description: 'Service Award Recognition',
      settings: {
        skipLandingPage: false,
        validationMethod: 'magicLink',
        showWelcomeMessage: true,
        welcomeMessageType: 'letter',
        welcomeMessage: 'Congratulations on reaching your 5-year milestone with our organization! Your dedication, hard work, and commitment have been invaluable to our success. As a token of our appreciation, please select a gift from our exclusive collection.',
        ceoName: 'Sarah Williams',
        ceoTitle: 'Chief People Officer',
        ceoImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=800&fit=crop',
        shippingOptions: ['company_ship', 'store_pickup'],
        showPricing: false,
        enableCelebrations: false,
        catalogTitle: '5 Year Award Selection',
        catalogDescription: 'Choose from our premium collection',
        languages: ['en'],
        defaultLanguage: 'en'
      },
      branding: {
        primaryColor: '#00B4CC',
        secondaryColor: '#1B2A5E',
        accentColor: '#D91C81',
        logoUrl: ''
      },
      landingPage: {
        sections: [
          {
            id: 'hero',
            type: 'hero',
            content: {
              title: 'Service Award Program',
              subtitle: 'Recognizing your years of dedication',
              backgroundImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=600&fit=crop',
              ctaText: 'View Your Award',
              ctaLink: '/access'
            }
          }
        ]
      },
      welcomePage: {
        type: 'letter',
        message: 'Congratulations on reaching your 5-year milestone with our organization! Your dedication, hard work, and commitment have been invaluable to our success. As a token of our appreciation, please select a gift from our exclusive collection.',
        senderName: 'Sarah Williams',
        senderTitle: 'Chief People Officer',
        senderImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=800&fit=crop'
      }
    },
    {
      id: 'demo-service-award-celebration',
      slug: 'service-award-celebration',
      name: '10 Year Anniversary Celebration',
      description: 'Service Award with Celebrations',
      settings: {
        skipLandingPage: false,
        validationMethod: 'magicLink',
        showWelcomeMessage: true,
        welcomeMessageType: 'celebration',
        welcomeMessage: 'Congratulations on 10 amazing years with our team! Your colleagues have shared their appreciation and congratulations. Browse their messages below and select your anniversary gift.',
        ceoName: 'David Thompson',
        ceoTitle: 'Chief Executive Officer',
        ceoImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=800&fit=crop',
        shippingOptions: ['company_ship', 'store_pickup'],
        showPricing: false,
        enableCelebrations: true,
        catalogTitle: '10 Year Award Selection',
        catalogDescription: 'Premium gifts for a decade of excellence',
        languages: ['en'],
        defaultLanguage: 'en'
      },
      branding: {
        primaryColor: '#D91C81',
        secondaryColor: '#1B2A5E',
        accentColor: '#FFD93D',
        logoUrl: ''
      },
      landingPage: {
        sections: [
          {
            id: 'hero',
            type: 'hero',
            content: {
              title: 'Celebrating 10 Years of Excellence! 🎊',
              subtitle: 'Your team wants to celebrate with you',
              backgroundImage: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&h=600&fit=crop',
              ctaText: 'See Celebration',
              ctaLink: '/access'
            }
          }
        ]
      },
      welcomePage: {
        type: 'celebration',
        message: 'Congratulations on 10 amazing years with our team! Your colleagues have shared their appreciation and congratulations.',
        senderName: 'David Thompson',
        senderTitle: 'Chief Executive Officer',
        senderImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=800&fit=crop'
      }
    },
    {
      id: 'demo-employee-onboarding',
      slug: 'employee-onboarding',
      name: 'New Hire Welcome',
      description: 'Employee Onboarding',
      settings: {
        skipLandingPage: false,
        validationMethod: 'employeeId',
        showWelcomeMessage: true,
        welcomeMessageType: 'letter',
        welcomeMessage: 'Welcome to our onboarding portal. As a manager, you can order welcome kits for your new team members. Select from our pre-configured kits and choose delivery to your office location or ship directly to the new employee\'s home.',
        ceoName: 'Emily Rodriguez',
        ceoTitle: 'VP of People & Culture',
        ceoImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=800&fit=crop',
        shippingOptions: ['company_ship', 'store_pickup'],
        showPricing: false,
        enableCelebrations: true,
        catalogTitle: 'Onboarding Kit Selection',
        catalogDescription: 'Pre-configured kits for new hires: Tech Bundle, Desk Setup, Welcome Swag',
        languages: ['en'],
        defaultLanguage: 'en'
      },
      branding: {
        primaryColor: '#00B4CC',
        secondaryColor: '#D91C81',
        accentColor: '#1B2A5E',
        logoUrl: ''
      },
      landingPage: {
        sections: [
          {
            id: 'hero',
            type: 'hero',
            content: {
              title: 'Manager Onboarding Portal',
              subtitle: 'Order welcome kits for your new team members',
              backgroundImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop',
              ctaText: 'Order Kits',
              ctaLink: '/access'
            }
          }
        ]
      },
      welcomePage: {
        type: 'letter',
        message: 'Welcome to our onboarding portal. As a manager, you can order welcome kits for your new team members. Select from our pre-configured kits and choose delivery to your office location or ship directly to the new employee\'s home.',
        senderName: 'Emily Rodriguez',
        senderTitle: 'VP of People & Culture',
        senderImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=800&fit=crop'
      }
    }
  ];

  // Create or update each demo site
  let createdCount = 0;
  let updatedCount = 0;
  
  for (const siteData of demoSites) {
    const existingSite = await kv.get(`sites:${siteData.id}`, environmentId);

    const site = {
      id: siteData.id,
      clientId: demoClientId,
      name: siteData.name,
      slug: siteData.slug,
      description: siteData.description,
      status: 'active',
      createdAt: existingSite?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: siteData.settings,
      branding: siteData.branding,
      landingPage: siteData.landingPage,
      welcomePage: siteData.welcomePage
    };

    // Upsert site (create or update)
    await kv.set(`sites:${siteData.id}`, site, environmentId);

    // Upsert slug lookup
    await kv.set(`sites:slug:${siteData.slug}`, { siteId: siteData.id }, environmentId);

    // Add to client's sites list
    await kv.set(`client:${demoClientId}:site:${siteData.id}`, site, environmentId);

    if (existingSite) {
      updatedCount++;
      console.log(`Updated demo site: ${siteData.name} (${siteData.slug}) with ID: ${siteData.id}`);
    } else {
      createdCount++;
      console.log(`Created demo site: ${siteData.name} (${siteData.slug}) with ID: ${siteData.id}`);
    }
  }

  // Create test employees for each demo site
  console.log('Creating test employees for demo sites...');
  const testEmployees = [
    // Demo Site 1: Serial Card validation
    {
      siteId: 'demo-event-serial-card',
      employees: [
        {
          id: 'emp-001',
          name: 'John Smith',
          email: 'john.smith@company.com',
          employeeId: 'EMP001',
          serialCard: 'CONF2025-ABC123',
          status: 'active',
          department: 'Engineering',
          createdAt: new Date().toISOString()
        },
        {
          id: 'emp-002',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          employeeId: 'EMP002',
          serialCard: 'CONF2025-XYZ789',
          status: 'active',
          department: 'Marketing',
          createdAt: new Date().toISOString()
        },
        {
          id: 'emp-003',
          name: 'Michael Chen',
          email: 'michael.chen@company.com',
          employeeId: 'EMP003',
          serialCard: 'CONF2025-DEF456',
          status: 'active',
          department: 'Sales',
          createdAt: new Date().toISOString()
        }
      ]
    },
    // Demo Site 2: Email validation for ship-to-store
    {
      siteId: 'demo-event-ship-to-store',
      employees: [
        {
          id: 'emp-004',
          name: 'Emily Davis',
          email: 'employee@company.com',
          employeeId: 'EMP1001',
          serialCard: '',
          status: 'active',
          department: 'Operations',
          createdAt: new Date().toISOString()
        },
        {
          id: 'emp-005',
          name: 'David Wilson',
          email: 'david.wilson@company.com',
          employeeId: 'EMP1002',
          serialCard: '',
          status: 'active',
          department: 'Finance',
          createdAt: new Date().toISOString()
        }
      ]
    },
    // Demo Site 3: Magic Link (email) validation
    {
      siteId: 'demo-service-award',
      employees: [
        {
          id: 'emp-006',
          name: 'Jennifer Martinez',
          email: 'jennifer.martinez@company.com',
          employeeId: 'EMP2001',
          serialCard: '',
          status: 'active',
          department: 'HR',
          createdAt: new Date().toISOString()
        },
        {
          id: 'emp-007',
          name: 'Robert Taylor',
          email: 'robert.taylor@company.com',
          employeeId: 'EMP2002',
          serialCard: '',
          status: 'active',
          department: 'IT',
          createdAt: new Date().toISOString()
        }
      ]
    },
    // Demo Site 4: Birthday - Email validation
    {
      siteId: 'demo-birthday',
      employees: [
        {
          id: 'emp-008',
          name: 'Amanda White',
          email: 'amanda.white@company.com',
          employeeId: 'EMP3001',
          serialCard: '',
          status: 'active',
          department: 'Customer Success',
          createdAt: new Date().toISOString()
        }
      ]
    },
    // Demo Site 5: Manager Portal - Email validation
    {
      siteId: 'demo-manager-portal',
      employees: [
        {
          id: 'emp-009',
          name: 'Thomas Anderson',
          email: 'thomas.anderson@company.com',
          employeeId: 'MGR001',
          serialCard: '',
          status: 'active',
          department: 'Management',
          role: 'manager',
          createdAt: new Date().toISOString()
        }
      ]
    }
  ];

  let employeeCount = 0;
  let employeeUpdatedCount = 0;
  for (const siteEmployees of testEmployees) {
    for (const employee of siteEmployees.employees) {
      const key = `employee:${siteEmployees.siteId}:${employee.id}`;
      
      // Check if employee already exists
      const existingEmployee = await kv.get(key, environmentId);

      // Upsert employee (create or update)
      await kv.set(key, employee, environmentId);
      
      if (existingEmployee) {
        employeeUpdatedCount++;
        console.log(`Updated test employee: ${employee.name} (${employee.serialCard || employee.employeeId || employee.email}) for site ${siteEmployees.siteId}`);
      } else {
        employeeCount++;
        console.log(`Created test employee: ${employee.name} (${employee.serialCard || employee.employeeId || employee.email}) for site ${siteEmployees.siteId}`);
      }
    }
  }

  console.log(`Created ${employeeCount} test employees, Updated ${employeeUpdatedCount} test employees`);
  
  // ==================== ASSIGN GIFTS TO DEMO SITES ====================
  console.log('Assigning gifts to demo sites...');
  
  // Get available gifts (from main seed.ts)
  const availableGifts = [
    'gift-001', 'gift-002', 'gift-003', 'gift-004', 'gift-005',
    'gift-006', 'gift-007', 'gift-008', 'gift-009', 'gift-010',
    'gift-011', 'gift-012', 'gift-013', 'gift-014', 'gift-015'
  ];
  
  let assignmentCount = 0;
  for (const siteData of demoSites) {
    // Assign all gifts to each demo site
    for (const giftId of availableGifts) {
      const assignmentKey = `site-gift-assignment:${siteData.id}:${giftId}`;
      const assignment = {
        siteId: siteData.id,
        giftId: giftId,
        active: true,
        createdAt: new Date().toISOString()
      };
      
      await kv.set(assignmentKey, assignment, environmentId);
      assignmentCount++;
    }
    console.log(`Assigned ${availableGifts.length} gifts to demo site: ${siteData.name}`);
  }
  
  console.log(`Total gift assignments created: ${assignmentCount}`);
  console.log(`Demo use case sites seeding complete! Created: ${createdCount}, Updated: ${updatedCount}`);
  return { 
    success: true, 
    created: createdCount,
    updated: updatedCount,
    total: demoSites.length 
  };
}