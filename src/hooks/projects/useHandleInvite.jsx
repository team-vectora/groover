import { useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config";
import { useTranslation } from "react-i18next";

export default function useHandleInvite() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleInvite = async (inviteId, response, onComplete) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/invitations/${inviteId}/respond`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ response }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error
            ? t(`backend_errors.${data.error}`, { defaultValue: t('errors.generic_error') })
            : t('errors.generic_error')
        );
      }

      toast.success(
        t(response === 'accept' ? 'notifications.invite_accepted_toast' : 'notifications.invite_rejected_toast')
      );

      if (onComplete) onComplete();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { handleInvite, loading };
}
