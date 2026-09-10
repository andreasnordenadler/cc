export type PasswordAuthMode = "sign-in" | "sign-up" | "reset";

type PasswordAuthAutoComplete = "username" | "email" | "current-password" | "new-password" | "one-time-code";

type PasswordAuthFieldSemantics = {
  accessibilityLabel: string;
  autoComplete: PasswordAuthAutoComplete;
};

export function getPasswordAuthFieldSemantics(mode: PasswordAuthMode): {
  identifier: PasswordAuthFieldSemantics;
  password: PasswordAuthFieldSemantics;
  verificationCode: PasswordAuthFieldSemantics;
} {
  return {
    identifier: {
      accessibilityLabel: mode === "reset" ? "Account email address" : "Email or username",
      autoComplete: mode === "reset" ? "email" : "username",
    },
    password: {
      accessibilityLabel: mode === "reset" ? "New password" : "Password",
      autoComplete: mode === "sign-in" ? "current-password" : "new-password",
    },
    verificationCode: {
      accessibilityLabel: "Verification code",
      autoComplete: "one-time-code",
    },
  };
}
