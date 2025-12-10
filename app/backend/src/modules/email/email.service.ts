import nodemailer from "nodemailer";
import { env } from "../../lib/env.js";
import { EmailModel } from "./email.model.js";
import PDFDocument from "pdfkit";

export abstract class EmailService {
  static async createPdf(
    body: EmailModel.createPdfBody,
  ): Promise<EmailModel.createPdfResponse> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: "A6", margin: 20 });
        const chunks: Uint8Array[] = [];

        const pad = (n: number) => String(n).padStart(2, "0");
        const formatDate = (iso?: string) => {
          if (!iso) return undefined;
          const d = new Date(iso);
          if (Number.isNaN(d.getTime())) return undefined;
          const day = pad(d.getDate());
          const month = pad(d.getMonth() + 1);
          const year = String(d.getFullYear());
          const hours = pad(d.getHours());
          const minutes = pad(d.getMinutes());
          const seconds = pad(d.getSeconds());
          return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        };

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => {
          const result = Buffer.concat(chunks);
          const base64 = result.toString("base64");
          const filename = `ticket-${body.ticketId || Date.now()}.pdf`;
          resolve({ filename, content: base64 });
        });

        doc.fontSize(20).text("TravelHub - Ticket", { align: "center" });
        doc.moveDown();

        doc.fontSize(10).text(`Ticket ID: ${body.ticketId}`);
        if (body.orderId) doc.text(`Order ID: ${body.orderId}`);
        if (body.passengerName) doc.text(`Passenger: ${body.passengerName}`);
        if (body.licensePlate) doc.text(`Bus license plate: ${body.licensePlate}`);
        if (body.seat) doc.text(`Seat: ${body.seat}`);
        if (body.tripId) doc.text(`Trip ID: ${body.tripId}`);
        if (body.fromCity) doc.text(`From: ${body.fromCity}`);
        if (body.toCity) doc.text(`To: ${body.toCity}`);
        if (body.departure) doc.text(`Departure: ${formatDate(body.departure)}`);
        if (body.arrival) doc.text(`Arrival: ${formatDate(body.arrival)}`);
        if (body.price !== undefined) doc.text(`Price: ${body.price}`);

        doc.moveDown();
        doc.text("Thank you for booking with TravelHub.");

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  static async sendMail(body: EmailModel.sendBody) {

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: `${env.EMAIL_SENDER}`,
          pass: env.GOOGLE_APP_PASSWORD,
        },
      });

      const info = await transporter.sendMail({
        from: `"TravelHub"<${env.EMAIL_SENDER}>`,
        to: `${body.email}`,
        subject: `${body.subject}`,
        text: body.text,
        html: body.html,
        attachments: [
          {
            filename: body.filename,
            content: body.content,
            encoding: "base64",
            contentType: "application/pdf",
          },
        ],
      });
      return info;

  }
}
