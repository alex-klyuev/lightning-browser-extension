import { CaretLeftIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import Button from "@components/Button";
import Container from "@components/Container";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import TextField from "@components/form/TextField";
import { PlusIcon, MinusIcon } from "@components/icons";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const DEFAULT_IMAGE = "assets/icons/profile.jpeg";

function AddContact() {
  const { t } = useTranslation("translation", { keyPrefix: "add_contact" });

  const [image, setImage] = useState<string>(DEFAULT_IMAGE);
  const [name, setName] = useState<string>("");
  const [lnAddress, setLnAddress] = useState<string>("");
  const [links, setLinks] = useState<string[]>(["test1", "test2", ""]);
  const navigate = useNavigate();

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files) {
      const img = files[0];
      if (!img) return;
      setImage(URL.createObjectURL(img));
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

  // const handleSubmit = () => {};

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <Header
        title={t("title")}
        headerLeft={
          <IconButton
            onClick={() => navigate("/")}
            icon={<CaretLeftIcon className="w-4 h-4" />}
          />
        }
      />

      <form /** onSubmit={handleSubmit} */ className="h-full">
        <Container justifyBetween maxWidth="sm">
          <div className="flex justify-center">
            <label htmlFor="file-upload" className="cursor-pointer">
              <img
                className="m-2 mt-8 shrink-0 bg-white border-solid border-2 border-white object-cover rounded-lg shadow-2xl w-20 h-20"
                src={image}
              />
              <input
                id="file-upload"
                name="file-upload"
                type="file"
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
            <Button type="submit" label={t("add")} primary halfWidth />
          </div>
        </Container>
      </form>
    </div>
  );
}

export default AddContact;
