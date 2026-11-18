import fs from 'fs';
import path from 'path';
import { Employee } from '../src/types/employee';

const ORG_STRUCTURE: Record<string, string[]> = {
  'Executive Office': ['Executive Management'],
  'Technology': ['Software Development', 'IT Infrastructure'],
  'Commercial': ['Sales', 'Marketing', 'Travel Services'],
  'Operations': ['Product'],
  'Corporate Services': ['Finance', 'Human Resources'],
  'Customer Experience': ['Customer Service', 'Guest Relations'],
};

const COUNTRIES = ['Thailand', 'Vietnam', 'Japan', 'Indonesia', 'Singapore', 'Malaysia', 'Cambodia', 'Laos'];

const FIRST_NAMES = [
  'Somchai', 'Nattawut', 'Siriporn', 'Ananda', 'Chaiwat', 'Kanya', 'Pimchanok', 'Thanakorn',
  'Minh', 'Linh', 'Tuan', 'Huong', 'Kenji', 'Yuki', 'Haruto', 'Sakura',
  'Budi', 'Siti', 'Agus', 'Dewi', 'Wei', 'Mei', 'Raj', 'Priya',
  'David', 'Sarah', 'Michael', 'Emma', 'James', 'Olivia', 'Daniel', 'Sophia'
];

const LAST_NAMES = [
  'Jitphinyopong', 'Srisai', 'Charoenpura', 'Wongsuwan', 'Rattanakosin', 'Suwannapoom',
  'Nguyen', 'Tran', 'Le', 'Pham', 'Tanaka', 'Sato', 'Suzuki', 'Takahashi',
  'Santoso', 'Wijaya', 'Kusuma', 'Tan', 'Lim', 'Lee', 'Patel', 'Sharma',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson'
];

const TITLES_BY_DIV: Record<string, string[]> = {
  'Executive Management': ['Chief Executive Officer', 'Chief Operating Officer', 'Chief Technology Officer', 'Chief Commercial Officer', 'Chief Financial Officer', 'VP of People & Culture'],
  'Software Development': ['Engineering Manager', 'Tech Lead', 'Senior Full-Stack Engineer', 'Frontend Developer', 'Backend Developer', 'QA Automation Engineer'],
  'IT Infrastructure': ['IT Infrastructure Manager', 'DevOps Engineer', 'Cloud Architect', 'System Administrator', 'IT Support Specialist'],
  'Sales': ['Head of Global Sales', 'Regional Sales Manager', 'Senior Account Executive', 'B2B Sales Representative', 'Sales Coordinator'],
  'Marketing': ['Marketing Director', 'Brand Manager', 'Digital Marketing Specialist', 'Content Strategist', 'SEO Analyst'],
  'Travel Services': ['Director of Travel Services', 'Destination Manager', 'Senior Travel Consultant', 'Tour Operations Specialist', 'Booking Coordinator'],
  'Product': ['Head of Product', 'Senior Product Manager', 'Product Owner', 'Contracting Manager', 'Destination Product Specialist'],
  'Finance': ['Finance Director', 'Accounting Manager', 'Senior Financial Analyst', 'Accountant', 'Billing Specialist'],
  'Human Resources': ['HR Director', 'Talent Acquisition Manager', 'HR Business Partner', 'People Operations Specialist', 'Recruiter'],
  'Customer Service': ['Customer Service Manager', 'Team Lead - Support', 'Senior Customer Support Agent', 'Customer Support Representative'],
  'Guest Relations': ['Guest Relations Manager', 'VIP Concierge Lead', 'Guest Experience Specialist', 'On-Ground Representative'],
};

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEmployees(): Employee[] {
  const employees: Employee[] = [];
  const usedEmails = new Set<string>();

  const createPerson = (
    index: number,
    dept: string,
    div: string,
    title: string,
    managerId: string | null,
    forcedName?: string
  ): Employee => {
    const id = `EMP${String(index).padStart(4, '0')}`;
    const name = forcedName || `${getRandom(FIRST_NAMES)} ${getRandom(LAST_NAMES)}`;
    const baseEmail = name.toLowerCase().replace(/[^a-z]/g, '.');
    let email = `${baseEmail}@example.com`;
    let counter = 1;
    while (usedEmails.has(email)) {
      email = `${baseEmail}${counter}@example.com`;
      counter++;
    }
    usedEmails.add(email);

    return {
      id,
      name,
      job_title: title,
      department: dept,
      division: div,
      country: index === 1 ? 'Thailand' : getRandom(COUNTRIES),
      email,
      manager_id: managerId,
      photo_url: index % 4 === 0 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}` : null,
    };
  };

  // Level 1: Top Executive (1 คน)
  employees.push(createPerson(1, 'Executive Office', 'Executive Management', 'Chief Executive Officer', null, 'Nattawut Jitphinyopong'));

  // Level 2: C-Suite / VPs (5 คน รายงานตรงต่อ CEO)
  const level2Configs = [
    { dept: 'Technology', div: 'Software Development', title: 'Chief Technology Officer' },
    { dept: 'Commercial', div: 'Sales', title: 'Chief Commercial Officer' },
    { dept: 'Operations', div: 'Product', title: 'Chief Operating Officer' },
    { dept: 'Corporate Services', div: 'Finance', title: 'Chief Financial Officer' },
    { dept: 'Customer Experience', div: 'Customer Service', title: 'VP of Customer Experience' },
  ];

  level2Configs.forEach((cfg, idx) => {
    employees.push(createPerson(idx + 2, cfg.dept, cfg.div, cfg.title, 'EMP0001'));
  });

  // Level 3: Division Heads / Directors (11 คน ครอบคลุมครบทุก 11 Divisions)
  const divisionManagers: Record<string, string> = {};
  let currentId = 7;

  const deptToLevel2Id: Record<string, string> = {
    'Executive Office': 'EMP0001',
    'Technology': 'EMP0002',
    'Commercial': 'EMP0003',
    'Operations': 'EMP0004',
    'Corporate Services': 'EMP0005',
    'Customer Experience': 'EMP0006',
  };

  Object.entries(ORG_STRUCTURE).forEach(([dept, divs]) => {
    divs.forEach((div) => {
      const emp = createPerson(
        currentId,
        dept,
        div,
        TITLES_BY_DIV[div][0],
        deptToLevel2Id[dept]
      );
      employees.push(emp);
      divisionManagers[div] = emp.id;
      currentId++;
    });
  });

  // Level 4: Team Leads / Managers (40 คน)
  const level4Ids: { id: string; dept: string; div: string }[] = [];
  const allDivisions = Object.entries(ORG_STRUCTURE).flatMap(([dept, divs]) =>
    divs.map((div) => ({ dept, div }))
  );

  for (let i = 0; i < 40; i++) {
    const { dept, div } = allDivisions[i % allDivisions.length];
    const emp = createPerson(
      currentId,
      dept,
      div,
      TITLES_BY_DIV[div][1] || 'Team Lead',
      divisionManagers[div]
    );
    employees.push(emp);
    level4Ids.push({ id: emp.id, dept, div });
    currentId++;
  }

  // สร้างทีมใหญ่ 1 ทีมที่มีลูกน้องตรง >= 32 คน (ตามเงื่อนไขโจทย์: at least one manager with 30+ direct reports)
  const megaManager = level4Ids[0];
  for (let i = 0; i < 32; i++) {
    const emp = createPerson(
      currentId,
      megaManager.dept,
      megaManager.div,
      getRandom(TITLES_BY_DIV[megaManager.div].slice(2)),
      megaManager.id,
      i === 0 ? 'Somchai Srisai' : undefined // ใส่ชื่อซ้ำคนที่ 1
    );
    employees.push(emp);
    currentId++;
  }

  // Level 5 & Level 6: เติมพนักงานที่เหลือจนครบ 1,000 คน
  const level5Ids: { id: string; dept: string; div: string }[] = [];
  while (currentId <= 850) {
    const mgr = getRandom(level4Ids);
    const titles = TITLES_BY_DIV[mgr.div].slice(2);
    const emp = createPerson(
      currentId,
      mgr.dept,
      mgr.div,
      getRandom(titles.length ? titles : TITLES_BY_DIV[mgr.div]),
      mgr.id,
      currentId === 100 ? 'Somchai Srisai' : undefined // ใส่ชื่อซ้ำคนที่ 2 (คนละ ID)
    );
    employees.push(emp);
    level5Ids.push({ id: emp.id, dept: mgr.dept, div: mgr.div });
    currentId++;
  }

  // Level 6 (150 คนสุดท้าย เพื่อให้มั่นใจว่ามีระดับลึก 6 เลเวล)
  while (currentId <= 1000) {
    const mgr = getRandom(level5Ids);
    const titles = TITLES_BY_DIV[mgr.div].slice(2);
    const emp = createPerson(
      currentId,
      mgr.dept,
      mgr.div,
      getRandom(titles.length ? titles : TITLES_BY_DIV[mgr.div]),
      mgr.id
    );
    employees.push(emp);
    currentId++;
  }

  return employees;
}

function validateEmployees(employees: Employee[]) {
  if (employees.length !== 1000) throw new Error(`Expected 1000 employees, got ${employees.length}`);

  const ids = new Set(employees.map((e) => e.id));
  const emails = new Set(employees.map((e) => e.email));
  if (ids.size !== 1000) throw new Error('Duplicate IDs found');
  if (emails.size !== 1000) throw new Error('Duplicate Emails found');

  const roots = employees.filter((e) => e.manager_id === null);
  if (roots.length !== 1) throw new Error(`Expected 1 root executive, got ${roots.length}`);

  // ตรวจสอบความลึก (Levels) และป้องกัน Circular Reference
  const childrenMap = new Map<string, string[]>();
  employees.forEach((e) => {
    if (e.manager_id) {
      if (!ids.has(e.manager_id)) throw new Error(`Missing manager ${e.manager_id}`);
      if (e.manager_id === e.id) throw new Error(`Self reporting ${e.id}`);
      const list = childrenMap.get(e.manager_id) || [];
      list.push(e.id);
      childrenMap.set(e.manager_id, list);
    }
  });

  let maxDepth = 0;
  let visitedCount = 0;
  let has30PlusTeam = false;

  const dfs = (id: string, depth: number) => {
    visitedCount++;
    if (depth > maxDepth) maxDepth = depth;
    const kids = childrenMap.get(id) || [];
    if (kids.length >= 30) has30PlusTeam = true;
    kids.forEach((kid) => dfs(kid, depth + 1));
  };

  dfs(roots[0].id, 1);

  if (visitedCount !== 1000) throw new Error(`Disconnected nodes! Visited ${visitedCount}/1000`);
  if (maxDepth < 5 || maxDepth > 7) throw new Error(`Invalid depth: ${maxDepth} (expected 5-7)`);
  if (!has30PlusTeam) throw new Error('No manager has 30+ direct reports');

  console.log(`✅ Validation Passed! Total: ${employees.length}, Max Depth: ${maxDepth} levels, 30+ Team: Yes`);
}

const data = generateEmployees();
validateEmployees(data);

const outDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
fs.writeFileSync(path.join(outDir, 'employees.json'), JSON.stringify(data, null, 2));
console.log('🎉 Saved to data/employees.json');