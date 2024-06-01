import { farms_backend } from "../config/api-config";

export default function HeaderFarms(token_x) {
  // Secret Token
  const token = farms_backend.api_key;

  if (token_x) {
    return { 'x-api-key': token, 'x-access-token': token_x };
  } else {
    return { 'x-api-key': token };
  }
}