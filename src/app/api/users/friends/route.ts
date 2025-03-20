import { NextResponse } from 'next/server';
import { readUsersFile, User } from '../../utils';

// GET /api/users/friends - Get friends for the current user
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  
  if (!email) {
    return NextResponse.json(
      { success: false, message: 'Email parameter is required' },
      { status: 400 }
    );
  }
  
  const data = readUsersFile();
  
  // Find the user
  const currentUser = data.users.find((user: User) => user.email === email);
  
  if (!currentUser) {
    return NextResponse.json(
      { success: false, message: 'User not found' },
      { status: 404 }
    );
  }
  
  // Get list of friend IDs
  const friendIds = currentUser.friends || [];
  
  // Find the friend objects
  const friends = data.users
    .filter((user: User) => friendIds.includes(user.id))
    .map((friend: User) => ({
      id: friend.id,
      email: friend.email,
      points: friend.points
    }));
  
  return NextResponse.json({
    success: true,
    friends
  });
} 