export const INDIAN_MOBILE_NUMBER_REGEX = /^[6-9]\d{9}$/;

export const INDIAN_MOBILE_NUMBER_ERROR =
  "Phone must be a valid 10-digit Indian mobile number";

export const isIndianMobileNumber = (value) => {
  if (value === undefined || value === null) {
    return false;
  }

  return INDIAN_MOBILE_NUMBER_REGEX.test(String(value).trim());
};
