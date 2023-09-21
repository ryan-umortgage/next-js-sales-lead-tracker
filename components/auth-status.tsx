import { unstable_getServerSession } from "next-auth/next";
import SignOut from "./sign-out";

export default async function AuthStatus() {
  const session = await unstable_getServerSession();
  return (
    <div className="absolute w-full flex flex-col items-center">
      {session && (
        <>
          <div>
            <p className="text-sm">Signed in as {session.user?.email}</p>
          </div>
          <div className="mb-4">
            <SignOut />
          </div>
        </>
      )}
    </div>
  );
}
