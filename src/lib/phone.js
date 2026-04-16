export const INDIAN_MOBILE_NUMBER_REGEX = /^[6-9]\d{9}$/;

export const INDIAN_MOBILE_NUMBER_ERROR =
  "Enter a valid 10-digit Indian mobile number";

export const normalizeIndianMobileNumber = (value = "") =>
  String(value).replace(/\D/g, "").slice(0, 10);

export const validateIndianMobileNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return true;
  }

  return (
    INDIAN_MOBILE_NUMBER_REGEX.test(String(value)) ||
    INDIAN_MOBILE_NUMBER_ERROR
  );
};

export const handleIndianMobileInput = (event) => {
  event.currentTarget.value = normalizeIndianMobileNumber(
    event.currentTarget.value,
  );
};
