/**
 * Celebration System Backend Module
 * Handles employee celebrations, messages, and eCards
 */

import * as kv from './kv_store.tsx';

export interface CelebrationMessage {
  id: string;
  recipientId: string;
  recipientName: string;
  milestoneId: string;
  milestoneName: string;
  message: string;
  eCardId?: string;
  eCardImage?: string;
  from: string;
  fromEmail?: string;
  createdAt: string;
  visibility: 'public' | 'private';
  likes?: number;
  shares?: number;
}

export interface CelebrationInvite {
  id: string;
  celebrationId: string;
  email: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'failed';
}

/**
 * Get all celebrations for an employee
 */
export async function getCelebrationsForEmployee(
  employeeId: string,
  environmentId: string
): Promise<CelebrationMessage[]> {
  const prefix = `celebrations:employee:${employeeId}`;
  const celebrations = await kv.getByPrefix(prefix, environmentId);
  
  return celebrations.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Get celebration by ID
 */
export async function getCelebrationById(
  celebrationId: string,
  environmentId: string
): Promise<CelebrationMessage | null> {
  return await kv.get(`celebrations:${celebrationId}`, environmentId);
}

/**
 * Create new celebration message
 */
export async function createCelebration(
  data: Omit<CelebrationMessage, 'id' | 'createdAt' | 'likes' | 'shares'>,
  environmentId: string
): Promise<CelebrationMessage> {
  const id = `celebration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const celebration: CelebrationMessage = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    likes: 0,
    shares: 0,
  };
  
  // Store by ID
  await kv.set(`celebrations:${id}`, celebration, environmentId);
  
  // Store by employee (for easy lookup)
  await kv.set(`celebrations:employee:${data.recipientId}:${id}`, celebration, environmentId);
  
  return celebration;
}

/**
 * Send celebration invite via email
 */
export async function sendCelebrationInvite(
  celebrationId: string,
  email: string,
  environmentId: string
): Promise<CelebrationInvite> {
  const celebration = await getCelebrationById(celebrationId, environmentId);
  
  if (!celebration) {
    throw new Error('Celebration not found');
  }
  
  const invite: CelebrationInvite = {
    id: `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    celebrationId,
    email,
    sentAt: new Date().toISOString(),
    status: 'sent',
  };
  
  // Store invite
  await kv.set(`invites:${invite.id}`, invite, environmentId);
  
  // Log for now - will integrate with email service later
  console.log(`[Celebration] Invite sent to ${email} for celebration ${celebrationId}`);
  console.log(`[Celebration] Message: "${celebration.message}" from ${celebration.from}`);
  
  // TODO: Integrate with email service to actually send email
  // await sendEmail({
  //   to: email,
  //   subject: `${celebration.from} shared a celebration with you!`,
  //   template: 'celebration-invite',
  //   data: { celebration, inviteLink: `${frontendUrl}/celebration?id=${celebrationId}` }
  // });
  
  return invite;
}

/**
 * Increment celebration likes
 */
export async function likeCelebration(
  celebrationId: string,
  environmentId: string
): Promise<void> {
  const celebration = await getCelebrationById(celebrationId, environmentId);
  
  if (celebration) {
    celebration.likes = (celebration.likes || 0) + 1;
    await kv.set(`celebrations:${celebrationId}`, celebration, environmentId);
    await kv.set(
      `celebrations:employee:${celebration.recipientId}:${celebrationId}`,
      celebration,
      environmentId
    );
  }
}

/**
 * Delete celebration
 */
export async function deleteCelebration(
  celebrationId: string,
  environmentId: string
): Promise<void> {
  const celebration = await getCelebrationById(celebrationId, environmentId);
  
  if (celebration) {
    // Delete main record
    await kv.del(`celebrations:${celebrationId}`, environmentId);
    
    // Delete employee index
    await kv.del(
      `celebrations:employee:${celebration.recipientId}:${celebrationId}`,
      environmentId
    );
  }
}
