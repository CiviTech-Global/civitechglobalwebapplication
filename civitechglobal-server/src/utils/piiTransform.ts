/* eslint-disable no-redeclare */
import type { User, Lead, Ticket } from '@prisma/client';
import { decrypt } from './pii.js';

export function decryptUser<T extends Partial<User>>(user: T): T;
export function decryptUser<T extends Partial<User>>(user: T | null): T | null;
export function decryptUser<T extends Partial<User>>(user: T | null): T | null {
  if (!user) return null;
  return {
    ...user,
    email: user.email ? decrypt(user.email) : user.email,
    firstName: user.firstName ? decrypt(user.firstName) : user.firstName,
    lastName: user.lastName ? decrypt(user.lastName) : user.lastName,
    phone: user.phone ? decrypt(user.phone) : user.phone,
  };
}

export function decryptUsers<T extends Partial<User>>(users: T[]): T[] {
  return users.map((u) => decryptUser(u) as T);
}

export function decryptTicket<T extends Partial<Ticket>>(ticket: T): T;
export function decryptTicket<T extends Partial<Ticket>>(ticket: T | null): T | null;
export function decryptTicket<T extends Partial<Ticket>>(ticket: T | null): T | null {
  if (!ticket) return null;
  return {
    ...ticket,
    email: ticket.email ? decrypt(ticket.email) : ticket.email,
  };
}

export function decryptTickets<T extends Partial<Ticket>>(tickets: T[]): T[] {
  return tickets.map((t) => decryptTicket(t) as T);
}

export function decryptLead<T extends Partial<Lead>>(lead: T): T;
export function decryptLead<T extends Partial<Lead>>(lead: T | null): T | null;
export function decryptLead<T extends Partial<Lead>>(lead: T | null): T | null {
  if (!lead) return null;
  return {
    ...lead,
    fullName: lead.fullName ? decrypt(lead.fullName) : lead.fullName,
    phoneNumber: lead.phoneNumber ? decrypt(lead.phoneNumber) : lead.phoneNumber,
    telegramUsername: lead.telegramUsername ? decrypt(lead.telegramUsername) : lead.telegramUsername,
    telegramFirstName: lead.telegramFirstName ? decrypt(lead.telegramFirstName) : lead.telegramFirstName,
    city: lead.city ? decrypt(lead.city) : lead.city,
  };
}

export function decryptLeads<T extends Partial<Lead>>(leads: T[]): T[] {
  return leads.map((l) => decryptLead(l) as T);
}
