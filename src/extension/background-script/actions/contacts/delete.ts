import db from "~/extension/background-script/db";
import type { DbContact, MessageContactDelete } from "~/types";

// Since we index contacts by id, we don't want to fully delete the entry
// Delete all data other than the lnAddress and set enabled to false
const deleteContact = async (message: MessageContactDelete) => {
  const id = message.args.id;

  if (!id) return { error: "id is missing" };

  const { lnAddress } = (await db.contacts
    .where("id")
    .equals(id)
    .first()) as DbContact;

  await db.contacts.put({
    id,
    lnAddress,
    enabled: false,
    lastPaymentAt: 0,
  });

  await db.saveToStorage();

  return { data: true };
};

export default deleteContact;
