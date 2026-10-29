import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  readDb,
  getContactLists,
  createContactList,
  deleteContactList,
  getContacts,
  createContact,
  bulkImportContacts,
  deleteContact,
} from "@/lib/store";
import { validateEmail, sanitizeText } from "@/lib/validation";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const listId = searchParams.get("listId") || "all";
    const search = searchParams.get("search") || "";

    const cookieStore = await cookies();
    const token = cookieStore.get("zega_session")?.value;
    const db = readDb();

    let orgId = "org_acme_001";
    if (token) {
      const session = db.sessions?.find((s) => s.token === token);
      if (session) {
        const user = db.users?.find((u) => u.id === session.userId);
        if (user?.orgId) orgId = user.orgId;
      }
    }

    const lists = getContactLists(orgId);
    const contacts = getContacts(orgId, listId, search);

    return NextResponse.json({
      success: true,
      lists,
      contacts,
      totalCount: contacts.length,
    });
  } catch (err: any) {
    console.error("GET /api/contacts error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch contacts." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const cookieStore = await cookies();
    const token = cookieStore.get("zega_session")?.value;
    const db = readDb();

    let orgId = "org_acme_001";
    if (token) {
      const session = db.sessions?.find((s) => s.token === token);
      if (session) {
        const user = db.users?.find((u) => u.id === session.userId);
        if (user?.orgId) orgId = user.orgId;
      }
    }

    // 1. Action: Create New Contact List
    if (body.action === "create_list") {
      const listName = sanitizeText(body.name || "", 60).trim();
      if (!listName) {
        return NextResponse.json({ success: false, error: "Please enter a valid list name." }, { status: 400 });
      }

      const description = sanitizeText(body.description || "", 200).trim();
      const color = body.color || "blue";
      const newList = createContactList(orgId, listName, description, color);

      return NextResponse.json({
        success: true,
        message: `List "${listName}" created successfully.`,
        list: newList,
      });
    }

    // 2. Action: Bulk Import Contacts (from CSV / pasted data)
    if (body.action === "bulk_import") {
      const items = Array.isArray(body.contacts) ? body.contacts : [];
      const listId = body.listId || "lst_general";

      if (items.length === 0) {
        return NextResponse.json({ success: false, error: "No valid contact rows found in payload." }, { status: 400 });
      }

      const result = bulkImportContacts(orgId, listId, items);

      return NextResponse.json({
        success: true,
        added: result.added,
        contacts: result.contacts,
        message: `Successfully imported ${result.added} contacts into target list.`,
      });
    }

    // 3. Action: Add Single Contact
    const emailCheck = validateEmail(body.email || "", "Contact Email");
    if (!emailCheck.isValid) {
      return NextResponse.json({ success: false, error: emailCheck.error }, { status: 400 });
    }

    const contact = createContact(orgId, {
      name: sanitizeText(body.name || body.email.split("@")[0], 70),
      firstName: sanitizeText(body.firstName || "", 50),
      lastName: sanitizeText(body.lastName || "", 50),
      email: emailCheck.value,
      company: sanitizeText(body.company || "Independent", 70),
      jobTitle: sanitizeText(body.jobTitle || "Lead", 70),
      phone: sanitizeText(body.phone || "", 30),
      listId: body.listId || "lst_general",
      relationship: body.relationship || "Prospect Lead",
      relationshipColor: body.relationshipColor || "blue",
      notes: sanitizeText(body.notes || "", 500),
    });

    return NextResponse.json({
      success: true,
      message: "Contact added successfully.",
      contact,
    });
  } catch (err: any) {
    console.error("POST /api/contacts error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to save contact." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type") || "contact";

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID to delete." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("zega_session")?.value;
    const db = readDb();

    let orgId = "org_acme_001";
    if (token) {
      const session = db.sessions?.find((s) => s.token === token);
      if (session) {
        const user = db.users?.find((u) => u.id === session.userId);
        if (user?.orgId) orgId = user.orgId;
      }
    }

    if (type === "list") {
      const deleted = deleteContactList(orgId, id);
      return NextResponse.json({ success: deleted, message: "Contact list deleted." });
    } else {
      const deleted = deleteContact(orgId, id);
      return NextResponse.json({ success: deleted, message: "Contact deleted." });
    }
  } catch (err: any) {
    console.error("DELETE /api/contacts error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete item." }, { status: 500 });
  }
}
