import { toast } from "react-toastify";
import {
  ExtendedProperty,
  FNProperty,
  PhotoProperty,
  TextType,
  URIType,
  URLProperty,
  VCARD,
} from "vcard4";
import { Profile } from "~/types";

export const downloadVCard = (profile: Profile) => {
  const { profileName, lnAddress, imageURL, links } = profile;

  const properties = [];

  try {
    if (profileName) {
      properties.push(new FNProperty([], new TextType(profileName)));
    }

    if (lnAddress) {
      properties.push(
        new ExtendedProperty("X-LIGHTNINGADDRESS", [], new TextType(lnAddress))
      );
    }

    if (imageURL) {
      properties.push(new PhotoProperty([], new URIType(imageURL)));
    }

    links?.forEach((link) => {
      if (link) {
        properties.push(new URLProperty([], new URIType(`https://${link}`)));
      }
    });

    const vc = new VCARD(properties);

    const file = new File([vc.repr()], `${profile.profileName}.vcf`, {
      type: "text/vcard",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(file);

    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
    if (e instanceof Error) toast.error(`Error: ${e.message}`);
  }
};
