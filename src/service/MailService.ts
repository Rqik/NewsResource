class MailService {
  static async sendActivationMail({ to, link }: { to: string; link: string }) {
    console.log(to, link);
  }
}

export default MailService;
