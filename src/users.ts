export interface User {
  id: string;
  name: string;
  role: 'customer' | 'admin';
}

const users: ReadonlyArray<User> = [
  { id: '1', name: 'Maya Patel', role: 'customer' },
  { id: '2', name: 'Alex Morgan', role: 'admin' },
];

export function findUser(id: string): User | undefined {
  return users.find((user) => user.id === id);
}
