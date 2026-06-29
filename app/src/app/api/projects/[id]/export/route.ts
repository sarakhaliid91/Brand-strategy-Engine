import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { chromium } from "playwright-core";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import {
  getProjectOwnedByUser,
  getProjectSectionsForReview,
} from "@/lib/sections/queries";
import { buildPrintHtml } from "@/lib/export/print-html";
import { resolveChromiumExecutable } from "@/lib/export/chromium";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await getProjectOwnedByUser(projectId, session.user.id);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const sections = await getProjectSectionsForReview(projectId);
  const allApproved = sections.every((s) => s.status === "approved");
  if (!allApproved) {
    return NextResponse.json(
      { error: "All sections must be approved before exporting." },
      { status: 409 },
    );
  }

  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, project.clientId))
    .limit(1);

  const html = buildPrintHtml({
    projectName: project.name,
    clientName: client?.name ?? "",
    language: project.language,
    sections: sections.map((s) => ({ type: s.type, content: s.content })),
  });

  const executablePath = resolveChromiumExecutable();
  const browser = await chromium.launch({
    executablePath,
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });

    const safeName = project.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    return new NextResponse(pdf as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName || "brand-strategy"}.pdf"`,
      },
    });
  } finally {
    await browser.close();
  }
}
