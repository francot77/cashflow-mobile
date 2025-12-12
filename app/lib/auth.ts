// app/lib/auth.ts
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";
const USERNAME_KEY = "auth_username";

async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function deleteToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function saveUsername(username: string) {
  await SecureStore.setItemAsync(USERNAME_KEY, username);
}

async function getUsername(): Promise<string | null> {
  return SecureStore.getItemAsync(USERNAME_KEY);
}

async function deleteUsername(): Promise<void> {
  await SecureStore.deleteItemAsync(USERNAME_KEY);
}

async function clearAuth(): Promise<void> {
  await Promise.all([deleteToken(), deleteUsername()]);
}
export { clearAuth, deleteToken, deleteUsername, getToken, getUsername, saveToken, saveUsername };

