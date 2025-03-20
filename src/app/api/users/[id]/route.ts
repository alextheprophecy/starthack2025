import { NextResponse } from 'next/server';
import { readUsersFile, User } from '../../utils';

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id, 10);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }
    
    const data = readUsersFile();
    
    // Find the user by ID
    const user = data.users.find((u: User) => u.id === userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return user data without sensitive information
    const safeUser = {
      id: user.id,
      email: user.email,
      points: user.points,
      participatedInitiatives: user.participatedInitiatives
    };
    
    return NextResponse.json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 