import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Challenge {
  uid: string;
  "Virgin Company": string;
  "Initiaitive": string;
  "Challenge": string;
  "What Virgin is doing": string;
  "Call to Action": string;
  "Links": string;
  "Reward": string;
}

export async function POST(request: NextRequest) {
  try {
    // Only allow internal users to add challenges
    // Note: In a real application, you would use proper authentication middleware
    // but for simplicity, we'll assume authentication is handled elsewhere

    // Parse the request body
    const body = await request.json();
    const { virginCompany, initiative, challenge, whatVirginIsDoing, callToAction, links, reward } = body;

    // Validate required fields
    if (!virginCompany || !initiative || !challenge || !whatVirginIsDoing || !callToAction || !links || !reward) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // Read the existing challenges
    const filePath = path.join(process.cwd(), 'public', 'res', 'sample_initiatives.json');
    const fileData = fs.readFileSync(filePath, 'utf8');
    const challenges: Challenge[] = JSON.parse(fileData);

    // Generate a unique ID
    const lastId = challenges.length > 0 
      ? parseInt(challenges[challenges.length - 1].uid.replace('challenge-', ''), 10) 
      : 0;
    const newId = `challenge-${lastId + 1}`;

    // Create the new challenge
    const newChallenge: Challenge = {
      uid: newId,
      "Virgin Company": virginCompany,
      "Initiaitive": initiative, // Note: keeping the typo from the original JSON
      "Challenge": challenge,
      "What Virgin is doing": whatVirginIsDoing,
      "Call to Action": callToAction,
      "Links": links,
      "Reward": reward
    };

    // Add the new challenge to the array
    challenges.push(newChallenge);

    // Write the updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(challenges, null, 2), 'utf8');

    return NextResponse.json({ message: 'Challenge added successfully', challenge: newChallenge });
  } catch (error) {
    console.error('Error adding challenge:', error);
    return NextResponse.json({ message: 'Error adding challenge' }, { status: 500 });
  }
} 