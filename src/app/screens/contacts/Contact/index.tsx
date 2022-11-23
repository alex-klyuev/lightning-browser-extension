import { EllipsisIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import Button from "@components/Button";
import Container from "@components/Container";
import Menu from "@components/Menu";
import PublisherCard from "@components/PublisherCard";
import TransactionsTable from "@components/TransactionsTable";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSettings } from "~/app/context/SettingsContext";
import lnurlLib from "~/common/lib/lnurl";
import utils from "~/common/lib/utils";
import { isLNURLDetailsError } from "~/common/utils/typeHelpers";
import { Contact as TContact, Transaction } from "~/types";

import { SaveContactActionType } from "../SaveContact";

dayjs.extend(relativeTime);

function Contact() {
  const { t } = useTranslation("translation", {
    keyPrefix: "contacts",
  });
  const { t: tCommon } = useTranslation("common");

  const {
    isLoading: isLoadingSettings,
    settings,
    getFormattedFiat,
  } = useSettings();

  const hasFetchedData = useRef(false);
  const [contact, setContact] = useState<TContact>();
  const [payments, setPayments] = useState<Transaction[]>();
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      if (id) {
        const contact = await utils.call<TContact>("getContactById", {
          id: parseInt(id),
        });

        setContact(contact);

        const payments: Transaction[] = contact.payments.map((payment) => ({
          ...payment,
          id: `${payment.id}`,
          type: "sent",
          date: dayjs(payment.createdAt).fromNow(),
          title: payment.name || payment.description,
          publisherLink: payment.location,
        }));

        for (const payment of payments) {
          const totalAmountFiat = settings.showFiat
            ? await getFormattedFiat(payment.totalAmount)
            : "";
          payment.totalAmountFiat = totalAmountFiat;
        }

        setPayments(payments);
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  }, [id, settings.showFiat, getFormattedFiat]);

  useEffect(() => {
    // Run once.
    if (!isLoadingSettings && !hasFetchedData.current) {
      fetchData();
      hasFetchedData.current = true;
    }
  }, [fetchData, isLoadingSettings]);

  const navigateToLnurlPay = async () => {
    const lnAddress = contact?.lnAddress as string;
    let lnurlDetails;

    try {
      setLoading(true);

      lnurlDetails = await lnurlLib.getDetails(lnAddress);

      if (isLNURLDetailsError(lnurlDetails)) {
        toast.error(lnurlDetails.reason);
        return;
      }

      navigate("/lnurlPay", {
        state: {
          args: {
            lnurlDetails,
            lnAddress,
          },
        },
      });
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const Options = (
    <Menu as="div" className="relative">
      <Menu.Button className="ml-auto flex items-center transition-color duration-200 rounded border-2 border-gray-500 hover:border-black dark:hover:border-white text-gray-500 hover:text-black dark:hover:text-white">
        <EllipsisIcon className="h-6 w-6 rotate-90" />
      </Menu.Button>

      <Menu.List position="right">
        <Menu.ItemButton
          onClick={() => {
            navigate("/saveContact", {
              state: {
                action: SaveContactActionType.EDIT,
                contact,
              },
            });
          }}
        >
          {tCommon("actions.edit")}
        </Menu.ItemButton>

        <Menu.ItemButton
          danger
          onClick={async () => {
            if (window.confirm(t("contact.confirm_remove"))) {
              try {
                await utils.call("deleteContact", {
                  id: contact?.id,
                });
                navigate("/contacts", { replace: true });
              } catch (e) {
                console.error(e);
                if (e instanceof Error) toast.error(`Error: ${e.message}`);
              }
            }
          }}
        >
          {tCommon("actions.remove")}
        </Menu.ItemButton>
      </Menu.List>
    </Menu>
  );

  return (
    <div>
      <div className="border-b border-gray-200 dark:border-neutral-500">
        <PublisherCard
          title={contact?.name || ""}
          image={contact?.imageURL || ""}
          url={contact?.lnAddress}
          customUrl
          urlClick={navigateToLnurlPay}
          isCard={false}
          isSmall={false}
          Options={Options}
        />
      </div>

      <Container>
        <div className="flex justify-between items-center pt-8 pb-4">
          <dl>
            <dt className="text-sm font-medium text-gray-500">
              {payments && payments?.length > 0
                ? t("contact.transaction_history.title")
                : t("contact.transaction_history.no_payments")}
            </dt>
          </dl>

          <Button
            type="submit"
            label={t("contact.pay")}
            primary
            loading={loading}
            disabled={loading}
            onClick={navigateToLnurlPay}
          />
        </div>

        <div>
          {payments && payments?.length > 0 && (
            <TransactionsTable transactions={payments} />
          )}
        </div>
      </Container>
    </div>
  );
}

export default Contact;
