export type KtoId =
  | "linkedin"
  | "facebook";

export type KtoKey =
  | "Linkedin"
  | "Facebook";

export enum Kto {
  Linkedin = "linkedin",
  Facebook = "facebook",
}

export const KTO_CODEPOINTS: { [key in Kto]: string } = {
  [Kto.Linkedin]: "61697",
  [Kto.Facebook]: "61698",
};
