import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <div className="container-custom py-20">
      <h1 className="text-display-2 font-heading text-wood-dark mb-6">
        {t("hero.title")}
      </h1>
      <p className="text-body-lg text-wood-muted mb-8">{t("hero.subtitle")}</p>
      <div className="flex gap-4">
        <button className="btn-primary btn-lg">{t("hero.cta")}</button>
        <button className="btn-outline btn-lg">{t("hero.ctaSecondary")}</button>
      </div>
    </div>
  );
}
