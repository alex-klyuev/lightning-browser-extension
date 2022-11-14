import ContactsTable from "@components/ContactsTable";
import Container from "@components/Container";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import utils from "~/common/lib/utils";
import { Contact } from "~/types";

// Store contacts in an object by id for easy lookup and modification
// from general -> favorites and vice versa
type ContactsHash = Record<number, Contact>;

// Dummy data to seed database
const seedData = [
  {
    id: 0,
    lnAddress: "alby1@getalby.com",
    name: "Alby 1",
    imageURL: "assets/icons/alby_icon_yellow_48x48.png",
    links: [],
  },
  {
    id: 1,
    lnAddress: "alby2@getalby.com",
    name: "Alby 2",
    imageURL: "assets/icons/alby_icon_yellow_48x48.png",
    links: [],
  },
];

(async () => {
  await Promise.all([
    ...seedData.map((contact) => utils.call("addContact", contact)),
  ]);
})();

function Contacts() {
  const { t } = useTranslation("translation", {
    keyPrefix: "contacts",
  });

  // TODO: add db index to indicate if favorite or not (favorited?)
  const [favorites, setFavorites] = useState<ContactsHash>({});
  const [general, setGeneral] = useState<ContactsHash>({});
  const navigate = useNavigate();

  function navigateToContact(id: number) {
    navigate(`/contacts/${id}`);
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

  async function fetchData() {
    try {
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
  }

  useEffect(() => {
    fetchData();
  }, []);

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
            favorite={true}
            handleFavoriteClick={removeFromFavorites}
            navigateToContact={navigateToContact}
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
          favorite={false}
          handleFavoriteClick={addToFavorites}
          navigateToContact={navigateToContact}
        />
      ) : (
        <p className="dark:text-white"> {t("general.no_info")}</p>
      )}
    </Container>
  );
}

export default Contacts;