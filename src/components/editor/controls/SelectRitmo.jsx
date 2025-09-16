"use client";
import { useTranslation } from "react-i18next";

const SelectRitmo = ({ rhythm, setRhythm }) => {
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="text-sm font-bold uppercase text-accent mb-2">
        {t("editor.controls.rhythm.title")}
      </h3>
      <select
        value={rhythm}
        onChange={(e) => setRhythm(Number(e.target.value))}
        className="w-full p-2 bg-bg-secondary border border-primary rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <option value={1}>{t("editor.controls.rhythm.options.semibreve", { value: 1 })}</option>
        <option value={2}>{t("editor.controls.rhythm.options.minima", { value: 2 })}</option>
        <option value={3}>{t("editor.controls.rhythm.options.tercina", { value: 3 })}</option>
        <option value={4}>{t("editor.controls.rhythm.options.seminima", { value: 4 })}</option>
        <option value={6}>{t("editor.controls.rhythm.options.sextina", { value: 6 })}</option>
        <option value={8}>{t("editor.controls.rhythm.options.colcheia", { value: 8 })}</option>
      </select>
    </div>
  );
};

export default SelectRitmo;
