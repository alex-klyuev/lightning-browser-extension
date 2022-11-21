import db from "../db";

const persistSuccessfullPayment = async (message, data) => {
  const name = data?.origin?.name;
  const host = data?.origin?.host;
  const location = data?.origin?.location;
  const lnAddress = data?.origin?.lnAddress;
  const paymentResponse = data.response;
  const route = paymentResponse.data.route;
  const { total_amt, total_fees } = route;

  const payment = {
    host,
    location,
    name,
    description: data.details.description,
    preimage: paymentResponse.data.preimage,
    paymentHash: paymentResponse.data.paymentHash,
    destination: data.details.destination,
    totalAmount: total_amt,
    totalFees: total_fees,
    createdAt: Date.now(),
  };

  // For payments to LN addresses, check if a contact already exists.
  // If not, add to contacts database as well.
  if (lnAddress) {
    let contactId;
    const contact = await db.contacts
      .where("lnAddress")
      .equalsIgnoreCase(lnAddress)
      .first();

    if (contact) {
      contactId = contact.id;
    } else {
      contactId = await db.contacts.add({ lnAddress, enabled: false });
    }

    await db.contacts.update(contactId, { lastPaymentAt: Date.now() });

    payment.contactId = contactId;
  }

  await db.payments.add(payment);
  await db.saveToStorage();
  console.info(`Persisted payment ${paymentResponse.data.paymentHash}`);
  return true;
};

export { persistSuccessfullPayment };
