import { getOutlets } from "@/lib/actions/outlets";
import OutletsPage from "./outlets-page";

export default async function Page() {
  const outlets = await getOutlets();
  return <OutletsPage outlets={outlets} />;
}
