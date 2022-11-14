import db from "~/extension/background-script/db";
import type { Contact, MessageContactUpdate } from "~/types";

type OptionalPick<T, K extends keyof T> = { [P in K]?: T[P] };

const updateContact = async (message: MessageContactUpdate) => {
  const id = message.args.id;
  if (!id) return { error: "id is missing" };

  const update: OptionalPick<Contact, "favorited"> = {};

  if (Object.prototype.hasOwnProperty.call(message.args, "favorited")) {
    update.favorited = message.args.favorited;
  }
  const updated = await db.contacts.update(id, update);
  await db.saveToStorage();
  return { data: updated };
};

export default updateContact;
