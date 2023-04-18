import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport/index';
import config from '../../config';

class MailService {
  transporter: ReturnType<typeof nodemailer.createTransport>;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: false,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword,
      },
    } as SMTPTransport.Options);
  }

  async sendActivationMail({ to, link }: { to: string; link: string }) {
    await this.transporter.sendMail({
      from: config.smtpUser,
      to,
      subject: `Activate profile ${config.apiUrl}`,
      text: '',
      html: `</div>
        Для активации перейдите по ссылке
        <a href="$config.apiUrl}/activate/${link}">${config.apiUrl}/activate/${link}</a>
        </div>`,
    });
  }
}

export default new MailService();
