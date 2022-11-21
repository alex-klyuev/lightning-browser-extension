import db from "~/extension/background-script/db";
import { MessageContactGetById, Contact, Payment } from "~/types";

const getById = async (message: MessageContactGetById) => {
  const { id } = message.args;
  const dbContact = await db.contacts.get({ id });

  if (dbContact) {
    const contact: Contact = {
      ...dbContact,
      id,
      payments: [],
      paymentsAmount: 0,
      paymentsCount: 0,
    };

    contact.paymentsCount = await db.payments
      .where("contactId")
      .equals(dbContact.id as number)
      .count();

    const dbPayments = await db.payments
      .where("contactId")
      .equals(dbContact.id as number)
      .reverse()
      .toArray();

    contact.payments = dbPayments.reduce<Payment[]>((acc, dbPayment) => {
      if (!dbPayment?.id) return acc;
      const { id } = dbPayment;
      acc.push({ ...dbPayment, id });
      return acc;
    }, []);

    contact.paymentsAmount = contact.payments
      .map((payment) => {
        if (typeof payment.totalAmount === "string") {
          return parseInt(payment.totalAmount);
        }
        return payment.totalAmount;
      })
      .reduce((previous, current) => previous + current, 0);

    return {
      data: contact,
    };
  } else {
    return { data: { enabled: false } };
  }
};

export default getById;
