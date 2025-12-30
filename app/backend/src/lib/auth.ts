import { env } from "./env.js";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";
import { EmailService } from "../modules/email/email.service.js";
import { EmailModel } from "../modules/email/email.model.js";

export const AuthService = betterAuth({
  database: new Pool({
    connectionString: env.DB_CONNECTION_STRING,
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const mailBody = {
        email: user.email,
        subject: `TravelHub Ticket Reset your password`,
        text: `Click the link to reset your password: ${url}`,
      };
      await EmailService.sendMail(mailBody as EmailModel.sendBody);
    },
    onPasswordReset: async ({ user }) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  trustedOrigins: [
    "http://localhost:*",
    "https://hcmus-awad-busticket.vercel.app",
  ],
  plugins: [admin()],
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
    },
  },
});

export const auth = AuthService;
