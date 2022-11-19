import Container from "@components/Container";
import PublisherCard from "@components/PublisherCard";
import TransactionsTable from "@components/TransactionsTable";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSettings } from "~/app/context/SettingsContext";
import utils from "~/common/lib/utils";
import { Contact as TContact, Transaction } from "~/types";

dayjs.extend(relativeTime);

function Contact() {
  const { t } = useTranslation("translation", {
    keyPrefix: "contacts",
  });
  const {
    isLoading: isLoadingSettings,
    settings,
    getFiatValue,
  } = useSettings();

  const hasFetchedData = useRef(false);
  const [contact, setContact] = useState<TContact | undefined>();
  const [payments, setPayments] = useState<Transaction[] | undefined>();
  const { id } = useParams();

  const fetchData = useCallback(async () => {
    try {
      if (id) {
        const response = await utils.call<TContact>("getContactById", {
          id: parseInt(id),
        });
        setContact(response);

        const payments: Transaction[] = response.payments.map((payment) => ({
          ...payment,
          id: `${payment.id}`,
          type: "sent",
          date: dayjs(payment.createdAt).fromNow(),
          title: payment.name || payment.description,
          publisherLink: payment.location,
        }));

        for (const payment of payments) {
          const totalAmountFiat = settings.showFiat
            ? await getFiatValue(payment.totalAmount)
            : "";
          payment.totalAmountFiat = totalAmountFiat;
        }
        setPayments(payments);
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  }, [id, settings.showFiat, getFiatValue]);

  useEffect(() => {
    // Run once.
    if (!isLoadingSettings && !hasFetchedData.current) {
      fetchData();
      hasFetchedData.current = true;
    }
  }, [fetchData, isLoadingSettings]);

  return (
    <div>
      <div className="border-b border-gray-200 dark:border-neutral-500">
        <PublisherCard
          title={contact?.name || ""}
          image={contact?.imageURL || ""}
          url={contact?.lnAddress}
          isCard={false}
          isSmall={false}
        />
      </div>

      {contact && (
        <Container>
          <div className="flex justify-between items-center pt-8 pb-4">
            <dl>
              <dt className="text-sm font-medium text-gray-500">
                {t("contact.transaction_history.title")}
              </dt>

              {/** Total sats sent / budget / etc. would go here */}
            </dl>

            {/** Edit / Delete contact functionality */}
          </div>

          <div>
            {payments && payments?.length > 0 && (
              <TransactionsTable transactions={payments} />
            )}
          </div>
        </Container>
      )}
    </div>
  );
}

export default Contact;
