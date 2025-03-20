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
    const { email, password, userType = 'external', firstName, lastName, company, position } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    const data = readUsersFile();
    
    // Check if user already exists
    const existingUserIndex = data.users.findIndex((user: any) => user.email === email);
    
    if (existingUserIndex >= 0) {
      // If we're updating an existing user
      if (body.isUpdate) {
        // Update user data but keep password if not provided
        const existingUser = data.users[existingUserIndex];
        data.users[existingUserIndex] = { 
          ...existingUser,
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(company !== undefined && { company }),
          ...(position !== undefined && { position }),
          ...(password !== undefined && { password })
        };
        
        // Write updated data back to file
        const success = writeUsersFile(data);
        
        if (success) {
          return NextResponse.json({ success: true, message: 'User updated successfully' });
        } else {
          return NextResponse.json(
            { success: false, message: 'Failed to update user' },
            { status: 500 }
          );
        }
      }
      
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 409 }
      );
    }
    
    // Add new user with userType and additional fields
    data.users.push({ 
      email, 
      password, 
      userType,
      firstName: firstName || "",
      lastName: lastName || "",
      company: company || "",
      position: position || "",
      points: 0,
      participatedInitiatives: []
    });
    
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
    console.error('Error creating/updating user:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 