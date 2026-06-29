// ============================================================
// Email Service - SMTP / SendGrid / Amazon SES
// ============================================================

import nodemailer from 'nodemailer';
import { config } from '../../config/index';
import logger from '../../config/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<EmailResponse> {
    try {
      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'M-Plus Matrimony'}" <${process.env.SMTP_FROM_EMAIL || 'noreply@mplus.example.com'}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html)
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Email sent', { to: options.to, subject: options.subject, messageId: info.messageId });

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      logger.error('Email send failed', { error, to: options.to, subject: options.subject });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<EmailResponse> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #570013 0%, #800020 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #fff8ef; }
            .button { display: inline-block; background: #800020; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>M-Plus Matrimony</h1>
            </div>
            <div class="content">
              <h2>Welcome, ${firstName}!</h2>
              <p>Thank you for registering with M-Plus Matrimony. We're excited to help you find your perfect match!</p>
              <p>Your profile is now active and visible to other members.</p>
              <p>To get the best results, we recommend:</p>
              <ul>
                <li>Complete your profile with all details</li>
                <li>Upload clear photos</li>
                <li>Complete Video KYC for verification</li>
                <li>Set your partner preferences</li>
              </ul>
              <a href="${process.env.APP_URL}/dashboard" class="button">Complete Your Profile</a>
              <p>If you need any assistance, our support team is here to help.</p>
              <p>Best regards,<br>The M-Plus Team</p>
            </div>
            <div class="footer">
              <p>This email was sent to ${email}</p>
              <p>M-Plus Matrimony | The Heritage</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to M-Plus Matrimony!',
      html
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<EmailResponse> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #570013 0%, #800020 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #fff8ef; }
            .button { display: inline-block; background: #800020; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>M-Plus Matrimony</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; font-size: 12px;">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul>
                  <li>This link expires in 1 hour</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              <p>If you have any questions, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>This email was sent to ${email}</p>
              <p>M-Plus Matrimony | The Heritage</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset Your M-Plus Matrimony Password',
      html
    });
  }

  /**
   * Send membership confirmation email
   */
  async sendMembershipConfirmation(
    email: string,
    firstName: string,
    planName: string,
    endDate: Date
  ): Promise<EmailResponse> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #570013 0%, #800020 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #fff8ef; }
            .plan-badge { background: #fdc34d; color: #7b5800; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>M-Plus Matrimony</h1>
            </div>
            <div class="content">
              <h2>Congratulations, ${firstName}!</h2>
              <p>Your membership upgrade to <span class="plan-badge">${planName}</span> has been activated!</p>
              <div class="details">
                <p><strong>Plan:</strong> ${planName}</p>
                <p><strong>Valid Until:</strong> ${endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <p>You now have access to:</p>
              <ul>
                <li>Unlimited profile views</li>
                <li>Direct messaging</li>
                <li>Video chat with matches</li>
                <li>Ad-free experience</li>
              </ul>
              <p>Start exploring your matches now!</p>
            </div>
            <div class="footer">
              <p>M-Plus Matrimony | The Heritage</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Welcome to ${planName} - Your Membership is Active!`,
      html
    });
  }

  /**
   * Send OTP verification email (for email verification)
   */
  async sendEmailVerificationOtp(email: string, otp: string): Promise<EmailResponse> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #570013 0%, #800020 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #fff8ef; text-align: center; }
            .otp { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #800020; margin: 30px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>M-Plus Matrimony</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email</h2>
              <p>Your verification code is:</p>
              <div class="otp">${otp}</div>
              <p>This code expires in 10 minutes.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>M-Plus Matrimony | The Heritage</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email - M-Plus Matrimony',
      html
    });
  }

  /**
   * Send bulk newsletter
   */
  async sendBulkNewsletter(
    recipients: { email: string; name: string }[],
    subject: string,
    html: string
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      const personalizedHtml = html.replace('{{name}}', recipient.name);
      const result = await this.sendEmail({
        to: recipient.email,
        subject,
        html: personalizedHtml
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
      }

      // Rate limiting - wait between emails
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    logger.info('Bulk email sent', { sent, failed, total: recipients.length });

    return { sent, failed };
  }

  /**
   * Convert HTML to plain text
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<style>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
