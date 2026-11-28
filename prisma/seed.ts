import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const facilities = [
  {
    id: 'loc-corp-01',
    code: 'LOC-CORP-01',
    name: 'Apex HQ & Design Studio',
    subtitle: 'Core Datacenter, ERP & Hybrid Cloud Operations',
    category: 'corporate',
    status: 'healthy',
    uptimePercent: 99.98,
    address: 'Plot 42, Sector 3, Uttara Commercial Area',
    district: 'Dhaka',
    subnet: '10.14.0.0/18',
    activeFleet: 285,
  },
  {
    id: 'loc-fct-01',
    code: 'LOC-FCT-01',
    name: 'Factory Building A',
    subtitle: 'Cutting, Auto-Stitch & High-Speed Sewing Lines',
    category: 'manufacturing',
    status: 'operational',
    uptimePercent: 99.91,
    address: 'Kashimpur Road, Konabari Industrial Zone',
    district: 'Gazipur',
    subnet: '10.14.20.0/20',
    activeFleet: 312,
  },
  {
    id: 'loc-fct-02',
    code: 'LOC-FCT-02',
    name: 'Factory Building B',
    subtitle: 'Industrial Dyeing, Chemical Wash & Finishing',
    category: 'manufacturing',
    status: 'warning',
    uptimePercent: 99.42,
    address: 'Jarun, Kashimpur Industrial Belt',
    district: 'Gazipur',
    subnet: '10.14.40.0/20',
    activeFleet: 168,
  },
  {
    id: 'loc-wh-01',
    code: 'LOC-WH-01',
    name: 'Central Warehouse & Logistics Hub',
    subtitle: 'High-Bay Fabric Storage & Global Export Staging',
    category: 'warehouse',
    status: 'healthy',
    uptimePercent: 99.88,
    address: 'Tongi Industrial Area',
    district: 'Gazipur',
    subnet: '10.14.60.0/21',
    activeFleet: 99,
  },
];

async function main() {
  console.log('🌱 Seeding ITMS Enterprise Facilities...');

  for (const fac of facilities) {
    await prisma.facility.upsert({
      where: { code: fac.code },
      update: fac,
      create: fac,
    });
    console.log(`  ✓ Facility ${fac.code} (${fac.name}) ready.`);
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
