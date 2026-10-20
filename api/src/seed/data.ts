export interface Country {
  name: string;
  currency: string;
  // Rough local-pay multiplier vs a USD baseline. Only for realistic-looking seed data.
  factor: number;
}

export interface Role {
  title: string;
  min: number; // baseline USD range
  max: number;
}

export interface Department {
  name: string;
  roles: Role[];
}

export const COUNTRIES: Country[] = [
  { name: "United States", currency: "USD", factor: 1 },
  { name: "United Kingdom", currency: "GBP", factor: 0.65 },
  { name: "Germany", currency: "EUR", factor: 0.78 },
  { name: "India", currency: "INR", factor: 25 },
  { name: "Canada", currency: "CAD", factor: 1.15 },
  { name: "Australia", currency: "AUD", factor: 1.35 },
  { name: "Singapore", currency: "SGD", factor: 1.2 },
  { name: "Japan", currency: "JPY", factor: 105 },
];

export const DEPARTMENTS: Department[] = [
  {
    name: "Engineering",
    roles: [
      { title: "Software Engineer", min: 80000, max: 140000 },
      { title: "Senior Software Engineer", min: 120000, max: 190000 },
      { title: "Engineering Manager", min: 150000, max: 230000 },
      { title: "QA Engineer", min: 60000, max: 110000 },
      { title: "DevOps Engineer", min: 90000, max: 160000 },
    ],
  },
  {
    name: "Sales",
    roles: [
      { title: "Sales Representative", min: 45000, max: 90000 },
      { title: "Account Executive", min: 70000, max: 140000 },
      { title: "Sales Manager", min: 100000, max: 180000 },
    ],
  },
  {
    name: "Marketing",
    roles: [
      { title: "Marketing Specialist", min: 50000, max: 95000 },
      { title: "Content Strategist", min: 55000, max: 100000 },
      { title: "Marketing Manager", min: 90000, max: 160000 },
    ],
  },
  {
    name: "Human Resources",
    roles: [
      { title: "HR Generalist", min: 50000, max: 85000 },
      { title: "Recruiter", min: 50000, max: 90000 },
      { title: "HR Manager", min: 85000, max: 140000 },
    ],
  },
  {
    name: "Finance",
    roles: [
      { title: "Accountant", min: 55000, max: 95000 },
      { title: "Financial Analyst", min: 65000, max: 120000 },
      { title: "Finance Manager", min: 100000, max: 170000 },
    ],
  },
  {
    name: "Operations",
    roles: [
      { title: "Operations Analyst", min: 55000, max: 100000 },
      { title: "Operations Manager", min: 90000, max: 150000 },
    ],
  },
  {
    name: "Customer Support",
    roles: [
      { title: "Support Agent", min: 35000, max: 65000 },
      { title: "Support Lead", min: 55000, max: 95000 },
    ],
  },
  {
    name: "Product",
    roles: [
      { title: "Product Manager", min: 100000, max: 170000 },
      { title: "Product Designer", min: 70000, max: 130000 },
    ],
  },
];

export const FIRST_NAMES = [
  "Aarav", "Priya", "Rohan", "Ananya", "Liam", "Emma", "Noah", "Olivia", "Hiroshi", "Yuki",
  "Wei", "Mei", "Lukas", "Sophie", "Oliver", "Charlotte", "Mateo", "Isabella", "Arjun", "Meera",
  "Daniel", "Sarah", "Ethan", "Chloe", "Kenji", "Aiko", "Felix", "Hannah", "Ravi", "Sneha",
];

export const LAST_NAMES = [
  "Sharma", "Patel", "Singh", "Gupta", "Smith", "Johnson", "Williams", "Brown", "Tanaka", "Sato",
  "Chen", "Wang", "Muller", "Schmidt", "Taylor", "Wilson", "Garcia", "Martinez", "Nair", "Iyer",
  "Anderson", "Thompson", "Clark", "Lewis", "Suzuki", "Watanabe", "Fischer", "Weber", "Reddy", "Kapoor",
];