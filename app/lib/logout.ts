// app/lib/logout.ts
import { deleteToken, deleteUsername } from "./auth";

 async function logout(navigation?: any) {
  await deleteToken();
  await deleteUsername();
  if (navigation) {
    navigation.replace("/login"); // o como manejes rutas
  }
}
export default logout;