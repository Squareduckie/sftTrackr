import { sha256 } from "js-sha256";

import store from "../store/index";
import { CONSTANTS } from "./constants";
import { passwordFormActions } from "../store/password-form-slice";

const isDigit = (c) => {
  return /^[0-9]$/.test(c);
};

const isAlphabet = (c) => {
  return /^[a-zA-Z]+$/.test(c);
};

const mapDigit = (c, i) => {
  const alphabets = "abcdefghijklmnopqrstuvwxyz";
  const index = (c.charCodeAt(0) + i) % alphabets.length;
  return alphabets[index];
};

const convertToOnlyAlphabets = (hashedPassword) => {
  let onlyAlphabetsPassword = "";
  for (let i = 0; i < hashedPassword.length; i++) {
    if (isDigit(hashedPassword[i])) {
      onlyAlphabetsPassword += mapDigit(hashedPassword[i], i);
    } else {
      onlyAlphabetsPassword += hashedPassword[i];
    }
  }
  return onlyAlphabetsPassword;
};

const addCapitalLetters = (hashedPassword) => {
  let passwordWithCaps = "";
  let hasLetters = false;
  let flag = true;
  for (let i = 0; i < hashedPassword.length; i++) {
    if (isAlphabet(hashedPassword[i])) {
      hasLetters = true;
      if (flag) {
        passwordWithCaps += hashedPassword[i].toUpperCase();
      } else {
        passwordWithCaps += hashedPassword[i];
      }
      flag = !flag;
    } else {
      passwordWithCaps += hashedPassword[i];
    }
  }

  if (!hasLetters) {
    passwordWithCaps[0] = mapDigit(passwordWithCaps[0], 0).toUpperCase();
  }

  return passwordWithCaps;
};

const mapToSpecialCharacter = (c) => {
  const specialCharacters = "~`!@#$%^&*()_-+={[}]|\\:;\"'<,>.?/";
  const index = c.charCodeAt(0) % specialCharacters.length;
  return specialCharacters[index];
};

const addSpecialCharacter = (hashedPassword) => {
  const indexToAdd = hashedPassword[0].charCodeAt(0) & hashedPassword.length;
  let passwordWithSpecialChar = hashedPassword.split("");
  passwordWithSpecialChar[indexToAdd] = mapToSpecialCharacter(
    passwordWithSpecialChar[indexToAdd]
  );
  return passwordWithSpecialChar.join("");
};

export const generatePassword = (values) => {
  const fullPassword =
    values?.domainName + values?.password + values?.iteration.toString();
  let hashedPassword = sha256(fullPassword).substring(0, 12);

  if (
    values?.passwordFormat.includes(
      CONSTANTS.PASSWORD_FORM.PASSWORD_FORMATS.ONLY_LETTERS
    )
  ) {
    hashedPassword = convertToOnlyAlphabets(hashedPassword);
  }

  if (
    values?.passwordFormat.includes(
      CONSTANTS.PASSWORD_FORM.PASSWORD_FORMATS.CAPTIAL_LETTERS
    )
  ) {
    hashedPassword = addCapitalLetters(hashedPassword);
  }

  if (
    values?.passwordFormat.includes(
      CONSTANTS.PASSWORD_FORM.PASSWORD_FORMATS.ADD_SPECIAL_CHARACTER
    )
  ) {
    hashedPassword = addSpecialCharacter(hashedPassword);
  }

  // console.log(hashedPassword);
  store.dispatch(passwordFormActions.updateGeneratedPassword(hashedPassword));
};
