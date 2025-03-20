import { NextResponse } from 'next/server';
import { readUsersFile, writeUsersFile, User } from '../utils';

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
    if (data.users.some((user: User) => user.email === email)) {
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 409 }
      );
    }
    
    // Get max ID to generate a new unique ID
    const maxId = data.users.length > 0 
      ? Math.max(...data.users.map(user => user.id))
      : 0;
    
    // Add new user
    const newUser: User = {
      id: maxId + 1,
      email,
      password,
      points: 0,
      friends: [],
      participatedInitiatives: []
    };
    
    data.users.push(newUser);
    
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