import { CaretRightIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { StarIcon } from "@components/icons";
import { useTranslation } from "react-i18next";
import { Contact } from "~/types";

type Props = {
  contacts: Contact[];
  favorite: boolean;
  handleFavoriteClick: (id: number) => void;
  navigateToContact: (id: number) => void;
};

export default function ContactsTable({
  contacts,
  favorite,
  handleFavoriteClick,
  navigateToContact,
}: Props) {
  const { t: tComponents } = useTranslation("components", {
    keyPrefix: "contacts_table",
  });
  const { t: tCommon } = useTranslation("common");

  return (
    <div className="shadow overflow-hidden rounded-lg">
      <table className="min-w-full">
        <tbody className="bg-white divide-y divide-gray-200 dark:divide-white/10 dark:bg-surface-02dp">
          {contacts.map((contact) => (
            <tr
              key={contact.id}
              className="cursor-pointer hover:bg-gray-50 transition duration-200 dark:hover:bg-neutral-800"
            >
              <td className="px-4 py-6 whitespace-nowrap">
                <StarIcon
                  filled={favorite}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavoriteClick(contact.id);
                  }}
                />
              </td>
              <td
                className="cursor-pointer px-4 py-6 whitespace-nowrap"
                onClick={() => navigateToContact(contact.id)}
              >
                <div className="flex items-center">
                  <div className="shrink-0">
                    <img
                      className="h-12 w-12 object-cover rounded-full shadow-lg"
                      src={"assets/icons/alby_icon_yellow_48x48.png"}
                      //   add alt
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "assets/icons/alby_icon_yellow_48x48.png";
                      }}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-lg inline mr-2 dark:text-white">
                        {contact.name}
                      </p>
                      {/** Badge can be included if budget added for creator use case */}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-neutral-400">
                      {contact.lnAddress} • {contact.paymentsCount}{" "}
                      {tComponents("payments")}{" "}
                      {contact.paymentsAmount > 0 && (
                        <span>
                          ({contact.paymentsAmount}{" "}
                          {tCommon("sats", { count: contact.paymentsAmount })})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </td>
              <td
                className="cursor-pointer w-10"
                onClick={() => navigateToContact(contact.id)}
              >
                <CaretRightIcon className="h-6 w-6 text-gray-500" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
