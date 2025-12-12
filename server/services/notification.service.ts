/**
 * Notification Service
 * Handles notifications for deployments, rollbacks, and alerts
 */

import { logger } from "../utils/logger";
import type { DeploymentInfo } from "./deployment.service";

export interface NotificationConfig {
  slack?: {
    webhookUrl: string;
    enabled: boolean;
  };
  email?: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    from: string;
    to: string[];
    enabled: boolean;
  };
  discord?: {
    webhookUrl: string;
    enabled: boolean;
  };
  telegram?: {
    botToken: string;
    chatId: string;
    enabled: boolean;
  };
}

class NotificationService {
  private config: NotificationConfig = {};

  constructor() {
    this.loadConfig();
  }

  /**
   * Load notification configuration from environment
   */
  private loadConfig() {
    this.config = {
      slack: {
        webhookUrl: process.env.SLACK_WEBHOOK_URL || "",
        enabled: process.env.SLACK_ENABLED === "true",
      },
      email: {
        smtpHost: process.env.SMTP_HOST || "",
        smtpPort: parseInt(process.env.SMTP_PORT || "587"),
        smtpUser: process.env.SMTP_USER || "",
        smtpPassword: process.env.SMTP_PASSWORD || "",
        from: process.env.SMTP_FROM || "",
        to: (process.env.SMTP_TO || "").split(",").filter(Boolean),
        enabled: process.env.EMAIL_ENABLED === "true",
      },
      discord: {
        webhookUrl: process.env.DISCORD_WEBHOOK_URL || "",
        enabled: process.env.DISCORD_ENABLED === "true",
      },
      telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN || "",
        chatId: process.env.TELEGRAM_CHAT_ID || "",
        enabled: process.env.TELEGRAM_ENABLED === "true",
      },
    };
  }

  /**
   * Send deployment notification
   */
  async notifyDeployment(deployment: DeploymentInfo, event: "started" | "completed" | "failed" | "rolled_back") {
    const emoji = {
      started: "🚀",
      completed: "✅",
      failed: "❌",
      rolled_back: "⏪",
    }[event];

    const title = `${emoji} Deployment ${event}`;
    const message = this.formatDeploymentMessage(deployment, event);

    await Promise.all([
      this.sendSlack(title, message, deployment.status === "failed" ? "danger" : "good"),
      this.sendEmail(title, message),
      this.sendDiscord(title, message),
      this.sendTelegram(`${title}\n\n${message}`),
    ]);
  }

  /**
   * Send alert notification
   */
  async notifyAlert(severity: "info" | "warning" | "error", title: string, message: string) {
    const emoji = {
      info: "ℹ️",
      warning: "⚠️",
      error: "🔴",
    }[severity];

    const fullTitle = `${emoji} ${title}`;

    await Promise.all([
      this.sendSlack(fullTitle, message, severity === "error" ? "danger" : severity === "warning" ? "warning" : "good"),
      this.sendEmail(fullTitle, message),
      this.sendDiscord(fullTitle, message),
      this.sendTelegram(`${fullTitle}\n\n${message}`),
    ]);
  }

  /**
   * Format deployment message
   */
  private formatDeploymentMessage(deployment: DeploymentInfo, event: string): string {
    return `
**Deployment ${event.toUpperCase()}**

- **ID**: ${deployment.id}
- **Commit**: ${deployment.commit}
- **Branch**: ${deployment.ref}
- **User**: ${deployment.user}
- **Time**: ${deployment.timestamp.toISOString()}
- **Status**: ${deployment.status}
- **Health Check**: ${deployment.healthCheckPassed ? "✅ Passed" : "❌ Failed"}
    `.trim();
  }

  /**
   * Send Slack notification
   */
  private async sendSlack(title: string, message: string, color: "good" | "warning" | "danger" = "good") {
    if (!this.config.slack?.enabled || !this.config.slack?.webhookUrl) {
      return;
    }

    try {
      const response = await fetch(this.config.slack.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attachments: [
            {
              color,
              title,
              text: message,
              footer: "CodeKit Pro CI/CD",
              ts: Math.floor(Date.now() / 1000),
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.statusText}`);
      }
    } catch (error) {
      logger.error("Failed to send Slack notification", { error });
    }
  }

  /**
   * Send Email notification
   */
  private async sendEmail(title: string, message: string) {
    if (!this.config.email?.enabled || !this.config.email?.to.length) {
      return;
    }

    // Note: This is a placeholder. In production, use a proper email library like nodemailer
    logger.info("Email notification (not implemented)", { title, to: this.config.email.to });
    // TODO: Implement email sending with nodemailer or similar
  }

  /**
   * Send Discord notification
   */
  private async sendDiscord(title: string, message: string) {
    if (!this.config.discord?.enabled || !this.config.discord?.webhookUrl) {
      return;
    }

    try {
      const response = await fetch(this.config.discord.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title,
              description: message,
              color: 0x6366f1, // CodeKit Pro purple
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Discord API error: ${response.statusText}`);
      }
    } catch (error) {
      logger.error("Failed to send Discord notification", { error });
    }
  }

  /**
   * Send Telegram notification
   */
  private async sendTelegram(text: string) {
    if (!this.config.telegram?.enabled || !this.config.telegram?.botToken || !this.config.telegram?.chatId) {
      return;
    }

    try {
      const url = `https://api.telegram.org/bot${this.config.telegram.botToken}/sendMessage`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: this.config.telegram.chatId,
          text,
          parse_mode: "Markdown",
        }),
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`);
      }
    } catch (error) {
      logger.error("Failed to send Telegram notification", { error });
    }
  }
}

export const notificationService = new NotificationService();

