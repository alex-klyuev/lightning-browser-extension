import { EllipsisIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import Button from "@components/Button";
import ContactsTable from "@components/ContactsTable";
import Container from "@components/Container";
import Menu from "@components/Menu";
import PublisherCard from "@components/PublisherCard";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AccountInfoRes } from "~/common/lib/api";
import lnurlLib from "~/common/lib/lnurl";
import utils from "~/common/lib/utils";
import { Contact, Profile } from "~/types";

import { SaveContactActionType } from "../SaveContact";

// Store contacts in an object by id for easy lookup and modification
// from general -> favorites and vice versa
type ContactsHash = Record<number, Contact>;

function ContactsHome() {
  const { t } = useTranslation("translation", {
    keyPrefix: "contacts",
  });
  const { t: tCommon } = useTranslation("common");

  const hasFetchedData = useRef(false);
  const [accountId, setAccountId] = useState<string>();
  const [profile, setProfile] = useState<Profile>();
  const [favorites, setFavorites] = useState<ContactsHash>({});
  const [general, setGeneral] = useState<ContactsHash>({});
  const navigate = useNavigate();

  function navigateToEditProfile() {
    navigate("/editProfile", { state: { accountId, profile } });
  }

  function navigateToContact(id: number) {
    navigate(`/contacts/${id}`);
  }

  function navigateToSaveContact() {
    navigate("/saveContact", { state: { action: SaveContactActionType.ADD } });
  }

  const addToFavorites = async (id: number) => {
    await utils.call("updateContact", {
      id,
      favorited: true,
    });

    const contact = general[id];
    delete general[id];
    favorites[id] = contact;
    setFavorites({ ...favorites });
    setGeneral({ ...general });
  };

  const removeFromFavorites = async (id: number) => {
    await utils.call("updateContact", {
      id,
      favorited: false,
    });

    const contact = favorites[id];
    delete favorites[id];
    general[id] = contact;
    setFavorites({ ...favorites });
    setGeneral({ ...general });
  };

  const favoritesArray = Object.values(favorites);
  const generalArray = Object.values(general);

  const fetchData = useCallback(async () => {
    try {
      const account = await utils.call<AccountInfoRes>("accountInfo");
      setAccountId(account.currentAccountId);

      const { name, profileName, imageURL, links } = account;
      const profile: Profile = { profileName, imageURL, links };
      if (lnurlLib.isLightningAddress(name)) profile.lnAddress = name;
      setProfile(profile);

      const contactResponse = await utils.call<{
        contacts: Contact[];
      }>("listContacts");

      const contacts: Contact[] = contactResponse.contacts.reduce<Contact[]>(
        (acc, contact) => {
          if (!contact?.id || !contact.enabled) return acc;

          const {
            favorited,
            id,
            imageURL,
            lnAddress,
            name,
            payments,
            paymentsAmount,
            paymentsCount,
          } = contact;

          acc.push({
            favorited,
            id,
            imageURL,
            lnAddress,
            name,
            payments,
            paymentsAmount,
            paymentsCount,
          });

          return acc;
        },
        []
      );

      const favoritesHash: ContactsHash = {};
      const generalHash: ContactsHash = {};

      contacts.forEach((contact) => {
        const { id, favorited } = contact;

        if (favorited) {
          favoritesHash[id] = contact;
        } else {
          generalHash[id] = contact;
        }
      });

      setFavorites(favoritesHash);
      setGeneral(generalHash);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  }, []);

  useEffect(() => {
    // Run once.
    if (!hasFetchedData.current) {
      fetchData();
      hasFetchedData.current = true;
    }
  }, [fetchData]);

  const Options = (
    <Menu as="div" className="relative">
      <Menu.Button className="ml-auto flex items-center transition-color duration-200 rounded border-2 border-gray-500 hover:border-black dark:hover:border-white text-gray-500 hover:text-black dark:hover:text-white">
        <EllipsisIcon className="h-6 w-6 rotate-90" />
      </Menu.Button>

      <Menu.List position="right">
        <Menu.ItemButton onClick={() => navigateToEditProfile()}>
          {tCommon("actions.edit")}
        </Menu.ItemButton>

        <Menu.ItemButton
          onClick={() => {
            console.info("placeholder");
          }}
        >
          {tCommon("actions.export")}
        </Menu.ItemButton>
      </Menu.List>
    </Menu>
  );

  return (
    <div>
      <div className="border-b border-gray-200 dark:border-neutral-500">
        <PublisherCard
          title={profile?.profileName || ""}
          image={profile?.imageURL || ""}
          url={profile?.lnAddress || ""}
          customUrl
          isCard={false}
          isSmall={false}
          Options={Options}
        />
      </div>

      <Container>
        {favoritesArray.length > 0 ? (
          <div>
            <h2 className="mt-12 mb-2 text-2xl font-bold dark:test-white">
              {t("favorites.title")}
            </h2>

            <p className="mb-6 text-gray-500 dark:text-neutral-500">
              {t("favorites.description")}
            </p>

            <ContactsTable
              contacts={favoritesArray}
              favorite={true}
              handleFavoriteClick={removeFromFavorites}
              navigateToContact={navigateToContact}
            />
          </div>
        ) : null}

        <div className="py-4 flex justify-between items-center">
          <div>
            <h2 className="mt-12 mb-2 text-2xl font-bold dark:test-white">
              {t("general.title")}
            </h2>

            <p className="mb-6 text-gray-500 dark:text-neutral-500">
              {t("general.description")}
            </p>
          </div>

          <Button
            onClick={navigateToSaveContact}
            label={t("add_contact")}
            primary
          />
        </div>

        {generalArray.length > 0 && (
          <ContactsTable
            contacts={generalArray}
            favorite={false}
            handleFavoriteClick={addToFavorites}
            navigateToContact={navigateToContact}
          />
        )}

        {generalArray.length + favoritesArray.length === 0 && (
          <p className="dark:text-white"> {t("general.no_info")}</p>
        )}
      </Container>
    </div>
  );
}

export default ContactsHome;
