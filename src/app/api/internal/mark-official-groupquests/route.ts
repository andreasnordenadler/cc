import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStoredGroupQuests } from "@/lib/groupquests";

const maintenanceToken = "TeOR3jPHI19vdm7gJVs3RRxXL-jMiJ3NFxh74ng70kY";
const officialQuestIds = new Set([
  "first-blood-knights-before-coffee--2otf8j",
  "no-castle-night-difficult-55c21j",
  "the-royal-self-sabotage-gauntlet-a-ptvslh",
]);

export async function POST(request: Request) {
  const token = request.headers.get("x-sqc-maintenance-token") ?? "";
  if (token !== maintenanceToken) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const client = await clerkClient();
  let offset = 0;
  let scanned = 0;
  let changedUsers = 0;
  const changedQuests: string[] = [];

  while (true) {
    const users = await client.users.getUserList({ limit: 100, offset, orderBy: "-created_at" });
    scanned += users.data.length;

    for (const user of users.data) {
      const storedQuests = getStoredGroupQuests(user.privateMetadata);
      let changed = false;
      const nextQuests = storedQuests.map((quest) => {
        if (!officialQuestIds.has(quest.id)) return quest;
        if (quest.official === true && quest.officialLabel === "Official SQC Multiplayer Side Quest") return quest;
        changed = true;
        changedQuests.push(quest.id);
        return { ...quest, official: true, officialLabel: "Official SQC Multiplayer Side Quest" };
      });

      if (changed) {
        changedUsers += 1;
        await client.users.updateUserMetadata(user.id, {
          privateMetadata: {
            ...(user.privateMetadata ?? {}),
            sqcGroupQuests: nextQuests,
          },
        });
      }
    }

    if (users.data.length < 100) break;
    offset += users.data.length;
  }

  return NextResponse.json({ ok: true, scanned, changedUsers, changedQuests });
}
