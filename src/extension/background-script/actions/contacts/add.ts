import type { MessageContactAdd, DbContact } from "~/types";

import db from "../../db";

const add = async (message: MessageContactAdd) => {
  const { lnAddress, name, imageURL, links } = message.args;

  let contact = await db.contacts
    .where("lnAddress")
    .equalsIgnoreCase(lnAddress)
    .first();

  if (contact) {
    // when is this block used? (updating here vs updating via the update function)
    // if (!contact.id) return { error: "id is missing" };
    // await db.allowances.update(allowance.id, {
    //   enabled: true,
    //   imageURL: imageURL,
    //   name: name,
    //   remainingBudget: totalBudget,
    //   totalBudget: totalBudget,
    // });
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
    const id = await db.contacts.add(dbContact);
    contact = await db.contacts.get({ id });
  }
  await db.saveToStorage();

  return { data: { contact } };
};

export default add;
