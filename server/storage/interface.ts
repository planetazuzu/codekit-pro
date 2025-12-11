/**
 * Storage Interface
 * Defines the contract for all storage implementations
 */

import type {
  User,
  InsertUser,
  Prompt,
  InsertPrompt,
  UpdatePrompt,
  Snippet,
  InsertSnippet,
  UpdateSnippet,
  Link,
  InsertLink,
  UpdateLink,
  Guide,
  InsertGuide,
  UpdateGuide,
  View,
  InsertView,
  Affiliate,
  InsertAffiliate,
  UpdateAffiliate,
  AffiliateClick,
  InsertAffiliateClick,
  AffiliateProgram,
  InsertAffiliateProgram,
  UpdateAffiliateProgram,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(user: UpdateUser): Promise<User>;

  // Prompts
  getPrompts(userId?: string, includePending?: boolean): Promise<Prompt[]>;
  getPrompt(id: string, userId?: string, includePending?: boolean): Promise<Prompt | undefined>;
  createPrompt(prompt: InsertPrompt & { userId: string; status?: string }): Promise<Prompt>;
  updatePrompt(prompt: UpdatePrompt & { userId?: string }): Promise<Prompt>;
  deletePrompt(id: string, userId?: string): Promise<boolean>;

  // Snippets
  getSnippets(userId?: string, includePending?: boolean): Promise<Snippet[]>;
  getSnippet(id: string, userId?: string, includePending?: boolean): Promise<Snippet | undefined>;
  createSnippet(snippet: InsertSnippet & { userId: string; status?: string }): Promise<Snippet>;
  updateSnippet(snippet: UpdateSnippet & { userId?: string }): Promise<Snippet>;
  deleteSnippet(id: string, userId?: string): Promise<boolean>;

  // Links
  getLinks(userId?: string, includePending?: boolean): Promise<Link[]>;
  getLink(id: string, userId?: string, includePending?: boolean): Promise<Link | undefined>;
  createLink(link: InsertLink & { userId: string; status?: string }): Promise<Link>;
  updateLink(link: UpdateLink & { userId?: string }): Promise<Link>;
  deleteLink(id: string, userId?: string): Promise<boolean>;

  // Guides
  getGuides(userId?: string, includePending?: boolean): Promise<Guide[]>;
  getGuide(id: string, userId?: string, includePending?: boolean): Promise<Guide | undefined>;
  createGuide(guide: InsertGuide & { userId: string; status?: string }): Promise<Guide>;
  updateGuide(guide: UpdateGuide & { userId?: string }): Promise<Guide>;
  deleteGuide(id: string, userId?: string): Promise<boolean>;

  // Analytics
  createView(view: InsertView): Promise<View>;
  getViews(page?: string, entityType?: string, days?: number): Promise<View[]>;
  getViewsByPage(): Promise<Array<{ page: string; count: number }>>;
  getViewsByEntityType(): Promise<Array<{ entityType: string; count: number }>>;
  getViewsByDate(days?: number): Promise<Array<{ date: string; count: number }>>;
  getTopPages(limit?: number): Promise<Array<{ page: string; count: number }>>;

  // Affiliates
  getAffiliates(): Promise<Affiliate[]>;
  getAffiliate(id: string): Promise<Affiliate | undefined>;
  createAffiliate(affiliate: InsertAffiliate): Promise<Affiliate>;
  updateAffiliate(affiliate: UpdateAffiliate): Promise<Affiliate>;
  deleteAffiliate(id: string): Promise<boolean>;

  // Affiliate Clicks
  createAffiliateClick(click: InsertAffiliateClick): Promise<AffiliateClick>;
  getAffiliateClicks(affiliateId?: string, days?: number): Promise<AffiliateClick[]>;
  getAffiliateClickStats(affiliateId?: string): Promise<{
    totalClicks: number;
    clicksByDay: Array<{ date: string; count: number }>;
  }>;

  // Affiliate Programs
  getAffiliatePrograms(): Promise<AffiliateProgram[]>;
  getAffiliateProgram(id: string): Promise<AffiliateProgram | undefined>;
  createAffiliateProgram(insertProgram: InsertAffiliateProgram): Promise<AffiliateProgram>;
  updateAffiliateProgram(updateProgram: UpdateAffiliateProgram): Promise<AffiliateProgram>;
  deleteAffiliateProgram(id: string): Promise<boolean>;
}

