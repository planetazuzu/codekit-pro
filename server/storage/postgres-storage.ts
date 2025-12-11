/**
 * PostgreSQL Storage Implementation
 * Replaces MemStorage with real database persistence
 */

import { eq, and, desc, sql, like, or, gte, count } from "drizzle-orm";
import { getDatabase } from "../config/database";
import type { IStorage } from "./interface";
import { USER_IDS, CONTENT_STATUS } from "@shared/constants";
import { NotFoundError } from "../services/error.service";
import type {
  User,
  InsertUser,
  UpdateUser,
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
import {
  users,
  prompts,
  snippets,
  links,
  guides,
  views,
  affiliates,
  affiliateClicks,
  affiliatePrograms,
} from "@shared/schema";
import { logger } from "../utils/logger";
import { decrypt, encrypt, isEncrypted } from "../utils/encryption";

export class PostgresStorage implements IStorage {
  private db = getDatabase();

  private ensureDb() {
    if (!this.db) {
      throw new Error("Database not initialized. Call initDatabase() first.");
    }
    return this.db;
  }

  // ==================== USERS ====================

  async getUser(id: string): Promise<User | undefined> {
    const db = this.ensureDb();
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = this.ensureDb();
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = this.ensureDb();
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = this.ensureDb();
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(updateUser: UpdateUser): Promise<User> {
    const db = this.ensureDb();
    const { id, ...data } = updateUser;
    const result = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    if (result.length === 0) {
      throw new Error(`User with id ${id} not found`);
    }
    return result[0];
  }

  // ==================== PROMPTS ====================

  async getPrompts(userId?: string, includePending: boolean = false): Promise<Prompt[]> {
    const db = this.ensureDb();
    const query = db.select().from(prompts);
    let conditions = [];
    
    if (userId) {
      conditions.push(eq(prompts.userId, userId));
    }
    
    // Si no es admin, solo mostrar aprobados
    if (!includePending) {
      conditions.push(eq(prompts.status, "approved"));
    }
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(prompts.createdAt));
    }
    return await query.orderBy(desc(prompts.createdAt));
  }

  async getPrompt(id: string, userId?: string, includePending: boolean = false): Promise<Prompt | undefined> {
    const db = this.ensureDb();
    let conditions = [eq(prompts.id, id)];
    
    if (userId) {
      conditions.push(eq(prompts.userId, userId));
    }
    
    // Si no es admin, solo mostrar aprobados
    if (!includePending) {
      conditions.push(eq(prompts.status, "approved"));
    }
    
    const result = await db.select().from(prompts).where(and(...conditions)).limit(1);
    return result[0];
  }

  async createPrompt(insertPrompt: InsertPrompt & { userId: string; status?: string }): Promise<Prompt> {
    const db = this.ensureDb();
    // Si no se especifica status, usar 'pending' por defecto (excepto para usuario sistema)
    const status = insertPrompt.status || (insertPrompt.userId === USER_IDS.SYSTEM ? CONTENT_STATUS.APPROVED : CONTENT_STATUS.PENDING);
    const result = await db.insert(prompts).values({
      ...insertPrompt,
      status,
    }).returning();
    return result[0];
  }

  async updatePrompt(updatePrompt: UpdatePrompt & { userId?: string }): Promise<Prompt> {
    const db = this.ensureDb();
    const { id, userId, ...data } = updatePrompt;
    let query = db.update(prompts).set({ ...data, updatedAt: new Date() }).where(eq(prompts.id, id));
    if (userId) {
      query = query.where(and(eq(prompts.id, id), eq(prompts.userId, userId)));
    }
    const result = await query.returning();
    if (result.length === 0) {
      throw new NotFoundError("Prompt", id);
    }
    return result[0];
  }

  async deletePrompt(id: string, userId?: string): Promise<boolean> {
    const db = this.ensureDb();
    let query = db.delete(prompts).where(eq(prompts.id, id));
    if (userId) {
      query = query.where(and(eq(prompts.id, id), eq(prompts.userId, userId)));
    }
    const result = await query;
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // ==================== SNIPPETS ====================

  async getSnippets(userId?: string, includePending: boolean = false): Promise<Snippet[]> {
    const db = this.ensureDb();
    const query = db.select().from(snippets);
    let conditions = [];
    
    if (userId) {
      conditions.push(eq(snippets.userId, userId));
    }
    
    // Si no es admin, solo mostrar aprobados
    if (!includePending) {
      conditions.push(eq(snippets.status, "approved"));
    }
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(snippets.createdAt));
    }
    return await query.orderBy(desc(snippets.createdAt));
  }

  async getSnippet(id: string, userId?: string, includePending: boolean = false): Promise<Snippet | undefined> {
    const db = this.ensureDb();
    let conditions = [eq(snippets.id, id)];
    
    if (userId) {
      conditions.push(eq(snippets.userId, userId));
    }
    
    // Si no es admin, solo mostrar aprobados
    if (!includePending) {
      conditions.push(eq(snippets.status, "approved"));
    }
    
    const result = await db.select().from(snippets).where(and(...conditions)).limit(1);
    return result[0];
  }

  async createSnippet(insertSnippet: InsertSnippet & { userId: string; status?: string }): Promise<Snippet> {
    const db = this.ensureDb();
    // Si no se especifica status, usar 'pending' por defecto (excepto para usuario sistema)
    const status = insertSnippet.status || (insertSnippet.userId === USER_IDS.SYSTEM ? CONTENT_STATUS.APPROVED : CONTENT_STATUS.PENDING);
    const result = await db.insert(snippets).values({
      ...insertSnippet,
      status,
    }).returning();
    return result[0];
  }

  async updateSnippet(updateSnippet: UpdateSnippet & { userId?: string }): Promise<Snippet> {
    const db = this.ensureDb();
    const { id, userId, ...data } = updateSnippet;
    let query = db.update(snippets).set({ ...data, updatedAt: new Date() }).where(eq(snippets.id, id));
    if (userId) {
      query = query.where(and(eq(snippets.id, id), eq(snippets.userId, userId)));
    }
    const result = await query.returning();
    if (result.length === 0) {
      throw new NotFoundError("Snippet", id);
    }
    return result[0];
  }

  async deleteSnippet(id: string, userId?: string): Promise<boolean> {
    const db = this.ensureDb();
    let query = db.delete(snippets).where(eq(snippets.id, id));
    if (userId) {
      query = query.where(and(eq(snippets.id, id), eq(snippets.userId, userId)));
    }
    const result = await query;
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // ==================== LINKS ====================

  async getLinks(userId?: string, includePending: boolean = false): Promise<Link[]> {
    const db = this.ensureDb();
    const query = db.select().from(links);
    let conditions = [];
    
    if (userId) {
      conditions.push(eq(links.userId, userId));
    }
    
    // Si no es admin, solo mostrar aprobados
    if (!includePending) {
      conditions.push(eq(links.status, "approved"));
    }
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(links.createdAt));
    }
    return await query.orderBy(desc(links.createdAt));
  }

  async getLink(id: string, userId?: string, includePending: boolean = false): Promise<Link | undefined> {
    const db = this.ensureDb();
    let conditions = [eq(links.id, id)];
    
    if (userId) {
      conditions.push(eq(links.userId, userId));
    }
    
    // Si no es admin, solo mostrar aprobados
    if (!includePending) {
      conditions.push(eq(links.status, "approved"));
    }
    
    const result = await db.select().from(links).where(and(...conditions)).limit(1);
    return result[0];
  }

  async createLink(insertLink: InsertLink & { userId: string; status?: string }): Promise<Link> {
    const db = this.ensureDb();
    // Si no se especifica status, usar 'pending' por defecto (excepto para usuario sistema)
    const status = insertLink.status || (insertLink.userId === USER_IDS.SYSTEM ? CONTENT_STATUS.APPROVED : CONTENT_STATUS.PENDING);
    const result = await db.insert(links).values({
      ...insertLink,
      status,
    }).returning();
    return result[0];
  }

  async updateLink(updateLink: UpdateLink & { userId?: string }): Promise<Link> {
    const db = this.ensureDb();
    const { id, userId, ...data } = updateLink;
    let query = db.update(links).set({ ...data, updatedAt: new Date() }).where(eq(links.id, id));
    if (userId) {
      query = query.where(and(eq(links.id, id), eq(links.userId, userId)));
    }
    const result = await query.returning();
    if (result.length === 0) {
      throw new NotFoundError("Link", id);
    }
    return result[0];
  }

  async deleteLink(id: string, userId?: string): Promise<boolean> {
    const db = this.ensureDb();
    let query = db.delete(links).where(eq(links.id, id));
    if (userId) {
      query = query.where(and(eq(links.id, id), eq(links.userId, userId)));
    }
    const result = await query;
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // ==================== GUIDES ====================

  async getGuides(userId?: string, includePending: boolean = false): Promise<Guide[]> {
    const db = this.ensureDb();
    const query = db.select().from(guides);
    let conditions = [];
    
    if (userId) {
      conditions.push(eq(guides.userId, userId));
    }
    
    // Si no es admin, solo mostrar aprobados
    if (!includePending) {
      conditions.push(eq(guides.status, "approved"));
    }
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(guides.createdAt));
    }
    return await query.orderBy(desc(guides.createdAt));
  }

  async getGuide(id: string, userId?: string, includePending: boolean = false): Promise<Guide | undefined> {
    const db = this.ensureDb();
    let conditions = [eq(guides.id, id)];
    
    if (userId) {
      conditions.push(eq(guides.userId, userId));
    }
    
    // Si no es admin, solo mostrar aprobados
    if (!includePending) {
      conditions.push(eq(guides.status, "approved"));
    }
    
    const result = await db.select().from(guides).where(and(...conditions)).limit(1);
    return result[0];
  }

  async createGuide(insertGuide: InsertGuide & { userId: string; status?: string }): Promise<Guide> {
    const db = this.ensureDb();
    // Si no se especifica status, usar 'pending' por defecto (excepto para usuario sistema)
    const status = insertGuide.status || (insertGuide.userId === USER_IDS.SYSTEM ? CONTENT_STATUS.APPROVED : CONTENT_STATUS.PENDING);
    const result = await db.insert(guides).values({
      ...insertGuide,
      status,
    }).returning();
    return result[0];
  }

  async updateGuide(updateGuide: UpdateGuide & { userId?: string }): Promise<Guide> {
    const db = this.ensureDb();
    const { id, userId, ...data } = updateGuide;
    let query = db.update(guides).set({ ...data, updatedAt: new Date() }).where(eq(guides.id, id));
    if (userId) {
      query = query.where(and(eq(guides.id, id), eq(guides.userId, userId)));
    }
    const result = await query.returning();
    if (result.length === 0) {
      throw new NotFoundError("Guide", id);
    }
    return result[0];
  }

  async deleteGuide(id: string, userId?: string): Promise<boolean> {
    const db = this.ensureDb();
    let query = db.delete(guides).where(eq(guides.id, id));
    if (userId) {
      query = query.where(and(eq(guides.id, id), eq(guides.userId, userId)));
    }
    const result = await query;
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // ==================== ANALYTICS/VIEWS ====================

  async createView(insertView: InsertView): Promise<View> {
    const db = this.ensureDb();
    const result = await db.insert(views).values(insertView).returning();
    return result[0];
  }

  async getViews(page?: string, entityType?: string, days?: number): Promise<View[]> {
    const db = this.ensureDb();
    let query = db.select().from(views);

    const conditions = [];
    if (page) {
      conditions.push(eq(views.page, page));
    }
    if (entityType) {
      conditions.push(eq(views.entityType, entityType));
    }
    if (days) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      conditions.push(gte(views.timestamp, cutoff));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(views.timestamp));
  }

  async getViewsByPage(): Promise<Array<{ page: string; count: number }>> {
    const db = this.ensureDb();
    const result = await db
      .select({
        page: views.page,
        count: count(),
      })
      .from(views)
      .groupBy(views.page);
    return result.map((r: { page: string; count: number | string }) => ({ page: r.page, count: Number(r.count) }));
  }

  async getViewsByEntityType(): Promise<Array<{ entityType: string; count: number }>> {
    const db = this.ensureDb();
    const result = await db
      .select({
        entityType: views.entityType,
        count: count(),
      })
      .from(views)
      .where(sql`${views.entityType} IS NOT NULL`)
      .groupBy(views.entityType);
    return result.map((r: { entityType: string | null; count: number | string }) => ({
      entityType: r.entityType || "",
      count: Number(r.count),
    }));
  }

  async getViewsByDate(days: number = 30): Promise<Array<{ date: string; count: number }>> {
    const db = this.ensureDb();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const result = await db
      .select({
        date: sql<string>`DATE(${views.timestamp})`,
        count: count(),
      })
      .from(views)
      .where(gte(views.timestamp, cutoff))
      .groupBy(sql`DATE(${views.timestamp})`)
      .orderBy(sql`DATE(${views.timestamp})`);

    return result.map((r: { date: string; count: number | string }) => ({ date: r.date, count: Number(r.count) }));
  }

  async getTopPages(limit: number = 10): Promise<Array<{ page: string; count: number }>> {
    const db = this.ensureDb();
    const result = await db
      .select({
        page: views.page,
        count: count(),
      })
      .from(views)
      .groupBy(views.page)
      .orderBy(desc(count()))
      .limit(limit);
    return result.map((r: { page: string; count: number | string }) => ({ page: r.page, count: Number(r.count) }));
  }

  // ==================== AFFILIATES ====================

  async getAffiliates(): Promise<Affiliate[]> {
    const db = this.ensureDb();
    return await db.select().from(affiliates).orderBy(desc(affiliates.createdAt));
  }

  async getAffiliate(id: string): Promise<Affiliate | undefined> {
    const db = this.ensureDb();
    const result = await db.select().from(affiliates).where(eq(affiliates.id, id)).limit(1);
    return result[0];
  }

  async createAffiliate(insertAffiliate: InsertAffiliate): Promise<Affiliate> {
    const db = this.ensureDb();
    const result = await db.insert(affiliates).values(insertAffiliate).returning();
    return result[0];
  }

  async updateAffiliate(updateAffiliate: UpdateAffiliate): Promise<Affiliate> {
    const db = this.ensureDb();
    const { id, ...data } = updateAffiliate;
    const result = await db
      .update(affiliates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(affiliates.id, id))
      .returning();
    if (result.length === 0) {
      throw new Error(`Affiliate with id ${id} not found`);
    }
    return result[0];
  }

  async deleteAffiliate(id: string): Promise<boolean> {
    const db = this.ensureDb();
    // Delete clicks first (cascade should handle this, but being explicit)
    await db.delete(affiliateClicks).where(eq(affiliateClicks.affiliateId, id));
    const result = await db.delete(affiliates).where(eq(affiliates.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // ==================== AFFILIATE CLICKS ====================

  async createAffiliateClick(insertClick: InsertAffiliateClick): Promise<AffiliateClick> {
    const db = this.ensureDb();
    const result = await db.insert(affiliateClicks).values(insertClick).returning();
    return result[0];
  }

  async getAffiliateClicks(affiliateId?: string, days?: number): Promise<AffiliateClick[]> {
    const db = this.ensureDb();
    let query = db.select().from(affiliateClicks);

    const conditions = [];
    if (affiliateId) {
      conditions.push(eq(affiliateClicks.affiliateId, affiliateId));
    }
    if (days) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      conditions.push(gte(affiliateClicks.timestamp, cutoff));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(affiliateClicks.timestamp));
  }

  async getAffiliateClickStats(affiliateId?: string): Promise<{
    totalClicks: number;
    clicksByDay: Array<{ date: string; count: number }>;
  }> {
    const db = this.ensureDb();
    let query = db
      .select({
        date: sql<string>`DATE(${affiliateClicks.timestamp})`,
        count: count(),
      })
      .from(affiliateClicks);

    if (affiliateId) {
      query = query.where(eq(affiliateClicks.affiliateId, affiliateId));
    }

    const result = await query
      .groupBy(sql`DATE(${affiliateClicks.timestamp})`)
      .orderBy(sql`DATE(${affiliateClicks.timestamp})`);

    type ClickStat = { date: string; count: number | string };
    const totalClicks = result.reduce((sum: number, r: ClickStat) => sum + Number(r.count), 0);
    const clicksByDay = result.map((r: ClickStat) => ({ date: r.date, count: Number(r.count) }));

    return { totalClicks, clicksByDay };
  }

  // ==================== AFFILIATE PROGRAMS ====================

  async getAffiliatePrograms(): Promise<AffiliateProgram[]> {
    const db = this.ensureDb();
    return await db.select().from(affiliatePrograms).orderBy(desc(affiliatePrograms.createdAt));
  }

  async getAffiliateProgram(id: string): Promise<AffiliateProgram | undefined> {
    const db = this.ensureDb();
    const result = await db
      .select()
      .from(affiliatePrograms)
      .where(eq(affiliatePrograms.id, id))
      .limit(1);
    return result[0];
  }

  async createAffiliateProgram(insertProgram: InsertAffiliateProgram): Promise<AffiliateProgram> {
    const db = this.ensureDb();

    // Encrypt sensitive fields
    const encryptedIntegrationConfig = insertProgram.integrationConfig
      ? encrypt(insertProgram.integrationConfig)
      : null;
    const encryptedInternalNotes = insertProgram.internalNotes
      ? encrypt(insertProgram.internalNotes)
      : null;

    const programData = {
      ...insertProgram,
      integrationConfig: encryptedIntegrationConfig,
      internalNotes: encryptedInternalNotes,
      status: insertProgram.status || "not_requested",
      priority: insertProgram.priority || "medium",
      integrationType: insertProgram.integrationType || "manual",
      tags: insertProgram.tags || [],
      totalClicks: insertProgram.totalClicks || 0,
      estimatedRevenue: insertProgram.estimatedRevenue || 0,
    };

    const result = await db.insert(affiliatePrograms).values(programData).returning();
    return result[0];
  }

  async updateAffiliateProgram(updateProgram: UpdateAffiliateProgram): Promise<AffiliateProgram> {
    const db = this.ensureDb();
    const existing = await this.getAffiliateProgram(updateProgram.id);
    if (!existing) {
      throw new NotFoundError("Affiliate program", updateProgram.id);
    }

    const { id, ...data } = updateProgram;

    // Encrypt sensitive fields if they're being updated
    const updateData: Partial<typeof affiliatePrograms.$inferInsert> = { ...data };

    if (updateProgram.integrationConfig !== undefined) {
      updateData.integrationConfig = updateProgram.integrationConfig
        ? encrypt(updateProgram.integrationConfig)
        : null;
    }

    if (updateProgram.internalNotes !== undefined) {
      updateData.internalNotes = updateProgram.internalNotes
        ? encrypt(updateProgram.internalNotes)
        : null;
    }

    updateData.updatedAt = new Date();

    const result = await db
      .update(affiliatePrograms)
      .set(updateData)
      .where(eq(affiliatePrograms.id, id))
      .returning();

    if (result.length === 0) {
      throw new NotFoundError("Affiliate program", id);
    }
    return result[0];
  }

  async deleteAffiliateProgram(id: string): Promise<boolean> {
    const db = this.ensureDb();
    const result = await db.delete(affiliatePrograms).where(eq(affiliatePrograms.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
