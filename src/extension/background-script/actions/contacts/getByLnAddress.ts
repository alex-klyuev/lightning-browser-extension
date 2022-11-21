import db from "~/extension/background-script/db";
import { MessageContactGetByLnAddress } from "~/types";

const getByLnAddress = async (message: MessageContactGetByLnAddress) => {
  const { lnAddress } = message.args;
  return { data: { contact: await db.contacts.get({ lnAddress }) } };
};

export default getByLnAddress;
