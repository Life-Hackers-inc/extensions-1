import { Action, ActionPanel, Form, showToast, Toast } from "@raycast/api";
import { useState } from "react";
import { useBitwarden } from "~/context/bitwarden";
import useVaultMessages from "~/utils/hooks/useVaultMessages";
import { hashMasterPasswordForReprompting } from "~/utils/passwords";

export type UnlockFormProps = {
  onUnlock: (token: string, hash: string) => void;
};

/** Form for unlocking or logging in to the Bitwarden vault. */
const UnlockForm = (props: UnlockFormProps) => {
  const { onUnlock } = props;
  const bitwarden = useBitwarden();
  const [isLoading, setLoading] = useState(false);
  const { userMessage, serverMessage, shouldShowServer } = useVaultMessages();

  async function onSubmit(values: { password: string }) {
    if (values.password.length == 0) {
      showToast(Toast.Style.Failure, "Failed to unlock vault.", "Missing password.");
      return;
    }
    try {
      setLoading(true);
      const toast = await showToast(Toast.Style.Animated, "Unlocking Vault...", "Please wait.");
      const state = await bitwarden.status();
      if (state.status == "unauthenticated") {
        try {
          await bitwarden.login();
        } catch (error) {
          showToast(
            Toast.Style.Failure,
            "Failed to unlock vault.",
            `Please check your ${shouldShowServer ? "Server URL, " : ""}API Key and Secret.`
          );
          return;
        }
      }
      const sessionToken = await bitwarden.unlock(values.password);
      const passwordHash = await hashMasterPasswordForReprompting(values.password);

      toast.hide();
      onUnlock(sessionToken, passwordHash);
    } catch (error) {
      showToast(Toast.Style.Failure, "Failed to unlock vault", "Check your credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          {!isLoading && (
            <Action.SubmitForm title="Unlock" onSubmit={onSubmit} shortcut={{ key: "enter", modifiers: [] }} />
          )}
        </ActionPanel>
      }
    >
      {shouldShowServer && <Form.Description title="Server URL" text={serverMessage} />}
      <Form.Description title="Vault Status" text={userMessage} />
      <Form.PasswordField autoFocus id="password" title="Master Password" />
    </Form>
  );
};

export default UnlockForm;
