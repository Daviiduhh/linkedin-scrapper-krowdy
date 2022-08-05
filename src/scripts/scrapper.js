import axios from "axios";
import { profileSelectors } from "../config/scrapperSelectors";
import { $, $$ } from "../utils/selectors";

function getToken(token) {
  return document.cookie
    .split(";")
    .find((cookie) => cookie.includes(token))
    .replace(token + "=", "")
    .replaceAll('"', "")
    .trim();
}

async function getContactInfo() {
  try {
    const token = getToken("JSESSIONID");

    const [contactInfoName] =
      $(profileSelectors.contactInfo).href.match(/in\/.+\/o/g) ?? [];
    const contactInfoUrl = `https://www.linkedin.com/voyager/api/identity/profiles${contactInfoName.slice(
      2,
      -2
    )}/profileContactInfo`;

    const {
      data: { data },
    } = await axios.get(contactInfoUrl, {
      headers: {
        accept: "application/vnd.linkedin.normalized+json+2.1",
        "csrf-token": token,
      },
    });

    return data;
  } catch (error) {
    console.log(error);
  }
}

function getSpecificInfo(selector) {
  const elements = $$(selector);
  const titles = [];

  elements.forEach((element) => {
    const elementTitle = $("span[aria-hidden]", element);
    titles.push(elementTitle.textContent);
  });

  return titles;
}

async function scrap() {
  const name = $(profileSelectors.name).textContent;
  const experienceTitles = getSpecificInfo(
    profileSelectors.experiencesElements
  );
  const educationTitles = getSpecificInfo(profileSelectors.educationElements);
  const contactInfo = await getContactInfo();

  const profile = {
    name,
    contactInfo,
    experienceTitles,
    educationTitles,
  };

  console.log(profile);
}

scrap()