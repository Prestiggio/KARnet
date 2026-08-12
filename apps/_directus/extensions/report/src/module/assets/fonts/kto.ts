export type KtoId =
  | "school"
  | "sakramenta"
  | "money"
  | "group"
  | "eglizy"
  | "charity";

export type KtoKey =
  | "School"
  | "Sakramenta"
  | "Money"
  | "Group"
  | "Eglizy"
  | "Charity";

export enum Kto {
  School = "school",
  Sakramenta = "sakramenta",
  Money = "money",
  Group = "group",
  Eglizy = "eglizy",
  Charity = "charity",
}

export const KTO_CODEPOINTS: { [key in Kto]: string } = {
  [Kto.School]: "61697",
  [Kto.Sakramenta]: "61698",
  [Kto.Money]: "61699",
  [Kto.Group]: "61700",
  [Kto.Eglizy]: "61701",
  [Kto.Charity]: "61702",
};
