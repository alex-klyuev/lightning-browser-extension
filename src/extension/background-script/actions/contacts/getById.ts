import { MessageContactGetById, Contact, Payment } from "../../../../types";
import db from "../../db";

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
      .where("lnAddress")
      .equalsIgnoreCase(dbContact.lnAddress)
      .count();

    const dbPayments = await db.payments
      .where("lnAddress")
      .equalsIgnoreCase(dbContact.lnAddress)
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
    // (since this is based off of allowance)
    // even if it's not enabled, wouldn't it still be stored in db?
    // confused by if (dbAllowance)
    return { data: { enabled: false } };
  }
};

export default getById;
