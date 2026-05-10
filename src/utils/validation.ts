import { CardType, PaymentFormValues } from "@/types";
import { cvvLength } from "./cardUtils";

export interface FormErrors {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: string;
}

export function validateExpiry(value: string): {
  valid: boolean;
  reason?: "invalid" | "expired";
} {
  const match = value.match(/^(\d{2})\/(\d{2})$/);

  if (!match) {
    return {
      valid: false,
      reason: "invalid",
    };
  }

  const month = parseInt(match[1], 10);
  const year = parseInt("20" + match[2], 10);

  // Invalid month
  if (month < 1 || month > 12) {
    return {
      valid: false,
      reason: "invalid",
    };
  }

  const now = new Date();

  // Card valid till end of expiry month
  const expiry = new Date(year, month);

  if (expiry <= now) {
    return {
      valid: false,
      reason: "expired",
    };
  }

  return {
    valid: true,
  };
}

export function validateCardNumber(number: string, cardType: CardType): boolean {
  const raw = number.replace(/\s/g, "");
  const expectedLen = cardType === "amex" ? 15 : 16;
  return raw.length === expectedLen;
}

export function getFormErrors(
  form: PaymentFormValues,
  cardType: CardType
): FormErrors {
  const cvvLen = cvvLength(cardType);

  return {
    cardholderName: !form.cardholderName.trim()
      ? "Cardholder name is required"
      : !/^[a-zA-Z\s]+$/.test(form.cardholderName.trim())
? "Name should contain only letters"
: form.cardholderName.trim().length < 2
? "Enter a valid name"
      : "",

    cardNumber: !form.cardNumber.replace(/\s/g, "")
      ? "Card number is required"
      : !validateCardNumber(form.cardNumber, cardType)
      ? `Must be ${cardType === "amex" ? 15 : 16} digits`
      : "",

   expiry: !form.expiry
  ? "Expiry is required"
  : (() => {
      const result = validateExpiry(form.expiry);

      if (!result.valid) {
        return result.reason === "invalid"
          ? "Invalid expiry date"
          : "Card has expired";
      }

      return "";
    })(),

    cvv: !form.cvv
      ? "CVV is required"
      : form.cvv.length !== cvvLen
      ? `CVV must be ${cvvLen} digits`
      : "",

    amount: !form.amount
      ? "Amount is required"
      : isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0
      ? "Enter a valid amount"
      : "",
  };
}

export function isFormValid(errors: FormErrors): boolean {
  return Object.values(errors).every((e) => !e);
}