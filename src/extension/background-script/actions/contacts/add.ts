import type { MessageContactAdd, DbContact } from "~/types";

import db from "../../db";

const add = async (message: MessageContactAdd) => {
  const { lnAddress, name, imageURL, links } = message.args;

  // Payments to lnAddresses are automatically added to contacts db.
  // Search for that first.
  let id: number;
  let contact = await db.contacts
    .where("lnAddress")
    .equalsIgnoreCase(lnAddress)
    .first();

  if (contact) {
    id = await db.contacts.update(contact.id as number, {
      createdAt: Date.now().toString(),
      enabled: true,
      imageURL,
      name,
      links,
      tag: "",
      favorited: false,
    });
  } else {
    const dbContact: DbContact = {
      createdAt: Date.now().toString(),
      enabled: true,
      lnAddress,
      imageURL,
      name,
      links,
      lastPaymentAt: 0,
      tag: "",
      favorited: false,
    };
    id = await db.contacts.add(dbContact);
  }

  contact = await db.contacts.get({ id });

  await db.saveToStorage();

  return { data: { contact } };
};

export default add;
