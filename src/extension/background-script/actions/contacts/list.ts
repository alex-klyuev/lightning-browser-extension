import db from "~/extension/background-script/db";
import type { MessageContactList, Contact } from "~/types";

const list = async (message: MessageContactList) => {
  const dbContacts = await db.contacts
    .toCollection()
    .reverse()
    .sortBy("lastPaymentAt");

  const contacts: Contact[] = [];

  for (const dbContact of dbContacts) {
    if (dbContact.id) {
      const { id } = dbContact;
      const tmpContact: Contact = {
        ...dbContact,
        id,
        payments: [],
        paymentsAmount: 0,
        paymentsCount: 0,
      };

      tmpContact.paymentsCount = await db.payments
        .where("contactId")
        .equals(tmpContact.id)
        .count();

      const payments = await db.payments
        .where("contactId")
        .equals(tmpContact.id)
        .reverse()
        .toArray();

      tmpContact.paymentsAmount = payments
        .map((payment) => {
          if (typeof payment.totalAmount === "string") {
            return parseInt(payment.totalAmount);
          }
          return payment.totalAmount;
        })
        .reduce((previous, current) => previous + current, 0);

      contacts.push(tmpContact);
    }
  }

  return {
    data: {
      contacts,
    },
  };
};

export default list;
