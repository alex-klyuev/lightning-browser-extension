import { CaretRightIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { SunIcon as SunIconFilled } from "@bitcoin-design/bitcoin-icons-react/filled";
import { SunIcon as SunIconOutline } from "@bitcoin-design/bitcoin-icons-react/outline";
import { useTranslation } from "react-i18next";
import { Contact } from "~/types";

type Props = {
  contacts: Contact[];
  starFill: boolean;
  handleStarClick: (id: number) => void;
};

export default function ContactsTable({
  contacts,
  starFill,
  handleStarClick,
}: Props) {
  const { t: tComponents } = useTranslation("components", {
    keyPrefix: "contacts_table",
  });
  const { t: tCommon } = useTranslation("common");

  const SunIcon = starFill ? SunIconFilled : SunIconOutline;

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
                <SunIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStarClick(contact.id);
                  }}
                />
              </td>
              <td className="cursor-pointer px-4 py-6 whitespace-nowrap">
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
                      {/** what is "Badge", any relevancy to contacts? Not included in design */}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-neutral-400">
                      {contact.host} • {contact.paymentsCount}{" "}
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
              <td className="cursor-pointer w-10">
                <CaretRightIcon className="h-6 w-6 text-gray-500" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
