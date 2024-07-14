export enum BbMessageType {
  UpdateFn = "UPDATE_FN",
}

export type BbMessage = {
  type: BbMessageType.UpdateFn;
  body: string;
};
