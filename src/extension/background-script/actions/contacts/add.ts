import type { MessageContactAdd, DbContact } from "~/types";

import db from "../../db";

const add = async (message: MessageContactAdd) => {
  const { lnAddress, name, imageURL, links } = message.args;

  const contact = await db.contacts
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
    // assign id as next largest id value
    const ids = (await db.contacts.toArray()).map(({ id }) => id);
    const id = ids.length ? Math.max(...ids) + 1 : 1;

    const dbContact: DbContact = {
      createdAt: Date.now().toString(),
      enabled: true,
      lnAddress,
      id,
      imageURL,
      name,
      links,
      lastPaymentAt: 0,
      tag: "",
      favorited: false,
    };
    await db.contacts.add(dbContact);
  }
  await db.saveToStorage();

  return { data: { contact } };
};

export default add;
