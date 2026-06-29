// ============================================================
// Invoice Service - PDF Generation
// ============================================================

import PDFDocument from 'pdfkit';
import { db } from '../../config/database';
import { config } from '../../config/index';
import { log } from '../../config/logger';

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate?: Date;

  customer: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };

  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;

  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;

  payment: {
    id: string;
    method: string;
    transactionId?: string;
    date: Date;
  };

  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    gstin?: string;
    pan?: string;
  };
}

export class InvoiceService {
  private companyInfo = {
    name: config.COMPANY_NAME || 'M-Plus Matrimony',
    address: config.COMPANY_ADDRESS || 'Mumbai, Maharashtra, India',
    phone: config.COMPANY_PHONE || '+91 98765 43210',
    email: config.COMPANY_EMAIL || 'support@mplus.example.com',
    gstin: config.COMPANY_GSTIN,
    pan: config.COMPANY_PAN
  };

  async generateInvoice(paymentId: string): Promise<Buffer> {
    const payment = await this.getPaymentData(paymentId);

    return this.createPDF(payment);
  }

  private async getPaymentData(paymentId: string): Promise<InvoiceData> {
    const payment = await db('payments')
      .where('id', paymentId)
      .first();

    if (!payment) {
      throw new Error('Payment not found');
    }

    const user = await db('users')
      .where('id', payment.user_id)
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    const plan = await db('membership_plans')
      .where('id', payment.plan_id)
      .first();

    const invoiceNumber = `INV-${new Date().getFullYear()}-${paymentId.substring(0, 8).toUpperCase()}`;

    return {
      invoiceNumber,
      invoiceDate: new Date(payment.created_at),
      customer: {
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Customer',
        email: user.email || '',
        phone: user.phone
      },
      items: [
        {
          description: plan?.name || 'Membership Plan',
          quantity: 1,
          unitPrice: parseFloat(payment.base_amount),
          total: parseFloat(payment.base_amount)
        }
      ],
      subtotal: parseFloat(payment.base_amount),
      taxRate: config.GST_RATE || 0.18,
      taxAmount: parseFloat(payment.gst_amount) || 0,
      total: parseFloat(payment.amount),
      currency: payment.currency || 'INR',
      payment: {
        id: payment.id,
        method: payment.payment_method,
        transactionId: payment.razorpay_payment_id,
        date: new Date(payment.paid_at || payment.created_at)
      },
      company: this.companyInfo
    };
  }

  private createPDF(data: InvoiceData): Buffer {
    return new Promise((resolve, reject) => {
      try {
        const chunks: Buffer[] = [];
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: `Invoice ${data.invoiceNumber}`,
            Author: data.company.name,
            Subject: 'Membership Payment Invoice'
          }
        });

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const pageWidth = doc.page.width - 100;
        let y = 50;

        doc
          .fillColor('#570013')
          .fontSize(24)
          .font('Helvetica-Bold')
          .text(data.company.name, { align: 'center' });

        y = doc.y + 10;
        doc
          .fillColor('#333333')
          .fontSize(10)
          .font('Helvetica')
          .text(data.company.address, { align: 'center' })
          .text(`Phone: ${data.company.phone}`, { align: 'center' })
          .text(`Email: ${data.company.email}`, { align: 'center' });

        if (data.company.gstin) {
          doc.text(`GSTIN: ${data.company.gstin}`, { align: 'center' });
        }

        y = doc.y + 30;

        doc
          .fillColor('#570013')
          .fontSize(16)
          .font('Helvetica-Bold')
          .text('INVOICE', { align: 'right' });

        doc
          .fillColor('#333333')
          .fontSize(10)
          .font('Helvetica')
          .text(`Invoice #: ${data.invoiceNumber}`, { align: 'right' })
          .text(`Date: ${this.formatDate(data.invoiceDate)}`, { align: 'right' })
          .text(`Payment ID: ${data.payment.id.substring(0, 8)}`, { align: 'right' });

        y = doc.y + 30;

        doc
          .fillColor('#570013')
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Bill To:');

        doc
          .fillColor('#333333')
          .fontSize(10)
          .font('Helvetica')
          .text(data.customer.name)
          .text(data.customer.email);

        if (data.customer.phone) {
          doc.text(data.customer.phone);
        }

        y = doc.y + 30;

        this.drawTable(doc, y, data);

        y = doc.y + 30;

        this.drawTotals(doc, y, data);

        y = doc.y + 50;

        doc
          .fillColor('#666666')
          .fontSize(9)
          .font('Helvetica')
          .text('Terms & Conditions:', 50, y)
          .text('1. This is a digital invoice generated automatically.', 50, y + 15)
          .text('2. GST is applicable as per Indian tax laws.', 50, y + 30)
          .text('3. For queries, contact support@mplus.example.com', 50, y + 45);

        doc
          .fontSize(9)
          .fillColor('#999999')
          .text('Thank you for choosing M-Plus Matrimony!', 50, doc.page.height - 100, { align: 'center' })
          .text(`Generated on ${new Date().toISOString()}`, { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    }) as unknown as Buffer;
  }

  private drawTable(doc: PDFKit.PDFDocument, y: number, data: InvoiceData): void {
    const tableTop = y;
    const tableWidth = doc.page.width - 100;

    doc
      .rect(50, tableTop, tableWidth, 25)
      .fill('#570013');

    doc
      .fillColor('#ffffff')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Description', 55, tableTop + 8)
      .text('Qty', 350, tableTop + 8, { width: 50, align: 'center' })
      .text('Price', 400, tableTop + 8, { width: 80, align: 'right' })
      .text('Total', 480, tableTop + 8, { width: 65, align: 'right' });

    let rowY = tableTop + 25;

    data.items.forEach((item, index) => {
      const isEven = index % 2 === 0;

      doc
        .rect(50, rowY, tableWidth, 20)
        .fill(isEven ? '#f9f9f9' : '#ffffff');

      doc
        .fillColor('#333333')
        .fontSize(10)
        .font('Helvetica')
        .text(item.description, 55, rowY + 5, { width: 280 })
        .text(item.quantity.toString(), 350, rowY + 5, { width: 50, align: 'center' })
        .text(`₹${item.unitPrice.toFixed(2)}`, 400, rowY + 5, { width: 80, align: 'right' })
        .text(`₹${item.total.toFixed(2)}`, 480, rowY + 5, { width: 65, align: 'right' });

      rowY += 20;
    });

    doc.y = rowY;
  }

  private drawTotals(doc: PDFKit.PDFDocument, y: number, data: InvoiceData): void {
    const rightX = 450;
    const labelX = 320;
    const valueX = 450;

    doc
      .fillColor('#333333')
      .fontSize(10)
      .font('Helvetica')
      .text('Subtotal:', labelX, y)
      .text(`₹${data.subtotal.toFixed(2)}`, valueX, y, { width: 95, align: 'right' });

    y += 20;

    doc
      .text(`GST (${(data.taxRate * 100).toFixed(0)}%):`, labelX, y)
      .text(`₹${data.taxAmount.toFixed(2)}`, valueX, y, { width: 95, align: 'right' });

    y += 25;

    doc
      .rect(50, y - 5, doc.page.width - 100, 30)
      .fill('#570013');

    doc
      .fillColor('#ffffff')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Total:', labelX, y)
      .text(`${data.currency} ${data.total.toFixed(2)}`, valueX, y, { width: 95, align: 'right' });

    doc.y = y + 35;
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }
}

export const invoiceService = new InvoiceService();
