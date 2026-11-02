// Developer credit and client wishes shown in the admin panel.
// Set DEVELOPER_NAME (and optionally DEVELOPER_URL) in the environment to show the credit.
// Defaults to 'Swoyur'. Set DEVELOPER_NAME to change it, or set it to a space to hide the credit.
export const DEVELOPER = {
  name: (process.env.DEVELOPER_NAME || 'Swoyur').trim(),
  url: (process.env.DEVELOPER_URL || '').trim(),
};

// Message shown on the admin dashboard for the client's new work.
// {company} is replaced with the company name from Settings.
export const CLIENT_WISH = {
  title: 'Wishing you a great new chapter',
  text: '{company}, here is to your new work. Every campaign you launch from here is a fresh chance to be remembered. The whole team is cheering for you.',
};

export function wishFor(companyName: string) {
  return CLIENT_WISH.text.replace('{company}', companyName || 'Team');
}
