import type { ComponentType } from "react";
import type { InvitationViewModel, WeddingStyleId } from "../types";
import { RusticInvitation } from "./RusticInvitation";
import { BohoInvitation } from "./BohoInvitation";
import { MinimalInvitation } from "./MinimalInvitation";
import { VintageInvitation } from "./VintageInvitation";
import { ElegantInvitation } from "./ElegantInvitation";
import { FloralRomanceInvitation } from "./FloralRomanceInvitation";
import { BotanicalWreathInvitation } from "./BotanicalWreathInvitation";
import { DustyBlueInvitation } from "./DustyBlueInvitation";
import { GreenGoldInvitation } from "./GreenGoldInvitation";
import { GeometricFloralInvitation } from "./GeometricFloralInvitation";

export const WEDDING_TEMPLATE_COMPONENTS: Record<
  WeddingStyleId,
  ComponentType<{ data: InvitationViewModel }>
> = {
  rustic: RusticInvitation,
  boho: BohoInvitation,
  minimal: MinimalInvitation,
  vintage: VintageInvitation,
  elegant: ElegantInvitation,
  floral: FloralRomanceInvitation,
  wreath: BotanicalWreathInvitation,
  dusty: DustyBlueInvitation,
  greengold: GreenGoldInvitation,
  geometric: GeometricFloralInvitation,
};

export {
  RusticInvitation,
  BohoInvitation,
  MinimalInvitation,
  VintageInvitation,
  ElegantInvitation,
  FloralRomanceInvitation,
  BotanicalWreathInvitation,
  DustyBlueInvitation,
  GreenGoldInvitation,
  GeometricFloralInvitation,
};
