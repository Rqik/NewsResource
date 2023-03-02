import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport/index';

class MailService {
  transporter: ReturnType<typeof nodemailer.createTransport>;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST as string,
      port: process.env.SMTP_PORT as unknown as number,
      secure: false,
      auth: {
        user: process.env.SMTP_USER as string,
        pass: process.env.SMTP_PASSWORD as string,
      },
    } as SMTPTransport.Options);
  }

  async sendActivationMail({ to, link }: { to: string; link: string }) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: `Activate profile ${process.env.API_URL}`,
      text: '',
      html: `</div>
        Для активации перейдите по ссылке
        <a href="${process.env.API_URL}/activate/${link}">${process.env.API_URL}/activate/${link}</a>
        </div>`,
    });
  }
}

export default new MailService();
