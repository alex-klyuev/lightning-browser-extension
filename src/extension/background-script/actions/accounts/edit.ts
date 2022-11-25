import state from "~/extension/background-script/state";
import type { MessageAccountEdit } from "~/types";

const edit = async (message: MessageAccountEdit) => {
  const accounts = state.getState().accounts;
  const accountId = message.args.id;

  if (accountId in accounts) {
    const { name, profileName, imageURL, links } = message.args;

    if (name !== undefined) accounts[accountId].name = name;
    if (profileName !== undefined)
      accounts[accountId].profileName = profileName;
    if (imageURL !== undefined) accounts[accountId].imageURL = imageURL;
    if (links !== undefined) accounts[accountId].links = links;

    state.setState({ accounts });
    // make sure we immediately persist the updated accounts
    await state.getState().saveToStorage();
    return {};
  } else {
    return {
      error: `Account not found: ${accountId}`,
    };
  }
};

export default edit;
