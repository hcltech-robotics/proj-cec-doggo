export interface MessageWithImage {
  text: string;
  image: string | null;
}

export interface MessageError {
  message: string;
  type: string;
  param: unknown;
  code: string;
}
