import "./types.d.ts";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-expect-error: npm imports are supported by the Supabase Edge runtime
import nodemailer from "npm:nodemailer@6.9.13";
// @ts-expect-error: JSR imports are supported by the Supabase Edge runtime
import { createClient } from "jsr:@supabase/supabase-js@2";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type NotifyLeadPayload = {
  full_name?: unknown;
  phone?: unknown;
  address?: unknown;
  package?: unknown;
  total_price?: unknown;
  notes?: unknown;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as NotifyLeadPayload;
    const full_name = typeof body.full_name === "string" ? body.full_name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";
    const pkg = body.package === "2_bottle" ? "2_bottle" : "1_bottle";
    const totalPrice = Number(body.total_price);
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";

    if (!full_name || !phone || !address || !Number.isFinite(totalPrice)) {
      return new Response(
        JSON.stringify({ error: "Invalid lead payload." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD");

    if (!gmailUser || !gmailAppPassword) {
      console.warn("Gmail credentials not configured; skipping email notification.");
      return new Response(
        JSON.stringify({ success: true, email_sent: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch only active recipient emails from DB
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: emailRows } = await supabase
      .from("notification_emails")
      .select("email")
      .eq("active", true);
    const recipients = emailRows?.map((r: { email: string }) => r.email) ?? ["zynergia.online.tsp@gmail.com"];

    const packageLabel = pkg === "2_bottle" ? "2 Bottles" : "1 Bottle";
    const priceFormatted = `PHP ${totalPrice.toLocaleString("en-PH")}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailAppPassword },
    });

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d6a4f; border-bottom: 2px solid #2d6a4f; padding-bottom: 10px;">
          New Order - Nature's Finest Guyabano Wine
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr style="background: #f0f9f4;">
            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Customer Name</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${full_name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Phone Number</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${phone}</td>
          </tr>
          <tr style="background: #f0f9f4;">
            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Delivery Address</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${address}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Package</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${packageLabel}</td>
          </tr>
          <tr style="background: #f0f9f4;">
            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Total Price</td>
            <td style="padding: 10px; border: 1px solid #ddd; color: #2d6a4f; font-weight: bold;">&#8369;${totalPrice.toLocaleString("en-PH")}</td>
          </tr>
          ${notes ? `<tr>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Notes</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${notes}</td>
          </tr>` : ""}
        </table>
        <p style="margin-top: 20px; color: #666; font-size: 12px;">
          This notification was sent automatically from your Guyabano Wine landing page.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Nature's Finest Orders" <${gmailUser}>`,
      to: recipients,
      subject: `New Order: ${full_name} - ${packageLabel} (${priceFormatted})`,
      html: htmlBody,
    });

    return new Response(
      JSON.stringify({ success: true, email_sent: true, recipients }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("notify-lead error:", err);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
