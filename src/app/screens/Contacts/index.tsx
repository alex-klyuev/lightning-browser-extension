import Container from "@components/Container";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Contact } from "~/types";

import ContactsTable from "../ContactsTable";

// Store contacts in an object by id for easy lookup and modification
// from general -> favorites and vice versa
type ContactHash = Record<number, Contact>;

const dummyFavorites: ContactHash = {};
const dummyGeneral: ContactHash = {
  0: {
    id: 0,
    host: "alby1@getalby.com",
    name: "Alby 1",
    paymentsCount: 6,
    paymentsAmount: 1050,
  },
  1: {
    id: 1,
    host: "alby2@getalby.com",
    name: "Alby 2",
    paymentsCount: 8,
    paymentsAmount: 860,
  },
};

function Contacts() {
  const { t } = useTranslation("translation", {
    keyPrefix: "contacts",
  });

  const [favorites, setFavorites] = useState<ContactHash>(dummyFavorites);
  const [general, setGeneral] = useState<ContactHash>(dummyGeneral);

  const addToFavorites = (id: number) => {
    const contact = general[id];
    delete general[id];
    favorites[id] = contact;
    setFavorites({ ...favorites });
    setGeneral({ ...general });
  };

  const removeFromFavorites = (id: number) => {
    const contact = favorites[id];
    delete favorites[id];
    general[id] = contact;
    setFavorites({ ...favorites });
    setGeneral({ ...general });
  };

  const favoritesArray = Object.values(favorites);
  const generalArray = Object.values(general);

  return (
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
            starFill={true}
            handleStarClick={removeFromFavorites}
          />
        </div>
      ) : null}

      <h2 className="mt-12 mb-2 text-2xl font-bold dark:test-white">
        {t("general.title")}
      </h2>

      <p className="mb-6 text-gray-500 dark:text-neutral-500">
        {t("general.description")}
      </p>

      {generalArray.length > 0 ? (
        <ContactsTable
          contacts={generalArray}
          starFill={false}
          handleStarClick={addToFavorites}
        />
      ) : (
        <p className="dark:text-white"> {t("general.no_info")}</p>
      )}
    </Container>
  );
}

export default Contacts;
