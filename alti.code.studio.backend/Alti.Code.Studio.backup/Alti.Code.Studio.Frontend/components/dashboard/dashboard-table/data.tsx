export type Users = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type ColumnsKey = "name" | "email" | "role" | "actions";

export const INITIAL_VISIBLE_COLUMNS: ColumnsKey[] = [
  "name",
  "email",
  "role",
  "actions",
];

export const columns = [
  { name: "Name", uid: "name" },
  { name: "Email", uid: "email" },
  { name: "Role", uid: "role" },
  { name: "Actions", uid: "actions" },
];

const names = [
  "Alice Johnson",
  "Bob Smith",
  "Charlie Brown",
  "David Wilson",
  "Eve Martinez",
  "Frank Thompson",
  "Grace Garcia",
  "Hannah Lee",
  "Isaac Anderson",
  "Julia Roberts",
  "Liam Williams",
  "Mia White",
  "Noah Harris",
  "Olivia Martin",
  "Peyton Jones",
  "Quinn Taylor",
  "Ryan Moore",
  "Sophia Davis",
  "Marcus Lopez",
  "Uma Thomas",
  "Victoria Jackson",
  "William Green",
  "Xavier Hill",
  "Yara Scott",
  "Zoe Baker",
  "Aaron Carter",
  "Bella Brown",
  "Carter Black",
  "Daisy Clark",
  "Ethan Hunt",
  "Fiona Apple",
  "George King",
  "Harper Knight",
  "Ivy Lane",
  "Jack Frost",
  "Kylie Reed",
  "Lucas Grant",
  "Molly Shaw",
  "Nathan Ford",
  "Oliver Stone",
  "Penelope Cruz",
  "Quentin Cook",
  "Ruby Fox",
  "Sarah Miles",
  "Travis Shaw",
  "Ursula Major",
  "Vera Mindy",
  "Wesley Snipes",
  "Xena Warrior",
  "Yvette Fielding",
];

const generateMockUserData = (count: number): Users[] => {
  const mockData: Users[] = [];

  for (let i = 0; i < count; i++) {
    const user: Users = {
      id: i,
      name: names[i],
      email: `${names[i]}@gmail.com`,
      role: "Admin",
    };

    mockData.push(user);
  }

  return mockData;
};

export const users: Users[] = generateMockUserData(100);
