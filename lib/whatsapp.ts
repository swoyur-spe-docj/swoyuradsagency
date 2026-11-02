import type { OrderView, Settings } from './types';
import { inr } from './format';

export function waLink(number: string, text: string): string {
  const digits = number.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : '';
}

export function templates(o: OrderView, s: Settings): { label: string; text: string }[] {
  const payLines = [
    s.upiId && `UPI: ${s.upiId}`,
    s.bankName && `Bank: ${s.bankName}`,
    s.accountHolder && `Account name: ${s.accountHolder}`,
    s.accountNumber && `Account number: ${s.accountNumber}`,
    s.ifsc && `IFSC: ${s.ifsc}`,
  ].filter(Boolean) as string[];
  const pay = payLines.length ? `Payment details:\n${payLines.join('\n')}` : 'We will share the payment details shortly.';

  return [
    {
      label: 'Order received',
      text: `Hi ${o.customerName}, thank you for choosing ${s.companyName}. Your order ${o.orderNumber} for the ${o.snapshot.name} package (${inr(o.priceAmount)}) is received. We will contact you shortly to confirm.`,
    },
    {
      label: 'Order confirmed and payment details',
      text: `Hi ${o.customerName}, your order ${o.orderNumber} (${o.snapshot.name}, ${inr(o.priceAmount)}) is confirmed.\n\n${pay}\n\nPlease share the payment reference once paid.`,
    },
    {
      label: 'Payment reminder',
      text: `Hi ${o.customerName}, a gentle reminder: a balance of ${inr(o.balance)} is pending for order ${o.orderNumber}. Please let us know once paid.`,
    },
    {
      label: 'Client activated',
      text: `Hi ${o.customerName}, payment received for order ${o.orderNumber}. Your ${o.snapshot.name} campaign is now active. Thank you for trusting ${s.companyName}.`,
    },
  ];
}
