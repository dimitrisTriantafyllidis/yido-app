"use client";

import type { CSSProperties } from "react";
import type { InvitationViewModel } from "./types";
import { VideoSection } from "./sections/VideoSection";
import { CoupleGallery } from "./sections/CoupleGallery";
import { WeddingCast } from "./sections/WeddingCast";
import { WishesSection } from "./sections/WishesSection";
import { QuizSection } from "./sections/QuizSection";
import { ThankYouVendors } from "./sections/ThankYouVendors";

import { PERSON_ROLE_LABELS, parseQuizQuestions, parseVendors } from "./extra-section-config";

export interface ExtraSectionColors {
  bg: string;
  card: string;
  accent: string;
  text: string;
  muted: string;
  border: string;
}

interface InvitationExtraSectionsProps {
  data: InvitationViewModel;
  colors: ExtraSectionColors;
  fontDisplay: CSSProperties;
  fontLabel: CSSProperties;
  fontSerif?: CSSProperties;
  posterUrl?: string;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function InvitationExtraSections({
  data,
  colors,
  fontDisplay,
  fontLabel,
  fontSerif,
  posterUrl,
}: InvitationExtraSectionsProps) {
  const videoPoster = posterUrl || data.coverImageUrl || data.gallery[0]?.url || "";
  const fonts = { fontDisplay, fontLabel, fontSerif };
  const quizQuestions = parseQuizQuestions(data.sections.quiz.config);
  const vendors = parseVendors(data.sections.vendors.config);

  return (
    <>
      {data.sections.video.enabled && videoPoster ? (
        <VideoSection
          posterUrl={videoPoster}
          videoId={asString(data.sections.video.config.youtubeId)}
          title={asString(data.sections.video.config.title) || data.title}
          subtitle={asString(data.sections.video.config.subtitle) || "WEDDING FILM"}
          colors={colors}
          {...fonts}
        />
      ) : null}

      {data.sections.coupleGallery.enabled && data.gallery.length > 0 ? (
        <CoupleGallery
          photos={data.gallery.map((g) => g.url)}
          colors={colors}
          title={asString(data.sections.coupleGallery.config.title)}
          subtitle={asString(data.sections.coupleGallery.config.subtitle)}
          {...fonts}
        />
      ) : null}

      {data.sections.weddingCast.enabled ? (
        <WeddingCast
          members={data.persons.map((p) => ({
            role: PERSON_ROLE_LABELS[p.role] ?? p.role,
            name: p.displayName,
            photo: p.photoUrl || "",
          }))}
          colors={colors}
          title={
            asString(data.sections.weddingCast.config.title) ||
            asString(data.sections.weddingCast.config.heading)
          }
          subtitle={
            asString(data.sections.weddingCast.config.subtitle) ||
            asString(data.sections.weddingCast.config.label)
          }
          {...fonts}
        />
      ) : null}

      {data.sections.wishes.enabled ? (
        <WishesSection
          colors={colors}
          title={
            asString(data.sections.wishes.config.title) ||
            asString(data.sections.wishes.config.heading)
          }
          subtitle={asString(data.sections.wishes.config.subtitle)}
          initialWishes={data.wishes}
          slug={data.isPreview ? undefined : data.slug}
          {...fonts}
        />
      ) : null}

      {data.sections.quiz.enabled ? (
        <QuizSection
          colors={colors}
          coupleNames={data.title}
          questions={quizQuestions}
          title={
            asString(data.sections.quiz.config.title) ||
            asString(data.sections.quiz.config.heading)
          }
          subtitle={asString(data.sections.quiz.config.subtitle)}
          {...fonts}
        />
      ) : null}

      {data.sections.vendors.enabled ? (
        <ThankYouVendors
          vendors={vendors}
          colors={colors}
          title={
            asString(data.sections.vendors.config.title) ||
            asString(data.sections.vendors.config.heading)
          }
          subtitle={asString(data.sections.vendors.config.subtitle)}
          {...fonts}
        />
      ) : null}
    </>
  );
}
