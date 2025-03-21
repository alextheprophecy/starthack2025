import fs from 'fs';
import path from 'path';

export const usersFilePath = path.join(process.cwd(), 'public', 'users.json');

export interface Initiative {
  initiativeId: number;
  dateParticipated: string;
  pointsEarned: number;
  contribution: string;
}

export interface User {
  id: number;
  email: string;
  password: string;
  points: number;
  friends: number[];
  participatedInitiatives: Initiative[];
}

export interface UsersData {
  users: User[];
}

// Helper function to read the users file
export function readUsersFile(): UsersData {
  try {
    const fileContents = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading users file:', error);
    return { users: [] };
  }
}

// Helper function to write to the users file
export function writeUsersFile(data: UsersData): boolean {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing users file:', error);
    return false;
  }
} 