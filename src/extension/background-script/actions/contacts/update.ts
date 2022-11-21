import db from "~/extension/background-script/db";
import type { Contact, MessageContactUpdate } from "~/types";

type OptionalPick<T, K extends keyof T> = { [P in K]?: T[P] };

const updateContact = async (message: MessageContactUpdate) => {
  const id = message.args.id;
  if (!id) return { error: "id is missing" };

  const update: OptionalPick<
    Contact,
    "favorited" | "lnAddress" | "name" | "imageURL" | "links"
  > = {};

  if (Object.prototype.hasOwnProperty.call(message.args, "favorited")) {
    update.favorited = message.args.favorited;
  }

  if (Object.prototype.hasOwnProperty.call(message.args, "lnAddress")) {
    update.lnAddress = message.args.lnAddress;
  }

  if (Object.prototype.hasOwnProperty.call(message.args, "name")) {
    update.name = message.args.name;
  }

  if (Object.prototype.hasOwnProperty.call(message.args, "imageURL")) {
    update.imageURL = message.args.imageURL;
  }

  if (Object.prototype.hasOwnProperty.call(message.args, "links")) {
    update.links = message.args.links;
  }

  const updated = await db.contacts.update(id, update);
  await db.saveToStorage();
  return { data: updated };
};

export default updateContact;
