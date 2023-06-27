import nodemailer from 'nodemailer';

import MailService from './mail.service';

jest.mock('nodemailer');

describe('MailService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendActivationMail', () => {
    const mockSendMail = jest.fn();

    beforeEach(() => {
      nodemailer.createTransport.mockReturnValue({
        sendMail: mockSendMail,
      });
    });

    it('should send activation mail', async () => {
      const mockTo = 'test@example.com';
      const mockLink = 'activation-link';

      await MailService.sendActivationMail({ to: mockTo, link: mockLink });

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: expect.any(String),
        port: expect.any(Number),
        secure: false,
        auth: {
          user: expect.any(String),
          pass: expect.any(String),
        },
      });
      expect(mockSendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        to: mockTo,
        subject: expect.any(String),
        text: expect.any(String),
        html: expect.any(String),
      });
    });
  });
});
