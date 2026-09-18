export type KtoId =
  | "linkedin"
  | "facebook"
  | "apple";

export type KtoKey =
  | "Linkedin"
  | "Facebook"
  | "Apple";

export enum Kto {
  Linkedin = "linkedin",
  Facebook = "facebook",
  Apple = "apple",
}

export const KTO_CODEPOINTS: { [key in Kto]: string } = {
  [Kto.Linkedin]: "61697",
  [Kto.Facebook]: "61698",
  [Kto.Apple]: "61699",
};
