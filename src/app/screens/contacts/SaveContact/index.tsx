import { CaretLeftIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import Button from "@components/Button";
import Container from "@components/Container";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import TextField from "@components/form/TextField";
import { PlusIcon, MinusIcon } from "@components/icons";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import lnurlLib from "~/common/lib/lnurl";
import utils from "~/common/lib/utils";
import { Contact, DbContact } from "~/types";

import { DEFAULT_PROFILE_IMAGE } from "../constants";

export const enum SaveContactActionType {
  ADD = "ADD",
  EDIT = "EDIT",
}

type SaveContactLocationState = {
  action: SaveContactActionType;
  contact: Contact;
};

function SaveContact() {
  const { t } = useTranslation("translation", { keyPrefix: "add_contact" });
  const { t: tCommon } = useTranslation("common");

  const state = useLocation().state as SaveContactLocationState;
  const { action, contact } = state;

  let contactId: number;
  let initImageURL = "";
  let initName = "";
  let initLnAddress = "";
  let initLinks = [""];

  switch (action) {
    case SaveContactActionType.EDIT: {
      const { id, imageURL, name, lnAddress, links } = contact;

      contactId = id;
      initImageURL = imageURL || initImageURL;
      initName = name || initName;
      initLnAddress = lnAddress || initLnAddress;
      initLinks = links?.length ? links : initLinks;

      break;
    }

    case SaveContactActionType.ADD: {
      // used when adding contact from payment
      if (contact?.lnAddress) initLnAddress = contact.lnAddress;

      break;
    }
  }

  const [imageURL, setImageURL] = useState<string>(initImageURL);
  const [name, setName] = useState<string>(initName);
  const [lnAddress, setLnAddress] = useState<string>(initLnAddress);
  const [links, setLinks] = useState<string[]>(initLinks);
  const navigate = useNavigate();

  const submitButtonMap = {
    [SaveContactActionType.ADD]: tCommon("actions.add") as string,
    [SaveContactActionType.EDIT]: tCommon("actions.save") as string,
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files) {
      const imageFile = files[0];
      if (!imageFile) return;
      setImageURL(await readFile(imageFile));
    }
  };

  const removeLink = (index: number) => {
    links.splice(index, 1);
    setLinks([...links]);
  };

  const addLink = () => {
    links.push("");
    setLinks([...links]);
  };

  const handleLinkChange = (index: number, value: string) => {
    links[index] = value;
    setLinks([...links]);
  };

  const isLnAddressValid = async (lnAddress: string) => {
    // empty strings
    if (!lnAddress) {
      toast.error("Must include Lightning Address.");
      return false;
    }

    // valid LN address
    if (!lnurlLib.isLightningAddress(lnAddress)) {
      toast.error("Not a valid Lightning Address.");
      return false;
    }

    // check if LN already exists in database
    const { contact } = await utils.call<{ contact: DbContact }>(
      "getContactByLnAddress",
      { lnAddress }
    );
    if (!contact) return true;

    // is valid to add/edit if it's not enabled (ignore if it's the current contact)
    const { id, enabled } = contact;

    if (enabled && id !== contactId) {
      toast.error("Lightning Address already associated with other contact.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanLinks: string[] = [];
    links.forEach((link) => {
      link = link.trim();
      if (link) cleanLinks.push(link);
    });

    const cleanLnAddress = lnAddress.trim();

    const isValid = await isLnAddressValid(cleanLnAddress);
    if (!isValid) return;

    switch (action) {
      case SaveContactActionType.ADD: {
        const { contact } = await utils.call<{ contact: DbContact }>(
          "addContact",
          {
            name: name.trim(),
            lnAddress: cleanLnAddress,
            imageURL,
            links: cleanLinks,
          }
        );

        contactId = contact.id as number;

        break;
      }

      case SaveContactActionType.EDIT: {
        await utils.call<{ contact: DbContact }>("updateContact", {
          id: contactId,
          name: name.trim(),
          lnAddress: cleanLnAddress,
          imageURL,
          links: cleanLinks,
        });

        break;
      }
    }

    // if we are in the popup
    if (window.location.pathname !== "/options.html") {
      utils.openPage(`options.html#/contacts/${contactId}`);
      // close the popup
      window.close();
    } else {
      navigate(`/contacts/${contactId}`);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <Header
        title={t("title")}
        headerLeft={
          <IconButton
            onClick={() => navigate(-1)}
            icon={<CaretLeftIcon className="w-4 h-4" />}
          />
        }
      />

      <form onSubmit={handleSubmit} className="h-full">
        <Container justifyBetween maxWidth="sm">
          <div className="flex justify-center">
            <label htmlFor="file-upload" className="cursor-pointer">
              <img
                className="m-2 mt-8 shrink-0 bg-white border-solid border-2 border-white object-cover rounded-lg shadow-2xl w-20 h-20"
                src={imageURL || DEFAULT_PROFILE_IMAGE}
              />
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          <div className="pt-4">
            <TextField
              id="name"
              label={t("name")}
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <TextField
              id="lightning-address"
              label={t("lightning_address")}
              value={lnAddress}
              onChange={(e) => setLnAddress(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <span className="font-medium text-gray-800 dark:text-white">
              {t("links")}
            </span>
            {links.map((link, index) => (
              <div key={index} className="flex content-center">
                {index === links.length - 1 ? (
                  <PlusIcon
                    className="h-10 mt-1 mr-1 cursor-pointer flex content-center"
                    onClick={addLink}
                  />
                ) : (
                  <MinusIcon
                    className="h-10 mt-1 mr-1 cursor-pointer flex content-center"
                    onClick={() => removeLink(index)}
                  />
                )}
                <div className="grow">
                  <TextField
                    id={`link-${index}`}
                    label=""
                    value={link}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 mb-4 flex justify-center">
            <Button
              type="submit"
              label={submitButtonMap[action]}
              primary
              halfWidth
            />
          </div>
        </Container>
      </form>
    </div>
  );
}

export default SaveContact;
