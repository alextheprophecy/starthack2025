import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'public', 'users.json');

// Helper function to read the users file
function readUsersFile() {
  try {
    const fileContents = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading users file:', error);
    return { users: [] };
  }
}

// Helper function to write to the users file
function writeUsersFile(data: any) {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing users file:', error);
    return false;
  }
}

// GET /api/users - Get all users
export async function GET() {
  const data = readUsersFile();
  return NextResponse.json(data);
}

// POST /api/users - Create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    const data = readUsersFile();
    
    // Check if user already exists
    if (data.users.some((user: any) => user.email === email)) {
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 409 }
      );
    }
    
    // Add new user
    data.users.push({ email, password });
    
    // Write updated data back to file
    const success = writeUsersFile(data);
    
    if (success) {
      return NextResponse.json({ success: true, message: 'User created successfully' });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to create user' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 