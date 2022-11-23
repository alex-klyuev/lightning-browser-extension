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
import utils from "~/common/lib/utils";
import { Profile } from "~/types";

import { DEFAULT_PROFILE_IMAGE } from "../constants";

type EditProfileLocationState = {
  accountId: string;
  profile: Profile;
};

function EditProfile() {
  const { t } = useTranslation("translation", { keyPrefix: "add_contact" });
  const { t: tCommon } = useTranslation("common");

  const state = useLocation().state as EditProfileLocationState;
  const { accountId, profile } = state;

  const initImageURL = profile.imageURL || "";
  const initProfileName = profile.profileName || "";
  const initLinks = profile.links || [""];

  const [imageURL, setImageURL] = useState<string>(initImageURL);
  const [profileName, setProfileName] = useState<string>(initProfileName);
  const [links, setLinks] = useState<string[]>(initLinks);
  const navigate = useNavigate();

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanLinks: string[] = [];
    links.forEach((link) => {
      link = link.trim();
      if (link) cleanLinks.push(link);
    });

    try {
      await utils.call("editAccount", {
        id: accountId,
        profileName,
        imageURL,
        links,
      });
    } catch (e) {
      // Image URL throws an error; ignore for hackathon (image should be stored elsewhere)
    }

    navigate("/contacts");
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <Header
        title={t("title")}
        headerLeft={
          <IconButton
            onClick={() => navigate("/contacts")}
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
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
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
              label={tCommon("actions.save")}
              primary
              halfWidth
            />
          </div>
        </Container>
      </form>
    </div>
  );
}

export default EditProfile;
