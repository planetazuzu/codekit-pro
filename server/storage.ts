import { 
  type User, 
  type InsertUser,
  type Prompt,
  type InsertPrompt,
  type UpdatePrompt,
  type Snippet,
  type InsertSnippet,
  type UpdateSnippet,
  type Link,
  type InsertLink,
  type UpdateLink,
  type Guide,
  type InsertGuide,
  type UpdateGuide,
  type View,
  type InsertView,
  type Affiliate,
  type InsertAffiliate,
  type UpdateAffiliate,
  type AffiliateClick,
  type InsertAffiliateClick,
  type AffiliateProgram,
  type InsertAffiliateProgram,
  type UpdateAffiliateProgram,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Prompts
  getPrompts(): Promise<Prompt[]>;
  getPrompt(id: string): Promise<Prompt | undefined>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  updatePrompt(prompt: UpdatePrompt): Promise<Prompt>;
  deletePrompt(id: string): Promise<boolean>;
  
  // Snippets
  getSnippets(): Promise<Snippet[]>;
  getSnippet(id: string): Promise<Snippet | undefined>;
  createSnippet(snippet: InsertSnippet): Promise<Snippet>;
  updateSnippet(snippet: UpdateSnippet): Promise<Snippet>;
  deleteSnippet(id: string): Promise<boolean>;
  
  // Links
  getLinks(): Promise<Link[]>;
  getLink(id: string): Promise<Link | undefined>;
  createLink(link: InsertLink): Promise<Link>;
  updateLink(link: UpdateLink): Promise<Link>;
  deleteLink(id: string): Promise<boolean>;
  
  // Guides
  getGuides(): Promise<Guide[]>;
  getGuide(id: string): Promise<Guide | undefined>;
  createGuide(guide: InsertGuide): Promise<Guide>;
  updateGuide(guide: UpdateGuide): Promise<Guide>;
  deleteGuide(id: string): Promise<boolean>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private prompts: Map<string, Prompt>;
  private snippets: Map<string, Snippet>;
  private links: Map<string, Link>;
  private guides: Map<string, Guide>;
  private views: Map<string, View>;
  private affiliates: Map<string, Affiliate>;
  private affiliateClicks: Map<string, AffiliateClick>;
  private affiliatePrograms: Map<string, AffiliateProgram>;

  constructor() {
    this.users = new Map();
    this.prompts = new Map();
    this.snippets = new Map();
    this.links = new Map();
    this.guides = new Map();
    this.views = new Map();
    this.affiliates = new Map();
    this.affiliateClicks = new Map();
    this.affiliatePrograms = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Prompts
  async getPrompts(): Promise<Prompt[]> {
    return Array.from(this.prompts.values());
  }

  async getPrompt(id: string): Promise<Prompt | undefined> {
    return this.prompts.get(id);
  }

  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const id = randomUUID();
    const now = new Date();
    const prompt: Prompt = {
      ...insertPrompt,
      id,
      createdAt: now,
      updatedAt: now,
      tags: insertPrompt.tags || [],
    };
    this.prompts.set(id, prompt);
    return prompt;
  }

  async updatePrompt(updatePrompt: UpdatePrompt): Promise<Prompt> {
    const existing = this.prompts.get(updatePrompt.id);
    if (!existing) {
      throw new Error(`Prompt with id ${updatePrompt.id} not found`);
    }
    const updated: Prompt = {
      ...existing,
      ...updatePrompt,
      updatedAt: new Date(),
    };
    this.prompts.set(updatePrompt.id, updated);
    return updated;
  }

  async deletePrompt(id: string): Promise<boolean> {
    return this.prompts.delete(id);
  }

  // Snippets
  async getSnippets(): Promise<Snippet[]> {
    return Array.from(this.snippets.values());
  }

  async getSnippet(id: string): Promise<Snippet | undefined> {
    return this.snippets.get(id);
  }

  async createSnippet(insertSnippet: InsertSnippet): Promise<Snippet> {
    const id = randomUUID();
    const now = new Date();
    const snippet: Snippet = {
      ...insertSnippet,
      id,
      createdAt: now,
      updatedAt: now,
      tags: insertSnippet.tags || [],
    };
    this.snippets.set(id, snippet);
    return snippet;
  }

  async updateSnippet(updateSnippet: UpdateSnippet): Promise<Snippet> {
    const existing = this.snippets.get(updateSnippet.id);
    if (!existing) {
      throw new Error(`Snippet with id ${updateSnippet.id} not found`);
    }
    const updated: Snippet = {
      ...existing,
      ...updateSnippet,
      updatedAt: new Date(),
    };
    this.snippets.set(updateSnippet.id, updated);
    return updated;
  }

  async deleteSnippet(id: string): Promise<boolean> {
    return this.snippets.delete(id);
  }

  // Links
  async getLinks(): Promise<Link[]> {
    return Array.from(this.links.values());
  }

  async getLink(id: string): Promise<Link | undefined> {
    return this.links.get(id);
  }

  async createLink(insertLink: InsertLink): Promise<Link> {
    const id = randomUUID();
    const now = new Date();
    const link: Link = {
      ...insertLink,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.links.set(id, link);
    return link;
  }

  async updateLink(updateLink: UpdateLink): Promise<Link> {
    const existing = this.links.get(updateLink.id);
    if (!existing) {
      throw new Error(`Link with id ${updateLink.id} not found`);
    }
    const updated: Link = {
      ...existing,
      ...updateLink,
      updatedAt: new Date(),
    };
    this.links.set(updateLink.id, updated);
    return updated;
  }

  async deleteLink(id: string): Promise<boolean> {
    return this.links.delete(id);
  }

  // Guides
  async getGuides(): Promise<Guide[]> {
    return Array.from(this.guides.values());
  }

  async getGuide(id: string): Promise<Guide | undefined> {
    return this.guides.get(id);
  }

  async createGuide(insertGuide: InsertGuide): Promise<Guide> {
    const id = randomUUID();
    const now = new Date();
    const guide: Guide = {
      ...insertGuide,
      id,
      createdAt: now,
      updatedAt: now,
      tags: insertGuide.tags || [],
    };
    this.guides.set(id, guide);
    return guide;
  }

  async updateGuide(updateGuide: UpdateGuide): Promise<Guide> {
    const existing = this.guides.get(updateGuide.id);
    if (!existing) {
      throw new Error(`Guide with id ${updateGuide.id} not found`);
    }
    const updated: Guide = {
      ...existing,
      ...updateGuide,
      updatedAt: new Date(),
    };
    this.guides.set(updateGuide.id, updated);
    return updated;
  }

  async deleteGuide(id: string): Promise<boolean> {
    return this.guides.delete(id);
  }

  // Analytics
  async createView(view: InsertView): Promise<View> {
    const id = randomUUID();
    const now = new Date();
    const viewRecord: View = {
      ...view,
      id,
      timestamp: now,
    };
    this.views.set(id, viewRecord);
    return viewRecord;
  }

  async getViews(page?: string, entityType?: string, days?: number): Promise<View[]> {
    let views = Array.from(this.views.values());
    
    if (page) {
      views = views.filter((v) => v.page === page);
    }
    if (entityType) {
      views = views.filter((v) => v.entityType === entityType);
    }
    if (days) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      views = views.filter((v) => v.timestamp >= cutoff);
    }
    
    return views;
  }

  async getViewsByPage(): Promise<Array<{ page: string; count: number }>> {
    const counts = new Map<string, number>();
    Array.from(this.views.values()).forEach((view) => {
      counts.set(view.page, (counts.get(view.page) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([page, count]) => ({ page, count }));
  }

  async getViewsByEntityType(): Promise<Array<{ entityType: string; count: number }>> {
    const counts = new Map<string, number>();
    Array.from(this.views.values()).forEach((view) => {
      if (view.entityType) {
        counts.set(view.entityType, (counts.get(view.entityType) || 0) + 1);
      }
    });
    return Array.from(counts.entries()).map(([entityType, count]) => ({ entityType, count }));
  }

  async getViewsByDate(days: number = 30): Promise<Array<{ date: string; count: number }>> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const views = Array.from(this.views.values()).filter((v) => v.timestamp >= cutoff);
    
    const counts = new Map<string, number>();
    views.forEach((view) => {
      const date = view.timestamp.toISOString().split("T")[0];
      counts.set(date, (counts.get(date) || 0) + 1);
    });
    
    return Array.from(counts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getTopPages(limit: number = 10): Promise<Array<{ page: string; count: number }>> {
    const byPage = await this.getViewsByPage();
    return byPage.sort((a, b) => b.count - a.count).slice(0, limit);
  }

  // Affiliates
  async getAffiliates(): Promise<Affiliate[]> {
    return Array.from(this.affiliates.values());
  }

  async getAffiliate(id: string): Promise<Affiliate | undefined> {
    return this.affiliates.get(id);
  }

  async createAffiliate(insertAffiliate: InsertAffiliate): Promise<Affiliate> {
    const id = randomUUID();
    const now = new Date();
    const affiliate: Affiliate = {
      ...insertAffiliate,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.affiliates.set(id, affiliate);
    return affiliate;
  }

  async updateAffiliate(updateAffiliate: UpdateAffiliate): Promise<Affiliate> {
    const existing = this.affiliates.get(updateAffiliate.id);
    if (!existing) {
      throw new Error(`Affiliate with id ${updateAffiliate.id} not found`);
    }
    const updated: Affiliate = {
      ...existing,
      ...updateAffiliate,
      updatedAt: new Date(),
    };
    this.affiliates.set(updateAffiliate.id, updated);
    return updated;
  }

  async deleteAffiliate(id: string): Promise<boolean> {
    // Delete all clicks for this affiliate
    Array.from(this.affiliateClicks.values())
      .filter((click) => click.affiliateId === id)
      .forEach((click) => this.affiliateClicks.delete(click.id));
    
    return this.affiliates.delete(id);
  }

  // Affiliate Clicks
  async createAffiliateClick(click: InsertAffiliateClick): Promise<AffiliateClick> {
    const id = randomUUID();
    const now = new Date();
    const clickRecord: AffiliateClick = {
      ...click,
      id,
      timestamp: now,
    };
    this.affiliateClicks.set(id, clickRecord);
    return clickRecord;
  }

  async getAffiliateClicks(affiliateId?: string, days?: number): Promise<AffiliateClick[]> {
    let clicks = Array.from(this.affiliateClicks.values());
    
    if (affiliateId) {
      clicks = clicks.filter((c) => c.affiliateId === affiliateId);
    }
    
    if (days) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      clicks = clicks.filter((c) => c.timestamp >= cutoff);
    }
    
    return clicks.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getAffiliateClickStats(affiliateId?: string): Promise<{
    totalClicks: number;
    clicksByDay: Array<{ date: string; count: number }>;
  }> {
    const clicks = affiliateId
      ? Array.from(this.affiliateClicks.values()).filter((c) => c.affiliateId === affiliateId)
      : Array.from(this.affiliateClicks.values());
    
    const totalClicks = clicks.length;
    
    const countsByDay = new Map<string, number>();
    clicks.forEach((click) => {
      const date = click.timestamp.toISOString().split("T")[0];
      countsByDay.set(date, (countsByDay.get(date) || 0) + 1);
    });
    
    const clicksByDay = Array.from(countsByDay.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return { totalClicks, clicksByDay };
  }

  // Affiliate Programs Tracker
  async getAffiliatePrograms(): Promise<AffiliateProgram[]> {
    return Array.from(this.affiliatePrograms.values());
  }

  async getAffiliateProgram(id: string): Promise<AffiliateProgram | undefined> {
    return this.affiliatePrograms.get(id);
  }

  async createAffiliateProgram(insertProgram: InsertAffiliateProgram): Promise<AffiliateProgram> {
    const id = randomUUID();
    const now = new Date();
    
    // Encrypt sensitive fields
    const { encrypt } = await import("./utils/encryption");
    const encryptedIntegrationConfig = insertProgram.integrationConfig
      ? encrypt(insertProgram.integrationConfig)
      : null;
    const encryptedInternalNotes = insertProgram.internalNotes
      ? encrypt(insertProgram.internalNotes)
      : null;
    
    const program: AffiliateProgram = {
      ...insertProgram,
      id,
      status: insertProgram.status || "not_requested",
      priority: insertProgram.priority || "medium",
      integrationType: insertProgram.integrationType || "manual",
      tags: insertProgram.tags || [],
      totalClicks: insertProgram.totalClicks || "0",
      estimatedRevenue: insertProgram.estimatedRevenue || "0",
      createdAt: now,
      updatedAt: now,
      registrationUrl: insertProgram.registrationUrl || null,
      dashboardUrl: insertProgram.dashboardUrl || null,
      requestDate: insertProgram.requestDate || null,
      approvalDate: insertProgram.approvalDate || null,
      notes: insertProgram.notes || null,
      integrationConfig: encryptedIntegrationConfig,
      lastSyncAt: insertProgram.lastSyncAt || null,
      internalNotes: encryptedInternalNotes,
    } as AffiliateProgram;
    this.affiliatePrograms.set(id, program);
    return program;
  }

  async updateAffiliateProgram(updateProgram: UpdateAffiliateProgram): Promise<AffiliateProgram> {
    const existing = this.affiliatePrograms.get(updateProgram.id);
    if (!existing) {
      throw new Error(`Affiliate program with id ${updateProgram.id} not found`);
    }

    // Encrypt sensitive fields if they're being updated
    const { encrypt } = await import("./utils/encryption");
    const encryptedIntegrationConfig = updateProgram.integrationConfig !== undefined
      ? (updateProgram.integrationConfig ? encrypt(updateProgram.integrationConfig) : null)
      : existing.integrationConfig;
    const encryptedInternalNotes = updateProgram.internalNotes !== undefined
      ? (updateProgram.internalNotes ? encrypt(updateProgram.internalNotes) : null)
      : existing.internalNotes;

    const updated: AffiliateProgram = {
      ...existing,
      ...updateProgram,
      integrationConfig: encryptedIntegrationConfig,
      internalNotes: encryptedInternalNotes,
      updatedAt: new Date(),
    } as AffiliateProgram;
    this.affiliatePrograms.set(updateProgram.id, updated);
    return updated;
  }

  async deleteAffiliateProgram(id: string): Promise<boolean> {
    return this.affiliatePrograms.delete(id);
  }
}

export const storage = new MemStorage();
