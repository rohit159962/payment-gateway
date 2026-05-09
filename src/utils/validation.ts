import { CardType, PaymentFormValues } from "@/types";
import { cvvLength } from "./cardUtils";

export interface FormErrors {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: string;
}

export function validateExpiry(value: string): boolean {
  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = parseInt(match[1]);
  const year = parseInt("20" + match[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const expiry = new Date(year, month - 1, 1);
  return expiry > new Date(now.getFullYear(), now.getMonth(), 1);
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
      : !/^\d{2}\/\d{2}$/.test(form.expiry)
      ? "Use MM/YY format"
      : !validateExpiry(form.expiry)
      ? "Card has expired"
      : "",

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