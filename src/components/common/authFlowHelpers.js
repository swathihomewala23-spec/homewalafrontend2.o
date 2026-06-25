const OTP_KEYS = ["otp_test", "otp", "otp_code", "code", "verification_code"];

export const extractVerificationCode = (payload) => {
  if (!payload || typeof payload !== "object") return "";

  const candidates = OTP_KEYS.flatMap((key) => [
    payload?.[key],
    payload?.data?.[key],
    payload?.user?.[key],
  ]);

  const directCode = candidates.find((value) => value !== undefined && value !== null && value !== "");
  if (directCode !== undefined) return String(directCode);

  const messageText = [payload?.message, payload?.data?.message]
    .filter(Boolean)
    .join(" ");
  const codeFromMessage = messageText.match(/\b\d{4,8}\b/);

  return codeFromMessage ? codeFromMessage[0] : "";
};

export const getFirstServerError = (serverData, fallbackMessage) => {
  if (Array.isArray(serverData?.errors)) return serverData.errors[0] || fallbackMessage;

  if (serverData?.errors && typeof serverData.errors === "object") {
    const firstErrorKey = Object.keys(serverData.errors)[0];
    const firstError = serverData.errors[firstErrorKey];

    if (Array.isArray(firstError)) return firstError[0] || fallbackMessage;
    if (typeof firstError === "string") return firstError;
  }

  return serverData?.message || serverData?.error || fallbackMessage;
};
